"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPublishCreative = exports.adminCreateVideo = exports.adminCreateAd = exports.getAllB2CRequests = exports.approveCreative = exports.requestRevision = exports.getMyRequests = exports.createB2CRequest = void 0;
const b2cRequest_model_1 = __importDefault(require("./b2cRequest.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const AuditLog_1 = __importDefault(require("../admin/models/AuditLog"));
// B2C Customer: Create new advertisement request
const createB2CRequest = async (req, res) => {
    try {
        const userId = req.user?.userId || req.body.userId;
        if (!userId) {
            res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
            return;
        }
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User account not found' } });
            return;
        }
        // Role/CustomerType validation
        if (user.customerType !== 'B2C' && user.role !== 'SUPER_ADMIN') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'CUSTOMER_TYPE_MISMATCH',
                    message: 'Advertisement requests are only available to B2C accounts.'
                }
            });
            return;
        }
        const { brandName, productName, category, price, productUrl, adType, purpose, targetAudience, headlineIdea, ctaIdea, preferredStyle, format, description, mediaAssets } = req.body;
        if (!productName || !category || !purpose || !targetAudience || !description) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Missing required request parameters (Product Name, Category, Purpose, Audience, Description).'
                }
            });
            return;
        }
        const referenceId = `REQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const newRequest = await b2cRequest_model_1.default.create({
            referenceId,
            customerId: user._id,
            customerRefId: user.referenceId,
            customerName: user.name,
            customerEmail: user.email,
            tenantId: user.tenantId,
            brandName: brandName || user.companyName || 'Brand Partner',
            productName,
            category,
            price: price ? parseFloat(price) : undefined,
            productUrl,
            adType: adType || 'Image',
            purpose,
            targetAudience,
            headlineIdea,
            ctaIdea,
            preferredStyle: preferredStyle || 'Modern & Bold',
            format: format || 'Instagram Post (1:1)',
            description,
            mediaAssets: mediaAssets || [],
            status: 'SUBMITTED',
            creativeAssets: [],
            revisions: []
        });
        await AuditLog_1.default.create({
            actorId: user._id,
            actorName: user.name || 'B2C Client',
            action: 'CREATE_B2C_REQUEST',
            entity: 'B2CRequest',
            entityId: newRequest._id.toString(),
            newValue: { referenceId, productName, adType }
        });
        res.status(201).json({
            success: true,
            message: 'Advertisement request submitted successfully.',
            data: newRequest
        });
    }
    catch (error) {
        console.error('createB2CRequest error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.createB2CRequest = createB2CRequest;
// B2C Customer: Get all own requests (Tenant isolated)
const getMyRequests = async (req, res) => {
    try {
        const userId = req.user?.userId || req.query.userId;
        if (!userId) {
            res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
            return;
        }
        const requests = await b2cRequest_model_1.default.find({ customerId: userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    }
    catch (error) {
        console.error('getMyRequests error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.getMyRequests = getMyRequests;
// B2C Customer: Request a revision with feedback notes
const requestRevision = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;
        if (!note) {
            res.status(400).json({ success: false, error: { code: 'NOTE_REQUIRED', message: 'Revision feedback note is required.' } });
            return;
        }
        const b2cReq = await b2cRequest_model_1.default.findById(id);
        if (!b2cReq) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
            return;
        }
        b2cReq.revisions.push({ note, requestedAt: new Date() });
        b2cReq.status = 'REVISION_REQUESTED';
        await b2cReq.save();
        res.json({ success: true, message: 'Revision request sent to ad director.', data: b2cReq });
    }
    catch (error) {
        console.error('requestRevision error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.requestRevision = requestRevision;
// B2C Customer: Approve creative for publishing
const approveCreative = async (req, res) => {
    try {
        const { id } = req.params;
        const b2cReq = await b2cRequest_model_1.default.findById(id);
        if (!b2cReq) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
            return;
        }
        b2cReq.status = 'APPROVED_FOR_PUBLISH';
        await b2cReq.save();
        res.json({ success: true, message: 'Creative approved for publishing.', data: b2cReq });
    }
    catch (error) {
        console.error('approveCreative error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.approveCreative = approveCreative;
// Super Admin: List all requests globally
const getAllB2CRequests = async (req, res) => {
    try {
        const statusFilter = req.query.status;
        const query = {};
        if (statusFilter && statusFilter !== 'ALL') {
            query.status = statusFilter;
        }
        const requests = await b2cRequest_model_1.default.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    }
    catch (error) {
        console.error('getAllB2CRequests error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.getAllB2CRequests = getAllB2CRequests;
// Super Admin: Create Image Advertisement for request (Strictly Admin Only)
const adminCreateAd = async (req, res) => {
    try {
        const userRole = req.user?.role || req.body.role;
        if (userRole !== 'SUPER_ADMIN') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'B2C_AD_CREATION_FORBIDDEN',
                    message: 'Forbidden: B2C customers cannot directly create advertisements. Only Super Admin creates ad creatives.'
                }
            });
            return;
        }
        const { id } = req.params;
        const { headline, primaryText, cta, mediaUrl } = req.body;
        const b2cReq = await b2cRequest_model_1.default.findById(id);
        if (!b2cReq) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
            return;
        }
        const newVersion = (b2cReq.creativeAssets?.length || 0) + 1;
        b2cReq.creativeAssets.push({
            assetType: 'IMAGE',
            url: mediaUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop',
            headline: headline || `SPECIAL OFFER: ${b2cReq.productName}`,
            primaryText: primaryText || `Experience top-tier quality with ${b2cReq.productName}.`,
            cta: cta || 'Shop Collection',
            version: newVersion,
            createdAt: new Date(),
            createdByAdminId: req.user?.userId
        });
        b2cReq.status = 'CREATIVE_READY';
        await b2cReq.save();
        res.json({
            success: true,
            message: 'Advertisement image creative successfully attached to request.',
            data: b2cReq
        });
    }
    catch (error) {
        console.error('adminCreateAd error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.adminCreateAd = adminCreateAd;
// Super Admin: Create Video Advertisement for request (Strictly Admin Only)
const adminCreateVideo = async (req, res) => {
    try {
        const userRole = req.user?.role || req.body.role;
        if (userRole !== 'SUPER_ADMIN') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'B2C_AD_CREATION_FORBIDDEN',
                    message: 'Forbidden: B2C customers cannot directly create video advertisements. Only Super Admin creates video ads.'
                }
            });
            return;
        }
        const { id } = req.params;
        const { headline, primaryText, cta, mediaUrl } = req.body;
        const b2cReq = await b2cRequest_model_1.default.findById(id);
        if (!b2cReq) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
            return;
        }
        const newVersion = (b2cReq.creativeAssets?.length || 0) + 1;
        b2cReq.creativeAssets.push({
            assetType: 'VIDEO',
            url: mediaUrl || 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&fit=crop',
            headline: headline || `VIRAL HOOK: ${b2cReq.productName}`,
            primaryText: primaryText || `High-converting 15-second kinetic video reel for ${b2cReq.productName}.`,
            cta: cta || 'Order Today',
            version: newVersion,
            createdAt: new Date(),
            createdByAdminId: req.user?.userId
        });
        b2cReq.status = 'CREATIVE_READY';
        await b2cReq.save();
        res.json({
            success: true,
            message: 'Video advertisement creative successfully attached to request.',
            data: b2cReq
        });
    }
    catch (error) {
        console.error('adminCreateVideo error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.adminCreateVideo = adminCreateVideo;
// Super Admin: Publish Ad Creative
const adminPublishCreative = async (req, res) => {
    try {
        const { id } = req.params;
        const b2cReq = await b2cRequest_model_1.default.findById(id);
        if (!b2cReq) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
            return;
        }
        b2cReq.status = 'PUBLISHED';
        await b2cReq.save();
        res.json({ success: true, message: 'Creative published live to Meta & TikTok network.', data: b2cReq });
    }
    catch (error) {
        console.error('adminPublishCreative error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.adminPublishCreative = adminPublishCreative;
//# sourceMappingURL=b2cRequest.controller.js.map