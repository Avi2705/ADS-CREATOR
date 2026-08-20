import mongoose, { Document, Schema } from 'mongoose';

export interface IAdInteraction extends Document {
  referenceId: string;
  postId?: string;
  adId?: string;
  platform: 'Instagram' | 'Facebook' | 'WhatsApp';
  interactionType: 'LIKE' | 'COMMENT' | 'SHARE' | 'CLICK' | 'VIEW' | 'LEAD';
  userName: string;
  userEmail?: string;
  userPhone?: string;
  commentText?: string;
  metadata?: any;
  createdAt: Date;
}

const AdInteractionSchema = new Schema<IAdInteraction>({
  referenceId: { type: String, required: true, unique: true },
  postId: { type: String, index: true },
  adId: { type: String, index: true },
  platform: { type: String, enum: ['Instagram', 'Facebook', 'WhatsApp'], default: 'Facebook' },
  interactionType: { type: String, enum: ['LIKE', 'COMMENT', 'SHARE', 'CLICK', 'VIEW', 'LEAD'], required: true },
  userName: { type: String, required: true, default: 'Meta Ad User' },
  userEmail: { type: String },
  userPhone: { type: String },
  commentText: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAdInteraction>('AdInteraction', AdInteractionSchema);
