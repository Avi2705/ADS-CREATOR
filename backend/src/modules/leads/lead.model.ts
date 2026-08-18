import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  referenceId: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  country?: string;
  dateOfBirth?: string;
  gender?: string;
  profileStatus: 'INCOMPLETE' | 'PARTIAL' | 'COMPLETED';
  intentType: 'B2B' | 'B2C' | 'Explorer';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'APPROVED' | 'CONVERTED' | 'REJECTED';
  source?: string;
  subscriptionPlan?: string;
  convertedToCustomerId?: mongoose.Types.ObjectId;

  // Assignment to Employee
  assignedEmployeeRefId?: string;
  assignedEmployeeName?: string;
  tenantRefId?: string;

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
  explorerOptionalBiz?: string;

  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    referenceId: { type: String, unique: true, sparse: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
    convertedToCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

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
  },
  { timestamps: true }
);

export default mongoose.model<ILead>('Lead', LeadSchema);

