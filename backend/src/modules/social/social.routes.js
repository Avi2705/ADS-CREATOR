"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const social_controller_1 = require("./social.controller");
const router = (0, express_1.Router)();
// Save / update a connected social account credential
router.post('/accounts', social_controller_1.connectAccount);
router.delete('/accounts/:platform', social_controller_1.disconnectAccount);
router.get('/accounts/:userId', social_controller_1.getConnectedAccounts);
// Dispatch a post to one or more connected platforms
router.post('/publish', social_controller_1.publishPost);
// Social posts database routes
router.get('/posts', social_controller_1.getSocialPosts);
router.delete('/posts/:postId', social_controller_1.deleteSocialPost);
exports.default = router;
//# sourceMappingURL=social.routes.js.map