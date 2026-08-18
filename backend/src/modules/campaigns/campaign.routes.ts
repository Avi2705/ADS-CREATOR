import { Router } from 'express';
import { createCampaign, bulkLaunchAds } from './campaign.controller';
import { requireAuth, requireTenant, requireRole } from '../../middleware/tenant.middleware';

const router = Router();

// All campaign routes require authentication and a valid tenant context
router.use(requireAuth);
router.use(requireTenant);

router.post('/', requireRole(['BUSINESS_OWNER', 'MANAGER']), createCampaign);
router.post('/:campaignId/bulk-launch', requireRole(['BUSINESS_OWNER', 'MANAGER']), bulkLaunchAds);

export default router;
