import mongoose, { Document } from 'mongoose';
export interface IPayment extends Document {
    tenantId: string;
    subscriptionId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
    paymentDate: Date;
    paymentMethod: string;
    transactionId: string;
    invoiceUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPayment, {}, {}, {}, Document<unknown, {}, IPayment, {}, mongoose.DefaultSchemaOptions> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPayment>;
export default _default;
//# sourceMappingURL=Payment.d.ts.map