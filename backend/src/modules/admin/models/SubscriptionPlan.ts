import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: string; // e.g., 'Starter', 'Pro', 'Enterprise'
  planType: 'B2C' | 'B2B';
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  
  // Entitlement Limits
  maxProducts: number;
  maxUsers: number;
  maxImageAds: number;
  maxVideoAds: number;
  maxSocialAccounts: number;
  maxLeads: number;
  
  featureFlags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    planType: { type: String, enum: ['B2C', 'B2B'], required: true },
    price: { type: Number, required: true },
    billingCycle: { type: String, enum: ['MONTHLY', 'YEARLY'], default: 'MONTHLY' },
    
    maxProducts: { type: Number, default: 1 },
    maxUsers: { type: Number, default: 1 },
    maxImageAds: { type: Number, default: 10 },
    maxVideoAds: { type: Number, default: 5 },
    maxSocialAccounts: { type: Number, default: 1 },
    maxLeads: { type: Number, default: 100 },
    
    featureFlags: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);
