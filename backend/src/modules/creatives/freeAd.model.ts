import mongoose, { Document, Schema } from 'mongoose';

export interface IMediaAsset {
  assetType: 'IMAGE' | 'VIDEO';
  url: string;
  mimeType: string;
  size?: number;
  publicId?: string;
}

export interface IGeneratedAdResult {
  headline: string;
  primaryText: string;
  description: string;
  cta: string;
  promotionalWording: string;
  socialCaption: string;
  targetAudienceSuggestions: string[];
  videoScript?: string;
  generatedVisualUrl?: string;
  provider: string;
  generatedAt: Date;
}

export interface IFreeAd extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  productName: string;
  productDescription?: string;
  category: string;
  price?: number;
  productUrl?: string;
  targetAudience: string;
  location?: string;
  objective: string;
  cta: string;
  tone: string;
  sellingPoints?: string;
  promotionalOffer?: string;
  brandName?: string;
  additionalInstructions?: string;
  mediaAssets: IMediaAsset[];
  generatedResult: IGeneratedAdResult;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema({
  assetType: { type: String, enum: ['IMAGE', 'VIDEO'], required: true },
  url: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number },
  publicId: { type: String }
}, { _id: false });

const GeneratedAdResultSchema = new Schema({
  headline: { type: String, required: true },
  primaryText: { type: String, required: true },
  description: { type: String, required: true },
  cta: { type: String, required: true },
  promotionalWording: { type: String },
  socialCaption: { type: String, required: true },
  targetAudienceSuggestions: [{ type: String }],
  videoScript: { type: String },
  generatedVisualUrl: { type: String },
  provider: { type: String, default: 'Gemini-Flash' },
  generatedAt: { type: Date, default: Date.now }
}, { _id: false });

const FreeAdSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    productName: { type: String, required: true },
    productDescription: { type: String },
    category: { type: String, required: true },
    price: { type: Number },
    productUrl: { type: String },
    targetAudience: { type: String, required: true },
    location: { type: String },
    objective: { type: String, required: true },
    cta: { type: String, required: true },
    tone: { type: String, required: true },
    sellingPoints: { type: String },
    promotionalOffer: { type: String },
    brandName: { type: String },
    additionalInstructions: { type: String },
    mediaAssets: { type: [MediaAssetSchema], default: [] },
    generatedResult: { type: GeneratedAdResultSchema, required: true }
  },
  { timestamps: true }
);


export default mongoose.model<IFreeAd>('FreeAd', FreeAdSchema);
