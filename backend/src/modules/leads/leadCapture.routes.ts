import { Router, Request, Response } from 'express';
import CustomerLead from './customerLead.model';
import AdInteraction from './adInteraction.model';
import { SocialPost } from '../social/social.model';
import mongoose from 'mongoose';
import { sendInquiryNotificationEmail } from '../../services/mail.service';

const router = Router();

/**
 * 1. Capture Lead when a customer clicks "I'm Interested" or submits an Ad Form / Transmit Inquiry
 */
router.post('/capture', async (req: Request, res: Response) => {
  try {
    const { userId, adId, postId, name, phone, whatsapp, company, inquiryType, email, location, source, notes, message, value } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email address are required to transmit inquiry.'
      });
    }

    const refId = `LEAD-${Date.now().toString().slice(-6)}`;
    const custObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : new mongoose.Types.ObjectId();

    const formattedNotes = [
      message || notes || `Expressed interest in Ad ${adId || ''}`,
      whatsapp ? `WhatsApp: ${whatsapp}` : null,
      company ? `Company: ${company}` : null,
      inquiryType ? `Topic: ${inquiryType}` : null
    ].filter(Boolean).join(' • ');

    const newLead = await CustomerLead.create({
      referenceId: refId,
      customerId: custObjectId,
      customerRefId: String(userId || 'b2c-client'),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : 'N/A',
      location: location || 'India',
      source: source || "Inquiry Form Transmit",
      notes: formattedNotes,
      status: 'NEW',
      value: value ? parseFloat(value) : 0
    });

    // Send email notification to ADMIN_EMAIL in .env
    sendInquiryNotificationEmail({
      name,
      email,
      phone,
      whatsapp,
      company,
      inquiryType,
      message: message || notes,
      source: source || "Transmit Inquiry Form"
    }).catch(mailErr => console.warn('[Inquiry Mail Notice]:', mailErr));

    // Increment lead & click counters on SocialPost document in MongoDB
    let postDoc = null;
    if (postId && mongoose.Types.ObjectId.isValid(postId)) {
      postDoc = await SocialPost.findByIdAndUpdate(postId, {
        $inc: { leads: 1, clicks: 1 }
      }, { new: true });
    } else if (adId) {
      postDoc = await SocialPost.findOneAndUpdate({ adId }, {
        $inc: { leads: 1, clicks: 1 }
      }, { new: true });
    }

    console.log(`[Lead Captured to MongoDB] Reference: ${refId}, Name: ${name}, Email: ${email}, Phone: ${phone}, WhatsApp: ${whatsapp || 'N/A'}`);

    return res.status(201).json({
      success: true,
      message: '🎉 Thank you! Your claim request has been submitted. Our team will contact you on WhatsApp shortly.',
      lead: newLead,
      post: postDoc
    });
  } catch (error: any) {
    console.error('Lead capture error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to capture lead'
    });
  }
});

/**
 * 2. Fetch Captured Leads for B2C or B2B Customer Dashboard
 */
router.get('/customer/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const uStr = String(userId).trim();

    const query = {
      $or: [
        { customerRefId: uStr },
        { customerRefId: { $regex: uStr, $options: 'i' } }
      ]
    };

    const leads = await CustomerLead.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 3. Fetch All Live Webhook Ad Interactions (Likes, Comments, Shares, Clicks, Leads)
 */
router.get('/interactions', async (req: Request, res: Response) => {
  try {
    const interactions = await AdInteraction.find().sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({
      success: true,
      count: interactions.length,
      interactions
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
