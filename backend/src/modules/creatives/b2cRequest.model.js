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
const mongoose_1 = __importStar(require("mongoose"));
const CreativeAssetSchema = new mongoose_1.Schema({
    assetType: { type: String, enum: ['IMAGE', 'VIDEO'], required: true },
    url: { type: String, required: true },
    headline: { type: String, required: true },
    primaryText: { type: String },
    cta: { type: String },
    version: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    createdByAdminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });
const RevisionNoteSchema = new mongoose_1.Schema({
    note: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now }
}, { _id: false });
const B2CRequestSchema = new mongoose_1.Schema({
    referenceId: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerRefId: { type: String },
    customerName: { type: String },
    customerEmail: { type: String },
    tenantId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Tenant' },
    brandName: { type: String, required: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number },
    productUrl: { type: String },
    adType: { type: String, enum: ['Image', 'Video', 'Both'], default: 'Image' },
    purpose: { type: String, required: true },
    targetAudience: { type: String, required: true },
    headlineIdea: { type: String },
    ctaIdea: { type: String },
    preferredStyle: { type: String, default: 'Modern & Bold' },
    format: { type: String, default: 'Instagram Post (1:1)' },
    description: { type: String, required: true },
    mediaAssets: [
        {
            assetType: { type: String, enum: ['IMAGE', 'VIDEO'] },
            url: { type: String },
            mimeType: { type: String },
            size: { type: Number }
        }
    ],
    status: {
        type: String,
        enum: [
            'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED',
            'IN_PROGRESS', 'CREATIVE_READY', 'CUSTOMER_REVIEW',
            'REVISION_REQUESTED', 'APPROVED_FOR_PUBLISH', 'PUBLISHED',
            'COMPLETED', 'REJECTED', 'CANCELLED'
        ],
        default: 'SUBMITTED',
        index: true
    },
    creativeAssets: [CreativeAssetSchema],
    revisions: [RevisionNoteSchema],
    adminNotes: { type: String },
    assignedStaffId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    assignedStaffName: { type: String },
    publishedAdId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Advertisement' }
}, { timestamps: true });
exports.default = mongoose_1.default.model('B2CRequest', B2CRequestSchema);
//# sourceMappingURL=b2cRequest.model.js.map