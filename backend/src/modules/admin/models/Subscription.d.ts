import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<ISubscription, {}, {}, {}, Document<unknown, {}, ISubscription, {}, mongoose.DefaultSchemaOptions> & ISubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubscription>;
export default _default;
//# sourceMappingURL=Subscription.d.ts.map