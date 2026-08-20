"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMetaAdInsights = fetchMetaAdInsights;
exports.fetchMetaLeadDetails = fetchMetaLeadDetails;
exports.syncAllMetaAdInsights = syncAllMetaAdInsights;
const social_model_1 = require("./social.model");
const social_model_2 = __importDefault(require("./social.model"));
const customerLead_model_1 = __importDefault(require("../leads/customerLead.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const mail_service_1 = require("../../services/mail.service");
const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v23.0';
const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;
const INSTAGRAM_GRAPH_URL = `https://graph.instagram.com/${META_GRAPH_VERSION}`;
/**
 * 1. Fetch Authoritative Ad Performance Metrics from Meta Marketing API (/insights)
 * Requests ad-level & campaign-level metrics (impressions, clicks, reach, spend, ctr, cpc).
 */
async function fetchMetaAdInsights(adOrPostId, accessToken) {
    if (!adOrPostId || !accessToken)
        return null;
    try {
        // Check if it's an Instagram Media object or Meta Ad ID
        const isInstagramMedia = adOrPostId.length >= 15 && !adOrPostId.startsWith('act_');
        const endpoint = isInstagramMedia
            ? `${INSTAGRAM_GRAPH_URL}/${adOrPostId}/insights?metric=impressions,reach,engagement,saved&access_token=${encodeURIComponent(accessToken)}`
            : `${FACEBOOK_GRAPH_URL}/${adOrPostId}/insights?fields=impressions,clicks,reach,spend,ctr,cpc,cpm,outbound_clicks&access_token=${encodeURIComponent(accessToken)}`;
        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.error) {
            console.warn(`[Meta Insights API Notice] Ad ${adOrPostId}:`, data.error.message);
            return null;
        }
        const item = Array.isArray(data.data) && data.data[0] ? data.data[0] : data;
        const insights = {
            impressions: parseInt(item.impressions || '0', 10),
            clicks: parseInt(item.clicks || item.engagement || '0', 10),
            reach: parseInt(item.reach || '0', 10),
            spend: parseFloat(item.spend || '0'),
            ctr: parseFloat(item.ctr || '0'),
            cpc: parseFloat(item.cpc || '0'),
            cpm: parseFloat(item.cpm || '0'),
            outboundClicks: parseInt(item.outbound_clicks?.[0]?.value || '0', 10)
        };
        console.log(`[Meta Marketing API Insights Sync] Ad ${adOrPostId}: ${insights.impressions} Views, ${insights.clicks} Clicks, ₹${insights.spend} Spend`);
        // Persist authoritative metrics directly into MongoDB SocialPost document
        await social_model_1.SocialPost.updateMany({
            $or: [
                { postId: adOrPostId },
                { platformPostId: adOrPostId },
                { adId: adOrPostId }
            ]
        }, {
            $set: {
                impressions: insights.impressions,
                clicks: insights.clicks,
                reach: insights.reach,
                spend: insights.spend,
                ctr: insights.ctr,
                cpc: insights.cpc
            }
        });
        return insights;
    }
    catch (err) {
        console.error(`[Meta Insights Fetch Error] Ad ${adOrPostId}:`, err.message);
        return null;
    }
}
/**
 * 2. Fetch Customer Details from Meta Lead Ads (Instant Forms)
 * When a user submits a Meta Lead Form, Webhook receives leadgen_id.
 * Query Meta Marketing API to retrieve customer Name, Email, Phone, WhatsApp, and City.
 */
async function fetchMetaLeadDetails(leadgenId, accessToken) {
    if (!leadgenId || !accessToken)
        return null;
    try {
        const url = `${FACEBOOK_GRAPH_URL}/${leadgenId}?fields=created_time,id,ad_id,form_id,field_data&access_token=${encodeURIComponent(accessToken)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
            console.warn(`[Meta Lead Ads API Notice] Leadgen ${leadgenId}:`, data.error.message);
            return null;
        }
        const fieldData = data.field_data || [];
        let name = 'Meta Lead User';
        let email = '';
        let phone = 'N/A';
        let city = 'India';
        let customNotes = [];
        fieldData.forEach((field) => {
            const nameKey = (field.name || '').toLowerCase();
            const val = Array.isArray(field.values) ? field.values[0] : field.values;
            if (nameKey.includes('full_name') || nameKey.includes('name') || nameKey.includes('first_name')) {
                name = val;
            }
            else if (nameKey.includes('email')) {
                email = String(val).toLowerCase();
            }
            else if (nameKey.includes('phone') || nameKey.includes('mobile') || nameKey.includes('whatsapp')) {
                phone = String(val);
            }
            else if (nameKey.includes('city') || nameKey.includes('location')) {
                city = String(val);
            }
            else {
                customNotes.push(`${field.name}: ${val}`);
            }
        });
        if (!email) {
            email = `lead_${leadgenId.slice(-6)}@meta.lead`;
        }
        const refId = `FB-LEAD-${Date.now().toString().slice(-6)}`;
        const newLead = await customerLead_model_1.default.create({
            referenceId: refId,
            customerId: new mongoose_1.default.Types.ObjectId(),
            customerRefId: 'meta-leadgen',
            name,
            email,
            phone,
            location: city,
            source: `Meta Instant Form (Form ID: ${data.form_id || leadgenId})`,
            notes: `Captured via Meta Marketing API Leadgen • ${customNotes.join(' • ')}`,
            status: 'NEW',
            value: 0
        });
        console.log(`[Meta Lead Ads PII Fetched] Name: ${name}, Email: ${email}, Phone: ${phone}`);
        // Notify Admin Email in .env
        (0, mail_service_1.sendInquiryNotificationEmail)({
            name,
            email,
            phone,
            source: `Meta Instant Form Lead (Form ID: ${data.form_id || leadgenId})`,
            message: `Leadgen ID: ${leadgenId} • ${customNotes.join(' • ')}`
        }).catch(mailErr => console.warn('Lead email notification notice:', mailErr));
        return newLead;
    }
    catch (err) {
        console.error(`[Meta Lead Details Fetch Error] Leadgen ${leadgenId}:`, err.message);
        return null;
    }
}
/**
 * 3. Background Cron Worker: Periodically Sync Authoritative Meta Insights
 * Iterates through active posts in MongoDB and updates impressions, clicks, spend from Meta Marketing API.
 */
async function syncAllMetaAdInsights() {
    try {
        const posts = await social_model_1.SocialPost.find({
            $or: [
                { status: 'PUBLISHED' },
                { status: 'PARTIALLY_PUBLISHED' }
            ]
        }).limit(50);
        const accounts = await social_model_2.default.find();
        const tokenMap = new Map();
        accounts.forEach(acc => {
            if (acc.accessToken)
                tokenMap.set(acc.platform, acc.accessToken);
        });
        const defaultToken = process.env.META_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN || Array.from(tokenMap.values())[0];
        for (const post of posts) {
            const targetId = post.postId || post.platformPostId || post.adId;
            if (targetId && defaultToken) {
                await fetchMetaAdInsights(targetId, defaultToken);
            }
        }
    }
    catch (err) {
        console.warn('[Meta Insights Cron Worker Notice]:', err.message);
    }
}
//# sourceMappingURL=metaInsights.service.js.map