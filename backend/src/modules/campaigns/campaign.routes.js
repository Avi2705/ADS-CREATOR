"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaign_controller_1 = require("./campaign.controller");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const router = (0, express_1.Router)();
// All campaign routes require authentication and a valid tenant context
router.use(tenant_middleware_1.requireAuth);
router.use(tenant_middleware_1.requireTenant);
router.post('/', (0, tenant_middleware_1.requireRole)(['BUSINESS_OWNER', 'MANAGER']), campaign_controller_1.createCampaign);
router.post('/:campaignId/bulk-launch', (0, tenant_middleware_1.requireRole)(['BUSINESS_OWNER', 'MANAGER']), campaign_controller_1.bulkLaunchAds);
exports.default = router;
//# sourceMappingURL=campaign.routes.js.map