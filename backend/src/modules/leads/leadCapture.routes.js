"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerLead_model_1 = __importDefault(require("./customerLead.model"));
const adInteraction_model_1 = __importDefault(require("./adInteraction.model"));
const social_model_1 = require("../social/social.model");
const mongoose_1 = __importDefault(require("mongoose"));
const mail_service_1 = require("../../services/mail.service");
const router = (0, express_1.Router)();
/**
 * 1. Capture Lead when a customer clicks "I'm Interested" or submits an Ad Form / Transmit Inquiry
 */
router.post('/capture', async (req, res) => {
    try {
        const { userId, adId, postId, name, phone, whatsapp, company, inquiryType, email, location, source, notes, message, value } = req.body;
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Name and email address are required to transmit inquiry.'
            });
        }
        const refId = `LEAD-${Date.now().toString().slice(-6)}`;
        const custObjectId = mongoose_1.default.Types.ObjectId.isValid(userId) ? new mongoose_1.default.Types.ObjectId(userId) : new mongoose_1.default.Types.ObjectId();
        const formattedNotes = [
            message || notes || `Expressed interest in Ad ${adId || ''}`,
            whatsapp ? `WhatsApp: ${whatsapp}` : null,
            company ? `Company: ${company}` : null,
            inquiryType ? `Topic: ${inquiryType}` : null
        ].filter(Boolean).join(' • ');
        const newLead = await customerLead_model_1.default.create({
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
        (0, mail_service_1.sendInquiryNotificationEmail)({
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
        if (postId && mongoose_1.default.Types.ObjectId.isValid(postId)) {
            postDoc = await social_model_1.SocialPost.findByIdAndUpdate(postId, {
                $inc: { leads: 1, clicks: 1 }
            }, { new: true });
        }
        else if (adId) {
            postDoc = await social_model_1.SocialPost.findOneAndUpdate({ adId }, {
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
    }
    catch (error) {
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
router.get('/customer/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const uStr = String(userId).trim();
        const query = {
            $or: [
                { customerRefId: uStr },
                { customerRefId: { $regex: uStr, $options: 'i' } }
            ]
        };
        const leads = await customerLead_model_1.default.find(query).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: leads.length,
            leads
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
/**
 * 3. Fetch All Live Webhook Ad Interactions (Likes, Comments, Shares, Clicks, Leads)
 */
router.get('/interactions', async (req, res) => {
    try {
        const interactions = await adInteraction_model_1.default.find().sort({ createdAt: -1 }).limit(100);
        return res.status(200).json({
            success: true,
            count: interactions.length,
            interactions
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=leadCapture.routes.js.map