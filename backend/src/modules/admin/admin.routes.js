"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const adminController = __importStar(require("./admin.controller"));
const router = (0, express_1.Router)();
// Base middleware for all admin routes - must be authenticated and at least have some admin access
router.use(tenant_middleware_1.requireAuth);
// Dashboard Overview - Requires Analytics View permission
router.get('/dashboard', (0, tenant_middleware_1.requirePermission)('ANALYTICS_VIEW'), adminController.getDashboardStats);
// B2C Customer Management
router.get('/b2c/customers', (0, tenant_middleware_1.requirePermission)('CUSTOMERS_VIEW'), adminController.getB2CCustomers);
router.post('/b2c/customers', (0, tenant_middleware_1.requirePermission)('CUSTOMERS_VIEW'), adminController.createB2CCustomer);
// B2B Business Management
router.get('/b2b/businesses', (0, tenant_middleware_1.requirePermission)('CUSTOMERS_VIEW'), adminController.getB2BBusinesses);
router.post('/b2b/businesses', (0, tenant_middleware_1.requirePermission)('CUSTOMERS_VIEW'), adminController.createB2BBusiness);
// Employee Management
router.post('/employees', adminController.createEmployee);
router.get('/employees', adminController.getEmployees);
router.post('/assign-lead', adminController.assignLeadToEmployee);
router.post('/convert-lead', adminController.convertLeadToCustomer);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map