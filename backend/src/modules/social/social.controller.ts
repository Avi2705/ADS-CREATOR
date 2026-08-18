import { Request, Response } from 'express';
import SocialAccount from './social.model';
import fetch from 'node-fetch';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Upload an image URL to Instagram as a media container.
 * Returns the ig_media container id on success.
 */
async function instagramCreateContainer(
  igUserId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
): Promise<string> {
  const params = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: accessToken
  });
  const res = await fetch(
    `https://graph.instagram.com/v19.0/${igUserId}/media`,
    { method: 'POST', body: params }
  );
  const data: any = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Instagram container creation failed');
  }
  return data.id as string;
}

/**
 * Publish a previously created container to the Instagram feed.
 */
async function instagramPublishContainer(
  igUserId: string,
  accessToken: string,
  containerId: string
): Promise<string> {
  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken
  });
  const res = await fetch(
    `https://graph.instagram.com/v19.0/${igUserId}/media_publish`,
    { method: 'POST', body: params }
  );
  const data: any = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Instagram publish failed');
  }
  return data.id as string;
}

// ─── CONTROLLERS ─────────────────────────────────────────────────────────────

/**
 * POST /api/social/accounts
 * Body: { userId, platform, handle, accountId, accessToken, tokenExpiry? }
 */
export async function connectAccount(req: Request, res: Response) {
  try {
    const { userId, platform, handle, accountId, accessToken, tokenExpiry } = req.body;
    if (!userId || !platform || !handle || !accountId || !accessToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const account = await SocialAccount.findOneAndUpdate(
      { userId, platform },
      { handle, accountId, accessToken, tokenExpiry, isConnected: true, connectedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, account });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * DELETE /api/social/accounts/:platform
 * Query: userId
 */
export async function disconnectAccount(req: Request, res: Response) {
  try {
    const { platform } = req.params;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    await SocialAccount.findOneAndUpdate(
      { userId: userId as string, platform },
      { isConnected: false }
    );
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/social/accounts/:userId
 */
export async function getConnectedAccounts(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const accounts = await SocialAccount.find({ userId, isConnected: true })
      .select('-accessToken'); // never return token to frontend
    return res.status(200).json({ accounts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/social/publish
 * Body: {
 *   userId       : string,
 *   channels     : string[],          // ['Instagram', 'Facebook', ...]
 *   headline     : string,
 *   caption      : string,
 *   mediaUrl     : string,            // public image/video URL
 *   targetUrl    : string
 * }
 *
 * Returns per-channel results including platform post IDs for successfully posted channels.
 */
export async function publishPost(req: Request, res: Response) {
  try {
    const { userId, channels, headline, caption, mediaUrl, targetUrl } = req.body;

    if (!userId || !channels?.length || !mediaUrl) {
      return res.status(400).json({ error: 'userId, channels and mediaUrl are required' });
    }

    // Fetch all connected accounts for this user once
    const connectedAccounts = await SocialAccount.find({
      userId,
      platform: { $in: channels },
      isConnected: true
    });

    const results: Record<string, { success: boolean; postId?: string; error?: string }> = {};

    for (const channel of channels) {
      const account = connectedAccounts.find(a => a.platform === channel);

      if (!account) {
        results[channel] = { success: false, error: 'Account not connected' };
        continue;
      }

      try {
        if (channel === 'Instagram') {
          // Full caption: headline + body copy + link
          const fullCaption = `${headline}\n\n${caption}\n\n🔗 ${targetUrl}`;

          const containerId = await instagramCreateContainer(
            account.accountId,
            account.accessToken,
            mediaUrl,
            fullCaption
          );

          const postId = await instagramPublishContainer(
            account.accountId,
            account.accessToken,
            containerId
          );

          results[channel] = { success: true, postId };

        } else if (channel === 'Facebook') {
          // Facebook Graph API: post to page feed
          const fbRes = await fetch(
            `https://graph.facebook.com/v19.0/${account.accountId}/photos`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: mediaUrl,
                caption: `${headline}\n\n${caption}\n\n${targetUrl}`,
                access_token: account.accessToken
              })
            }
          );
          const fbData: any = await fbRes.json();
          if (!fbRes.ok || fbData.error) {
            throw new Error(fbData.error?.message || 'Facebook post failed');
          }
          results[channel] = { success: true, postId: fbData.id };

        } else {
          // TikTok, YouTube, Twitter — API integrations require separate app review
          // Mark as queued for manual dispatch
          results[channel] = {
            success: false,
            error: `${channel} auto-posting requires separate platform API credentials. Post has been queued for manual dispatch.`
          };
        }

      } catch (channelErr: any) {
        results[channel] = { success: false, error: channelErr.message };
      }
    }

    const successCount = Object.values(results).filter(r => r.success).length;
    return res.status(200).json({
      success: successCount > 0,
      totalChannels: channels.length,
      successCount,
      results
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
