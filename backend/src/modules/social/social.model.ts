import mongoose, { Document, Schema } from 'mongoose';

export interface ISocialAccount extends Document {
  userId: string;       // customer email or _id
  platform: 'Instagram' | 'Facebook' | 'WhatsApp';
  handle: string;       // @username shown in UI
  accountId: string;    // platform business account / page / creator ID
  accessToken: string;  // long-lived access token (encrypted in prod)
  phoneNumberId?: string; // WhatsApp Cloud API Phone Number ID
  fromPhoneNumber?: string; // WhatsApp Sender Mobile Number
  toPhoneNumber?: string;   // WhatsApp Default Recipient Mobile Number (To Number)
  templateName?: string;    // WhatsApp Approved Template Name
  tokenExpiry?: Date;
  isConnected: boolean;
  connectedAt: Date;
}

const SocialAccountSchema = new Schema<ISocialAccount>({
  userId:          { type: String, required: true, index: true },
  platform:        { type: String, required: true, enum: ['Instagram', 'Facebook', 'WhatsApp'] },
  handle:          { type: String, required: true },
  accountId:       { type: String, required: true },
  accessToken:     { type: String, required: true },
  phoneNumberId:   { type: String },
  fromPhoneNumber: { type: String },
  toPhoneNumber:   { type: String },
  templateName:    { type: String },
  tokenExpiry:     { type: Date },
  isConnected:     { type: Boolean, default: true },
  connectedAt:     { type: Date, default: Date.now }
});

// unique per user+platform
SocialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.model<ISocialAccount>('SocialAccount', SocialAccountSchema);

export interface IWhatsAppDeliveryDetails {
  messageId?: string;
  recipient?: string;
  deliveryStatus?: 'API_ACCEPTED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  error?: {
    code?: string | number;
    title?: string;
    message?: string;
    details?: string;
  };
}

export interface ISocialPost extends Document {
  userId: string;
  adId?: string;
  postId?: string;
  platformPostId?: string;
  headline: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  channels: string[];
  targetUrl: string;
  status: 'PUBLISHED' | 'SCHEDULED' | 'FAILED' | 'PARTIALLY_PUBLISHED' | 'API_ACCEPTED';
  scheduledDate?: string;
  publishedDate?: string;
  impressions: number;
  clicks: number;
  leads: number;
  reach?: number;
  spend?: number;
  ctr?: number;
  cpc?: number;
  whatsappDelivery?: IWhatsAppDeliveryDetails;
  createdAt: Date;
}

const SocialPostSchema = new Schema<ISocialPost>({
  userId: { type: String, required: true, index: true },
  adId: { type: String },
  postId: { type: String },
  platformPostId: { type: String },
  headline: { type: String, required: true },
  caption: { type: String },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' },
  channels: [{ type: String }],
  targetUrl: { type: String },
  status: { type: String, enum: ['PUBLISHED', 'SCHEDULED', 'FAILED', 'PARTIALLY_PUBLISHED', 'API_ACCEPTED'], default: 'PUBLISHED' },
  scheduledDate: { type: String },
  publishedDate: { type: String, required: false, default: () => new Date().toISOString().split('T')[0] },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  leads: { type: Number, default: 0 },
  reach: { type: Number, default: 0 },
  spend: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 },
  cpc: { type: Number, default: 0 },
  whatsappDelivery: {
    messageId: { type: String, index: true },
    recipient: { type: String },
    deliveryStatus: { type: String, enum: ['API_ACCEPTED', 'SENT', 'DELIVERED', 'READ', 'FAILED'], default: 'API_ACCEPTED' },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    failedAt: { type: Date },
    error: {
      code: { type: Schema.Types.Mixed },
      title: { type: String },
      message: { type: String },
      details: { type: String }
    }
  },
  createdAt: { type: Date, default: Date.now }
});

export const SocialPost = mongoose.model<ISocialPost>('SocialPost', SocialPostSchema);
