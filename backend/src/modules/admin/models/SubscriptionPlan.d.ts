import mongoose, { Document } from 'mongoose';
export interface ISubscriptionPlan extends Document {
    name: string;
    planType: 'B2C' | 'B2B';
    price: number;
    billingCycle: 'MONTHLY' | 'YEARLY';
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
declare const _default: mongoose.Model<ISubscriptionPlan, {}, {}, {}, Document<unknown, {}, ISubscriptionPlan, {}, mongoose.DefaultSchemaOptions> & ISubscriptionPlan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubscriptionPlan>;
export default _default;
//# sourceMappingURL=SubscriptionPlan.d.ts.map