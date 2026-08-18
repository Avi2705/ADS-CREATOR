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

export interface ISocialPost extends Document {
  userId: string;
  adId?: string;
  headline: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  channels: string[];
  targetUrl: string;
  status: 'PUBLISHED' | 'SCHEDULED';
  scheduledDate?: string;
  publishedDate: string;
  impressions: number;
  clicks: number;
  leads: number;
  createdAt: Date;
}

const SocialPostSchema = new Schema<ISocialPost>({
  userId: { type: String, required: true, index: true },
  adId: { type: String },
  headline: { type: String, required: true },
  caption: { type: String },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' },
  channels: [{ type: String }],
  targetUrl: { type: String },
  status: { type: String, enum: ['PUBLISHED', 'SCHEDULED'], default: 'PUBLISHED' },
  scheduledDate: { type: String },
  publishedDate: { type: String, required: true },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  leads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const SocialPost = mongoose.model<ISocialPost>('SocialPost', SocialPostSchema);
