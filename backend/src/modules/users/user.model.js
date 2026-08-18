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
const UserSchema = new mongoose_1.Schema({
    referenceId: { type: String, unique: true, sparse: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    customerType: { type: String, enum: ['EXPLORER', 'B2B', 'B2C', null], default: 'EXPLORER' },
    accountType: { type: String, enum: ['EXPLORER', 'B2C', 'B2B', 'EMPLOYEE', 'SUPER_ADMIN', 'PENDING'], default: 'PENDING' },
    role: {
        type: String,
        enum: ['BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE', 'DESIGNER', 'SUPPORT', 'EXPLORER', 'SUPER_ADMIN', 'CUSTOMER'],
        default: 'EXPLORER'
    },
    tenantId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Tenant', required: false },
    status: { type: String, enum: ['LEAD', 'ACTIVE', 'SUSPENDED'], default: 'LEAD' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    freeAdsAllowed: { type: Number, default: 1 },
    freeAdsUsed: { type: Number, default: 0 },
    subscription: { type: String, default: null },
    billingCycle: { type: String, enum: ['MONTHLY', 'YEARLY', null], default: null },
    // Employee & Admin Hierarchy
    creatorAdminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    creatorAdminRefId: { type: String },
    department: { type: String },
    designation: { type: String },
    assignedEmployeeRefId: { type: String },
    assignedEmployeeName: { type: String },
    assignedLeadsCount: { type: Number, default: 0 },
    assignedCustomersCount: { type: Number, default: 0 },
    mobile: { type: String },
    countryCode: { type: String },
    country: { type: String },
    dateOfBirth: { type: String },
    gender: { type: String },
    profileStatus: { type: String, enum: ['INCOMPLETE', 'PARTIAL', 'COMPLETED'], default: 'INCOMPLETE' },
    intentType: { type: String, enum: ['B2B', 'B2C', 'Explorer'] },
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
exports.default = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map