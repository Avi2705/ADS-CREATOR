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
const LeadSchema = new mongoose_1.Schema({
    referenceId: { type: String, unique: true, sparse: true, index: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    countryCode: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String },
    dateOfBirth: { type: String },
    gender: { type: String },
    profileStatus: { type: String, enum: ['INCOMPLETE', 'PARTIAL', 'COMPLETED'], default: 'INCOMPLETE' },
    intentType: { type: String, enum: ['B2B', 'B2C', 'Explorer'], required: true },
    status: {
        type: String,
        enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'APPROVED', 'CONVERTED', 'REJECTED'],
        default: 'NEW',
        index: true
    },
    source: { type: String, default: 'PUBLIC_SIGNUP' },
    subscriptionPlan: { type: String },
    convertedToCustomerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    assignedEmployeeRefId: { type: String },
    assignedEmployeeName: { type: String },
    tenantRefId: { type: String },
    companyName: { type: String },
    companyEmail: { type: String },
    companyPhone: { type: String },
    website: { type: String },
    state: { type: String },
    city: { type: String },
    businessAddress: { type: String },
    businessType: { type: String },
    industry: { type: String },
    yearEstablished: { type: String },
    numEmployees: { type: Number },
    numProducts: { type: Number },
    productCategories: [{ type: String }],
    description: { type: String },
    experience: { type: String },
    b2bExpectedUsers: { type: Number },
    b2bAdChannels: [{ type: String }],
    b2bSocialPlatforms: [{ type: String }],
    b2bMainRequirement: { type: String },
    b2bExpectedUsage: { type: String },
    b2bAdProblems: { type: String },
    b2cProdName: { type: String },
    b2cProdCategory: { type: String },
    b2cProdWebsite: { type: String },
    b2cAdMethod: { type: String },
    b2cAdTypes: [{ type: String }],
    b2cExpectedAds: { type: Number },
    explorerLearnIntent: { type: String },
    explorerInterestService: { type: String },
    explorerOptionalBiz: { type: String }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Lead', LeadSchema);
//# sourceMappingURL=lead.model.js.map