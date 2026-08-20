import mongoose, { Document, Schema } from 'mongoose';

export interface IB2CCreativeAsset {
  assetType: 'IMAGE' | 'VIDEO';
  url: string;
  headline: string;
  primaryText?: string;
  cta?: string;
  version: number;
  createdAt: Date;
  createdByAdminId?: mongoose.Types.ObjectId;
}

export interface IB2CRevisionNote {
  note: string;
  requestedAt: Date;
}

export interface IB2CRequest extends Document {
  referenceId: string;
  customerId: any;
  customerRefId?: string;
  customerName?: string;
  customerEmail?: string;
  tenantId?: mongoose.Types.ObjectId;
  brandName: string;
  productName: string;
  category: string;
  price?: number;
  productUrl?: string;
  adType: 'Image' | 'Video' | 'Both';
  purpose: string;
  targetAudience: string;
  headlineIdea?: string;
  ctaIdea?: string;
  preferredStyle?: string;
  format?: string;
  description: string;
  mediaAssets: Array<{
    assetType: 'IMAGE' | 'VIDEO';
    url: string;
    mimeType: string;
    size?: number;
  }>;
  status: 
    | 'DRAFT' 
    | 'SUBMITTED' 
    | 'UNDER_REVIEW' 
    | 'APPROVED' 
    | 'IN_PROGRESS' 
    | 'CREATIVE_READY' 
    | 'CUSTOMER_REVIEW' 
    | 'REVISION_REQUESTED' 
    | 'APPROVED_FOR_PUBLISH' 
    | 'PUBLISHED' 
    | 'COMPLETED' 
    | 'REJECTED' 
    | 'CANCELLED';
  creativeAssets: IB2CCreativeAsset[];
  revisions: IB2CRevisionNote[];
  adminNotes?: string;
  assignedStaffId?: mongoose.Types.ObjectId;
  assignedStaffName?: string;
  publishedAdId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CreativeAssetSchema = new Schema({
  assetType: { type: String, enum: ['IMAGE', 'VIDEO'], required: true },
  url: { type: String, required: true },
  headline: { type: String, required: true },
  primaryText: { type: String },
  cta: { type: String },
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  createdByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const RevisionNoteSchema = new Schema({
  note: { type: String, required: true },
  requestedAt: { type: Date, default: Date.now }
}, { _id: false });

const B2CRequestSchema: Schema = new Schema(
  {
    referenceId: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.Mixed, required: true, index: true },
    customerRefId: { type: String },
    customerName: { type: String },
    customerEmail: { type: String },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
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
    assignedStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedStaffName: { type: String },
    publishedAdId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' }
  },
  { timestamps: true }
);

export default mongoose.model<IB2CRequest>('B2CRequest', B2CRequestSchema);
