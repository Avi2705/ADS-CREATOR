"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/refresh', auth_controller_1.refresh);
// Password recovery & Nodemailer reset routes
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.post('/verify-otp', auth_controller_1.verifyOtp);
router.post('/reset-password', auth_controller_1.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map