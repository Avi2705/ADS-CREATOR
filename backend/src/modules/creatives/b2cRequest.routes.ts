import { Router } from 'express';
import {
  createB2CRequest,
  getMyRequests,
  requestRevision,
  approveCreative,
  getAllB2CRequests,
  adminCreateAd,
  adminCreateVideo,
  adminPublishCreative
} from './b2cRequest.controller';

const router = Router();

// B2C Customer Routes
router.post('/', createB2CRequest);
router.get('/my-requests', getMyRequests);
router.post('/:id/revision', requestRevision);
router.post('/:id/approve', approveCreative);

// Super Admin Routes
router.get('/admin/all', getAllB2CRequests);
router.post('/admin/:id/create-ad', adminCreateAd);
router.post('/admin/:id/create-video', adminCreateVideo);
router.post('/admin/:id/publish', adminPublishCreative);

export default router;
