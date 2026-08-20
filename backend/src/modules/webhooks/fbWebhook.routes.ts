import { Router, Request, Response } from 'express';
import { SocialPost, IWhatsAppDeliveryDetails } from '../social/social.model';
import CustomerLead from '../leads/customerLead.model';
import AdInteraction from '../leads/adInteraction.model';
import mongoose from 'mongoose';
import { sendInquiryNotificationEmail } from '../../services/mail.service';
import { fetchMetaLeadDetails } from '../social/metaInsights.service';

const router = Router();

/**
 * Helper: Process WhatsApp Webhook Delivery Status Events (sent, delivered, read, failed)
 */
export async function processWhatsAppWebhookStatus(body: any) {
  if (!body || body.object !== 'whatsapp_business_account') return;

  const entries = body.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const value = change.value || {};
      const statuses = value.statuses || [];

      for (const statusObj of statuses) {
        const messageId = statusObj.id; // e.g. "wamid.HBgL..."
        const status = statusObj.status; // "sent", "delivered", "read", "failed"
        const recipient = statusObj.recipient_id;
        const timestamp = statusObj.timestamp ? new Date(parseInt(statusObj.timestamp) * 1000) : new Date();

        console.log(`⚡ [WhatsApp Webhook Event] Message ID: ${messageId} | Status: ${status?.toUpperCase()} | Recipient: ${recipient || 'N/A'}`);

        if (!messageId) continue;

        // Find post in SocialPost collection matching messageId
        const post = await SocialPost.findOne({
          $or: [
            { 'whatsappDelivery.messageId': messageId },
            { postId: messageId },
            { platformPostId: messageId }
          ]
        });

        if (post) {
          const delivery: IWhatsAppDeliveryDetails = post.whatsappDelivery || { messageId, recipient };
          delivery.messageId = messageId;
          if (recipient) delivery.recipient = recipient;

          if (status === 'sent') {
            delivery.deliveryStatus = 'SENT';
            delivery.sentAt = timestamp;
            post.status = 'API_ACCEPTED';
          } else if (status === 'delivered') {
            delivery.deliveryStatus = 'DELIVERED';
            delivery.deliveredAt = timestamp;
            post.status = 'PUBLISHED';
          } else if (status === 'read') {
            delivery.deliveryStatus = 'READ';
            delivery.readAt = timestamp;
            post.status = 'PUBLISHED';
          } else if (status === 'failed') {
            delivery.deliveryStatus = 'FAILED';
            delivery.failedAt = timestamp;
            post.status = 'FAILED';

            const errObj = statusObj.errors?.[0] || {};
            delivery.error = {
              code: errObj.code || 'UNKNOWN',
              title: errObj.title || 'Delivery Failed',
              message: errObj.message || 'WhatsApp Cloud API Delivery Failed',
              details: errObj.error_data?.details || errObj.message || 'Message undeliverable to target recipient number'
            };
            console.error(`❌ [WhatsApp Webhook Delivery Failed] Message ID: ${messageId} | Code: ${delivery.error.code} | Details: ${delivery.error.details}`);
          }

          post.whatsappDelivery = delivery;
          await post.save();
          console.log(`✅ [SocialPost Updated via Webhook] Post ID: ${post._id} | WhatsApp Status: ${delivery.deliveryStatus}`);
        } else {
          console.warn(`⚠️ [WhatsApp Webhook] No matching SocialPost document found for messageId: ${messageId}`);
        }
      }
    }
  }
}

/**
 * 1. WhatsApp & Meta Webhook Verification Challenge (GET)
 */
router.get(['/whatsapp', '/facebook'], (req: Request, res: Response) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.FB_WEBHOOK_VERIFY_TOKEN || process.env.META_WEBHOOK_TOKEN || 'adhunter_webhook_secret_2026';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WhatsApp/Meta Webhook Verified Successfully]');
      return res.status(200).send(challenge);
    } else {
      console.warn('[WhatsApp/Meta Webhook Verification Failed]: Token mismatch or invalid mode.');
      return res.sendStatus(403);
    }
  } catch (error) {
    console.error('Meta webhook verify error:', error);
    return res.sendStatus(500);
  }
});

/**
 * 2. Meta / WhatsApp / Facebook & Instagram Webhook Event Handler (POST)
 */
router.post(['/whatsapp', '/facebook'], async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Check if event is WhatsApp Cloud API status update
    if (body && body.object === 'whatsapp_business_account') {
      console.log('[WhatsApp Cloud API Webhook Event Received]:', JSON.stringify(body, null, 2));
      await processWhatsAppWebhookStatus(body);
      return res.status(200).send('EVENT_RECEIVED');
    }

    console.log('[Meta Webhook Event Payload Received]:', JSON.stringify(body, null, 2));

    if (body.object === 'page' || body.object === 'instagram') {
      const entries = body.entry || [];
      const platformName = body.object === 'instagram' ? 'Instagram' : 'Facebook';

      for (const entry of entries) {
        if (entry.changes) {
          for (const change of entry.changes) {
            const field = change.field;
            const value = change.value || {};

            // 1. Leadgen Event (Meta Instant Lead Form Submission)
            if (field === 'leadgen') {
              const leadgenId = value.leadgen_id;
              const pageId = value.page_id;
              const formId = value.form_id;

              console.log(`⚡ [FB Webhook] New Leadgen Event Received! ID: ${leadgenId}`);

              const token = process.env.META_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN || 'IGAA4sOkrE...';

              // Fetch customer PII details from Meta Marketing API
              const metaLead = await fetchMetaLeadDetails(leadgenId, token);
              
              if (!metaLead) {
                const refId = `FB-LEAD-${Date.now().toString().slice(-6)}`;
                const newLead = await CustomerLead.create({
                  referenceId: refId,
                  customerId: new mongoose.Types.ObjectId(),
                  customerRefId: 'fb-lead',
                  name: value.name || value.full_name || 'Meta Ad Prospect',
                  email: (value.email || 'lead@facebook.com').toLowerCase(),
                  phone: value.phone_number || value.phone || 'N/A',
                  source: `Meta Lead Form (ID: ${formId || leadgenId})`,
                  notes: `Captured via Webhook • Leadgen ID: ${leadgenId}`,
                  status: 'NEW',
                  value: 0
                });

                // Also log in AdInteraction DB table
                await AdInteraction.create({
                  referenceId: `INT-${Date.now().toString().slice(-6)}`,
                  postId: value.post_id || leadgenId,
                  platform: platformName,
                  interactionType: 'LEAD',
                  userName: newLead.name,
                  userEmail: newLead.email,
                  userPhone: newLead.phone,
                  metadata: value
                });

                sendInquiryNotificationEmail({
                  name: newLead.name,
                  email: newLead.email,
                  phone: newLead.phone,
                  source: newLead.source,
                  message: newLead.notes
                }).catch(err => console.warn('Lead notification email error:', err));
              }
            }

            // 2. Feed / Reaction / Like / Comment / Share Event
            if (field === 'feed' || field === 'comments' || field === 'reactions' || field === 'likes' || field === 'shares') {
              const postId = value.post_id || value.media_id || entry.id;
              const verb = value.verb || value.item || field;
              const userName = value.from?.name || value.sender_name || value.user_name || `${platformName} User`;

              let type: 'LIKE' | 'COMMENT' | 'SHARE' | 'CLICK' | 'VIEW' = 'CLICK';
              if (field === 'likes' || verb === 'like' || verb === 'reaction') {
                type = 'LIKE';
              } else if (field === 'comments' || verb === 'comment') {
                type = 'COMMENT';
              } else if (field === 'shares' || verb === 'share') {
                type = 'SHARE';
              } else {
                type = 'CLICK';
              }

              console.log(`⚡ [Meta Webhook] ${type} by "${userName}" on ${platformName} Post ${postId}`);

              // Store interaction record in MongoDB AdInteraction collection
              const interactionRef = `INT-${Date.now().toString().slice(-6)}`;
              await AdInteraction.create({
                referenceId: interactionRef,
                postId: String(postId || 'post-general'),
                platform: platformName,
                interactionType: type,
                userName,
                commentText: value.message || value.comment_text || undefined,
                metadata: value
              });

              // Increment MongoDB counters on SocialPost document
              if (postId) {
                const incUpdate: any = {};
                if (type === 'LIKE') incUpdate.likes = 1;
                else if (type === 'COMMENT') incUpdate.comments = 1;
                else if (type === 'SHARE') incUpdate.shares = 1;
                else incUpdate.clicks = 1;

                await SocialPost.updateMany(
                  {
                    $or: [
                      { postId: String(postId) },
                      { platformPostId: String(postId) },
                      { adId: String(postId) }
                    ]
                  },
                  { $inc: incUpdate }
                );
              }

              // Dispatch notification email for high-intent interactions (Comments / Shares)
              if (type === 'COMMENT' || type === 'SHARE') {
                sendInquiryNotificationEmail({
                  name: userName,
                  email: `${userName.toLowerCase().replace(/\s+/g, '')}@${platformName.toLowerCase()}.user`,
                  source: `${platformName} ${type} Notification`,
                  message: value.message || `Performed ${type} action on post ${postId}`
                }).catch(mailErr => console.warn('Interaction notification notice:', mailErr));
              }
            }
          }
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.status(200).send('EVENT_RECEIVED');
  } catch (error: any) {
    console.error('FB Webhook Error:', error);
    return res.status(200).send('EVENT_RECEIVED');
  }
});

/**
 * 3. Webhook Metrics Simulator Endpoint (POST)
 * Used by frontend dashboards to trigger instant live updates to likes, views, clicks, and leads!
 */
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { postId, adId, type, count = 1 } = req.body;

    const incField = type === 'like' ? 'likes' : type === 'view' ? 'impressions' : type === 'click' ? 'clicks' : 'leads';

    let query: any = {};
    if (postId) {
      query = { $or: [{ _id: mongoose.Types.ObjectId.isValid(postId) ? postId : undefined }, { postId }, { platformPostId: postId }] };
    } else if (adId) {
      query = { adId };
    } else {
      query = {}; // Update latest active post
    }

    const updated = await SocialPost.findOneAndUpdate(
      query,
      { $inc: { [incField]: Number(count) } },
      { new: true, sort: { createdAt: -1 } }
    );

    console.log(`[Metrics Simulated] Updated ${incField} +${count} on post:`, updated?._id);

    return res.json({
      success: true,
      message: `Simulated ${type} event (+${count}) via Webhook API`,
      post: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
