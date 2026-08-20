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
exports.SocialPost = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SocialAccountSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    platform: { type: String, required: true, enum: ['Instagram', 'Facebook', 'WhatsApp'] },
    handle: { type: String, required: true },
    accountId: { type: String, required: true },
    accessToken: { type: String, required: true },
    phoneNumberId: { type: String },
    fromPhoneNumber: { type: String },
    toPhoneNumber: { type: String },
    templateName: { type: String },
    tokenExpiry: { type: Date },
    isConnected: { type: Boolean, default: true },
    connectedAt: { type: Date, default: Date.now }
});
// unique per user+platform
SocialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });
exports.default = mongoose_1.default.model('SocialAccount', SocialAccountSchema);
const SocialPostSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    adId: { type: String },
    postId: { type: String },
    platformPostId: { type: String },
    headline: { type: String, required: true },
    caption: { type: String },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' },
    channels: [{ type: String }],
    targetUrl: { type: String },
    status: { type: String, enum: ['PUBLISHED', 'SCHEDULED', 'FAILED', 'PARTIALLY_PUBLISHED', 'API_ACCEPTED'], default: 'PUBLISHED' },
    scheduledDate: { type: String },
    publishedDate: { type: String, required: false, default: () => new Date().toISOString().split('T')[0] },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    cpc: { type: Number, default: 0 },
    whatsappDelivery: {
        messageId: { type: String, index: true },
        recipient: { type: String },
        deliveryStatus: { type: String, enum: ['API_ACCEPTED', 'SENT', 'DELIVERED', 'READ', 'FAILED'], default: 'API_ACCEPTED' },
        sentAt: { type: Date },
        deliveredAt: { type: Date },
        readAt: { type: Date },
        failedAt: { type: Date },
        error: {
            code: { type: mongoose_1.Schema.Types.Mixed },
            title: { type: String },
            message: { type: String },
            details: { type: String }
        }
    },
    createdAt: { type: Date, default: Date.now }
});
exports.SocialPost = mongoose_1.default.model('SocialPost', SocialPostSchema);
//# sourceMappingURL=social.model.js.map