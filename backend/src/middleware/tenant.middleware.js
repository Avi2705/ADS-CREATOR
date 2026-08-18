"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSubscriptionLimits = exports.requirePermission = exports.requireRole = exports.requireTenant = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.requireAuth = requireAuth;
const requireTenant = (req, res, next) => {
    if (!req.user || !req.user.tenantId) {
        res.status(403).json({ message: 'Tenant context is required for this action' });
        return;
    }
    // The tenantId is now guaranteed to exist on req.user
    next();
};
exports.requireTenant = requireTenant;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden: Insufficient role permissions' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
const Role_1 = __importDefault(require("../modules/admin/models/Role"));
const requirePermission = (requiredPermission) => {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (req.user.role === 'SUPER_ADMIN') {
            next();
            return;
        }
        try {
            const roleDoc = await Role_1.default.findOne({ name: req.user.role });
            if (!roleDoc || !roleDoc.permissions.includes(requiredPermission)) {
                res.status(403).json({ message: `Forbidden: Requires permission ${requiredPermission}` });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error checking permissions' });
        }
    };
};
exports.requirePermission = requirePermission;
const Subscription_1 = __importDefault(require("../modules/admin/models/Subscription"));
const SubscriptionPlan_1 = __importDefault(require("../modules/admin/models/SubscriptionPlan"));
const checkSubscriptionLimits = (limitKey) => {
    return async (req, res, next) => {
        if (!req.user || !req.user.tenantId) {
            res.status(403).json({ message: 'Tenant context required' });
            return;
        }
        if (req.user.role === 'SUPER_ADMIN') {
            next();
            return;
        }
        try {
            const sub = await Subscription_1.default.findOne({ tenantId: req.user.tenantId, status: 'ACTIVE' });
            if (!sub) {
                res.status(403).json({ message: 'No active subscription found for this tenant.' });
                return;
            }
            const plan = await SubscriptionPlan_1.default.findById(sub.planId);
            if (!plan) {
                res.status(403).json({ message: 'Subscription plan not found.' });
                return;
            }
            const limit = plan[limitKey];
            req.subscriptionLimit = limit;
            next();
        }
        catch (err) {
            res.status(500).json({ message: 'Error checking subscription limits' });
        }
    };
};
exports.checkSubscriptionLimits = checkSubscriptionLimits;
//# sourceMappingURL=tenant.middleware.js.map