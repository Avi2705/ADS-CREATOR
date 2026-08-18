import mongoose, { Schema, Document } from 'mongoose';

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

const PaymentSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['PAID', 'PENDING', 'FAILED', 'REFUNDED', 'CANCELLED'], default: 'PENDING' },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String }, // e.g., 'STRIPE', 'CREDIT_CARD'
    transactionId: { type: String, unique: true },
    invoiceUrl: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
