"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const b2cRequest_controller_1 = require("./b2cRequest.controller");
const router = (0, express_1.Router)();
// B2C Customer Routes
router.post('/', b2cRequest_controller_1.createB2CRequest);
router.get('/my-requests', b2cRequest_controller_1.getMyRequests);
router.post('/:id/revision', b2cRequest_controller_1.requestRevision);
router.post('/:id/approve', b2cRequest_controller_1.approveCreative);
// Super Admin Routes
router.get('/admin/all', b2cRequest_controller_1.getAllB2CRequests);
router.post('/admin/:id/create-ad', b2cRequest_controller_1.adminCreateAd);
router.post('/admin/:id/create-video', b2cRequest_controller_1.adminCreateVideo);
router.post('/admin/:id/publish', b2cRequest_controller_1.adminPublishCreative);
exports.default = router;
//# sourceMappingURL=b2cRequest.routes.js.map