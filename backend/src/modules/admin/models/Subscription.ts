import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  tenantId: string;
  planId: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED' | 'PAYMENT_PENDING' | 'SUSPENDED';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, unique: true }, // One active sub per tenant
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'TRIAL', 'EXPIRING_SOON', 'EXPIRED', 'CANCELLED', 'PAYMENT_PENDING', 'SUSPENDED'], 
      default: 'TRIAL' 
    },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
