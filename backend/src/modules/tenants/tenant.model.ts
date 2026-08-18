import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  type: 'B2C' | 'B2B';
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['B2C', 'B2B'], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITenant>('Tenant', TenantSchema);
