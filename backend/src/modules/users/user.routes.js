"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
router.get('/profile', user_controller_1.getProfile);
router.put('/profile', user_controller_1.updateProfile);
exports.default = router;
//# sourceMappingURL=user.routes.js.map