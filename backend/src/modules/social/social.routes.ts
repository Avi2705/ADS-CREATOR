import { Router } from 'express';
import {
  connectAccount,
  disconnectAccount,
  getConnectedAccounts,
  publishPost,
  getSocialPosts,
  deleteSocialPost,
  sendWhatsAppBroadcast
} from './social.controller';

import { syncAllMetaAdInsights } from './metaInsights.service';

const router = Router();

// Save / update a connected social account credential
router.post('/accounts', connectAccount);
router.delete('/accounts/:platform', disconnectAccount);
router.get('/accounts/:userId', getConnectedAccounts);

// WhatsApp Cloud API Direct Broadcast
router.post('/whatsapp/broadcast', sendWhatsAppBroadcast);

// Dispatch a post to one or more connected platforms
router.post('/publish', publishPost);

// Social posts database routes
router.get('/posts', getSocialPosts);
router.delete('/posts/:postId', deleteSocialPost);

// Meta Marketing API Insights Sync Route
router.post('/sync-insights', async (req, res) => {
  try {
    await syncAllMetaAdInsights();
    res.json({ success: true, message: 'Meta Marketing API Insights synced successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
