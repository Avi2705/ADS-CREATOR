import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomerLead extends Document {
  referenceId: string;
  customerId: mongoose.Types.ObjectId;
  customerRefId?: string;
  tenantId?: mongoose.Types.ObjectId;
  advertisementId?: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  location?: string;
  source: string;
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  value?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerLeadSchema: Schema = new Schema(
  {
    referenceId: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerRefId: { type: String },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    advertisementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, default: 'India' },
    source: { type: String, default: 'Meta Ad Form' },
    notes: { type: String },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'],
      default: 'NEW',
      index: true
    },
    value: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<ICustomerLead>('CustomerLead', CustomerLeadSchema);
