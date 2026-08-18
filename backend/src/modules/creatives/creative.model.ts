import mongoose, { Document, Schema } from 'mongoose';

export interface ICreative extends Document {
  tenantId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  name: string;
  type: 'IMAGE' | 'VIDEO';
  assetUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  publishStatus: 'UNPUBLISHED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  platformsPublished: string[]; // e.g. ['META_IG_FEED', 'TIKTOK']
  createdAt: Date;
  updatedAt: Date;
}

const CreativeSchema: Schema = new Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['IMAGE', 'VIDEO'], required: true },
    assetUrl: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    publishStatus: { type: String, enum: ['UNPUBLISHED', 'PUBLISHING', 'PUBLISHED', 'FAILED'], default: 'UNPUBLISHED' },
    platformsPublished: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<ICreative>('Creative', CreativeSchema);
