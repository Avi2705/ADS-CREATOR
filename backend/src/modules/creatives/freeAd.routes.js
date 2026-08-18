"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const freeAd_controller_1 = require("./freeAd.controller");
const router = (0, express_1.Router)();
router.get('/status', freeAd_controller_1.getFreeAdStatus);
router.post('/generate', freeAd_controller_1.generateFreeAd);
router.get('/public-showcase', freeAd_controller_1.getPublicShowcaseAds);
exports.default = router;
//# sourceMappingURL=freeAd.routes.js.map