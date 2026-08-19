import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  referenceId: string;
  name: string;
  email: string;
  passwordHash: string;
  customerType: 'EXPLORER' | 'B2B' | 'B2C' | null;
  accountType: 'EXPLORER' | 'B2C' | 'B2B' | 'EMPLOYEE' | 'SUPER_ADMIN' | 'PENDING';
  role: 'BUSINESS_OWNER' | 'MANAGER' | 'EMPLOYEE' | 'DESIGNER' | 'SUPPORT' | 'EXPLORER' | 'SUPER_ADMIN' | 'CUSTOMER';
  tenantId?: mongoose.Types.ObjectId;
  status: 'LEAD' | 'ACTIVE' | 'SUSPENDED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
  freeAdsAllowed: number;
  freeAdsUsed: number;
  subscription?: string;
  billingCycle?: 'MONTHLY' | 'YEARLY';


  
  // Employee & Admin Reference Hierarchy
  creatorAdminId?: mongoose.Types.ObjectId;
  creatorAdminRefId?: string;
  department?: string;
  designation?: string;
  assignedEmployeeRefId?: string;
  assignedEmployeeName?: string;
  assignedLeadsCount?: number;
  assignedCustomersCount?: number;

  // Profile Onboarding & Capture fields
  mobile?: string;
  countryCode?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: string;
  profileStatus: 'INCOMPLETE' | 'PARTIAL' | 'COMPLETED';
  intentType?: 'B2B' | 'B2C' | 'Explorer';

  // Company info
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  website?: string;
  state?: string;
  city?: string;
  businessAddress?: string;
  businessType?: string;
  industry?: string;
  yearEstablished?: string;
  numEmployees?: number;
  numProducts?: number;
  productCategories?: string[];
  description?: string;
  experience?: string;

  // Additional Conditional Intent Questions
  b2bExpectedUsers?: number;
  b2bAdChannels?: string[];
  b2bSocialPlatforms?: string[];
  b2bMainRequirement?: string;
  b2bExpectedUsage?: string;
  b2bAdProblems?: string;

  b2cProdName?: string;
  b2cProdCategory?: string;
  b2cProdWebsite?: string;
  b2cAdMethod?: string;
  b2cAdTypes?: string[];
  b2cExpectedAds?: number;

  explorerLearnIntent?: string;
  explorerInterestService?: string;
  resetPasswordOtp?: string;
  resetPasswordExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
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
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: false },
    status: { type: String, enum: ['LEAD', 'ACTIVE', 'SUSPENDED'], default: 'LEAD' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    freeAdsAllowed: { type: Number, default: 1 },
    freeAdsUsed: { type: Number, default: 0 },
    subscription: { type: String, default: null },
    billingCycle: { type: String, enum: ['MONTHLY', 'YEARLY', null], default: null },

    resetPasswordOtp: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },


    // Employee & Admin Hierarchy
    creatorAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);

