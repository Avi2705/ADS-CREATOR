import { Router } from 'express';
import {
  connectAccount,
  disconnectAccount,
  getConnectedAccounts,
  publishPost
} from './social.controller';

const router = Router();

// Save / update a connected social account credential
router.post('/accounts', connectAccount);
router.delete('/accounts/:platform', disconnectAccount);
router.get('/accounts/:userId', getConnectedAccounts);

// Dispatch a post to one or more connected platforms
router.post('/publish', publishPost);

export default router;
