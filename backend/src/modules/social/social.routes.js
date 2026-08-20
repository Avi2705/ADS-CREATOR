"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const social_controller_1 = require("./social.controller");
const metaInsights_service_1 = require("./metaInsights.service");
const router = (0, express_1.Router)();
// Save / update a connected social account credential
router.post('/accounts', social_controller_1.connectAccount);
router.delete('/accounts/:platform', social_controller_1.disconnectAccount);
router.get('/accounts/:userId', social_controller_1.getConnectedAccounts);
// WhatsApp Cloud API Direct Broadcast
router.post('/whatsapp/broadcast', social_controller_1.sendWhatsAppBroadcast);
// Dispatch a post to one or more connected platforms
router.post('/publish', social_controller_1.publishPost);
// Social posts database routes
router.get('/posts', social_controller_1.getSocialPosts);
router.delete('/posts/:postId', social_controller_1.deleteSocialPost);
// Meta Marketing API Insights Sync Route
router.post('/sync-insights', async (req, res) => {
    try {
        await (0, metaInsights_service_1.syncAllMetaAdInsights)();
        res.json({ success: true, message: 'Meta Marketing API Insights synced successfully.' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=social.routes.js.map