import mongoose, { Document, Schema } from 'mongoose';

export interface ISocialAccount extends Document {
  userId: string;       // customer email or _id
  platform: 'Instagram' | 'Facebook' | 'TikTok' | 'YouTube' | 'Twitter';
  handle: string;       // @username shown in UI
  accountId: string;    // platform business account / page / creator ID
  accessToken: string;  // long-lived access token (encrypted in prod)
  tokenExpiry?: Date;
  isConnected: boolean;
  connectedAt: Date;
}

const SocialAccountSchema = new Schema<ISocialAccount>({
  userId:      { type: String, required: true, index: true },
  platform:    { type: String, required: true, enum: ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Twitter'] },
  handle:      { type: String, required: true },
  accountId:   { type: String, required: true },
  accessToken: { type: String, required: true },
  tokenExpiry: { type: Date },
  isConnected: { type: Boolean, default: true },
  connectedAt: { type: Date, default: Date.now }
});

// unique per user+platform
SocialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.model<ISocialAccount>('SocialAccount', SocialAccountSchema);
