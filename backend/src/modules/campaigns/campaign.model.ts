import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  platforms: string[]; // ['META', 'TIKTOK']
  budget: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema: Schema = new Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'], default: 'DRAFT' },
    platforms: [{ type: String }],
    budget: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
