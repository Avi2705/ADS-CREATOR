"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicShowcaseAds = exports.generateFreeAd = exports.getFreeAdStatus = void 0;
const user_model_1 = __importDefault(require("../users/user.model"));
const freeAd_model_1 = __importDefault(require("./freeAd.model"));
const b2cRequest_model_1 = __importDefault(require("./b2cRequest.model"));
const AuditLog_1 = __importDefault(require("../admin/models/AuditLog"));
const ai_service_1 = require("./ai.service");
const getFreeAdStatus = async (req, res) => {
    try {
        const userId = req.user?.userId || req.query.userId;
        if (!userId) {
            res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
            return;
        }
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User account not found' } });
            return;
        }
        const freeAdsAllowed = user.freeAdsAllowed ?? 1;
        const freeAdsUsed = user.freeAdsUsed ?? 0;
        const freeAdsRemaining = Math.max(0, freeAdsAllowed - freeAdsUsed);
        const existingAd = await freeAd_model_1.default.findOne({ userId: user._id }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: {
                customerType: user.customerType,
                freeAdsAllowed,
                freeAdsUsed,
                freeAdsRemaining,
                canGenerate: user.customerType === 'EXPLORER' && freeAdsRemaining > 0,
                existingAd: existingAd || null
            }
        });
    }
    catch (error) {
        console.error('getFreeAdStatus error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.getFreeAdStatus = getFreeAdStatus;
const generateFreeAd = async (req, res) => {
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
        // 1. Strict State Guard: Must be Explorer
        if (user.customerType !== 'EXPLORER') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'CUSTOMER_TYPE_MISMATCH',
                    message: 'The 1-time free advertisement generation is exclusively available to Explorer accounts.'
                }
            });
            return;
        }
        // 2. Strict Database Entitlement Guard: freeAdsUsed < freeAdsAllowed
        const freeAdsAllowed = user.freeAdsAllowed ?? 1;
        const freeAdsUsed = user.freeAdsUsed ?? 0;
        if (freeAdsUsed >= freeAdsAllowed) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'EXPLORER_FREE_AD_LIMIT_REACHED',
                    message: 'Your free advertisement has already been used. Choose B2B or B2C in your profile to create more advertisements.'
                }
            });
            return;
        }
        const { productName, productDescription, category, price, productUrl, targetAudience, location, objective, cta, tone, sellingPoints, promotionalOffer, brandName, additionalInstructions, mediaAssets } = req.body;
        // 3. Validation: Mandatory fields
        if (!productName || !category || !targetAudience || !objective || !cta || !tone) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Please provide all required advertisement parameters (Product Name, Category, Audience, Objective, CTA, Tone).'
                }
            });
            return;
        }
        const hasVideoAsset = Array.isArray(mediaAssets) && mediaAssets.some((m) => m.assetType === 'VIDEO');
        // 4. Invoke AI Service
        const customImageUrl = req.body.customImageUrl || (Array.isArray(mediaAssets) && mediaAssets[0]?.url) || undefined;
        const generatedResult = await ai_service_1.aiService.generateFreeAd({
            productName,
            productDescription,
            category,
            price: price ? parseFloat(price) : undefined,
            targetAudience,
            location,
            objective,
            cta,
            tone,
            sellingPoints,
            promotionalOffer,
            brandName: brandName || user.companyName,
            additionalInstructions,
            hasVideoAsset,
            customImageUrl
        });
        // 6. Persist FreeAd document in DB
        const freeAd = await freeAd_model_1.default.create({
            userId: user._id,
            tenantId: user.tenantId,
            productName,
            productDescription,
            category,
            price: price ? parseFloat(price) : undefined,
            productUrl,
            targetAudience,
            location,
            objective,
            cta,
            tone,
            sellingPoints,
            promotionalOffer,
            brandName: brandName || user.companyName,
            additionalInstructions,
            mediaAssets,
            generatedResult
        });
        // 7. Update User's freeAdsUsed in Database
        user.freeAdsUsed = (user.freeAdsUsed || 0) + 1;
        await user.save();
        // 8. Log Audit Record
        await AuditLog_1.default.create({
            actorId: user._id,
            actorName: user.name || 'Explorer User',
            action: 'CREATE_FREE_AD',
            entity: 'FreeAd',
            entityId: freeAd._id.toString(),
            newValue: { productName, category, provider: generatedResult.provider }
        });
        res.status(201).json({
            success: true,
            message: 'Free advertisement generated successfully.',
            data: {
                freeAd,
                freeAdsRemaining: 0
            }
        });
    }
    catch (error) {
        console.error('generateFreeAd error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.generateFreeAd = generateFreeAd;
const getPublicShowcaseAds = async (req, res) => {
    try {
        const freeAds = await freeAd_model_1.default.find({}).sort({ createdAt: -1 });
        const b2cRequests = await b2cRequest_model_1.default.find({}).sort({ createdAt: -1 });
        const b2cItems = [];
        for (const b2cReq of b2cRequests) {
            if (b2cReq.creativeAssets && b2cReq.creativeAssets.length > 0) {
                for (const asset of b2cReq.creativeAssets) {
                    b2cItems.push({
                        id: `${b2cReq._id}-${asset.version}`,
                        title: asset.headline || b2cReq.productName,
                        category: b2cReq.category || 'General',
                        url: asset.url,
                        leads: String(Math.floor(100 + Math.random() * 500)),
                        roas: `${(2.5 + Math.random() * 4).toFixed(1)}x`,
                        ctr: `${(1.5 + Math.random() * 5).toFixed(1)}%`,
                        platform: b2cReq.format || 'Instagram Post (1:1)',
                        hook: asset.primaryText || b2cReq.description,
                        cta: asset.cta || 'Shop Now'
                    });
                }
            }
        }
        const freeAdItems = freeAds.map(ad => ({
            id: ad._id.toString(),
            title: ad.generatedResult?.headline || ad.productName,
            category: ad.category || 'General',
            url: ad.generatedResult?.generatedVisualUrl || (ad.mediaAssets && ad.mediaAssets[0]?.url) || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&fit=crop',
            leads: String(Math.floor(50 + Math.random() * 200)),
            roas: `${(1.8 + Math.random() * 3).toFixed(1)}x`,
            ctr: `${(1.2 + Math.random() * 4).toFixed(1)}%`,
            platform: 'AI Free Ad',
            hook: ad.generatedResult?.socialCaption || ad.productDescription || '',
            cta: ad.cta || 'Learn More'
        }));
        res.json({
            success: true,
            data: [...b2cItems, ...freeAdItems]
        });
    }
    catch (error) {
        console.error('getPublicShowcaseAds error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
};
exports.getPublicShowcaseAds = getPublicShowcaseAds;
//# sourceMappingURL=freeAd.controller.js.map