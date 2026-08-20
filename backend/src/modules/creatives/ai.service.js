"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = exports.GeminiProvider = void 0;
const adBannerRenderer_service_1 = require("./adBannerRenderer.service");
class GeminiProvider {
    name = 'Gemini-Flash-2.0';
    async generateAdvertisement(params) {
        const { productName, category, price, targetAudience, objective, cta, tone, sellingPoints, promotionalOffer, brandName, hasVideoAsset } = params;
        const brand = brandName || 'AD-HUNTER Partner Brand';
        const offer = promotionalOffer || 'Special Limited-Time Launch Offer';
        const hookAudience = targetAudience || 'Modern Consumers & E-Commerce Shoppers';
        const headlineOptions = [
            `Transform Your ${category} Experience with ${productName}`,
            `The Ultimate ${productName} by ${brand} Is Here`,
            `Don't Miss Out: Upgrade to ${productName} Today`,
            `Experience Next-Gen Quality with ${productName}`,
            `Why Everyone Is Talking About ${brand}'s ${productName}`
        ];
        const chosenHeadline = headlineOptions[Math.floor(Math.random() * headlineOptions.length)];
        const primaryText = `Looking for top-tier ${category.toLowerCase()} that actually delivers? Meet ${productName} by ${brand}. Engineered specifically for ${hookAudience.toLowerCase()}, ${productName} combines premium build quality, modern aesthetics, and unbeatable performance. ${sellingPoints ? `Key highlights include: ${sellingPoints}.` : ''} ${offer ? `Claim ${offer} before stock runs out.` : ''}`;
        const description = `Premium ${category} crafted for excellence. ${price ? `Starting at ₹${price.toLocaleString('en-IN')}.` : ''} Fast dispatch & guaranteed quality.`;
        const resolvedCta = cta || "Claim Offer";
        const claimUrl = `https://adhunter.com/claim-offer?product=${encodeURIComponent(productName)}&brand=${encodeURIComponent(brand)}`;
        const socialCaption = `🔥 ${chosenHeadline}\n\n✨ Designed by #${brand.replace(/\s+/g, '')} for ${hookAudience}\n💥 ${offer}\n\n👉 Click link to claim your offer: ${claimUrl}\n(Enter your Name, Phone, WhatsApp & Email to lock in your discount!)\n\n#${category.replace(/\s+/g, '')} #${productName.replace(/\s+/g, '')} #AdHunter #ExclusiveDeal`;
        const targetAudienceSuggestions = [
            `${targetAudience} interested in high-quality ${category}`,
            `Urban trendsetters aged 21-45 looking for premium ${category}`,
            `Online shoppers actively browsing ${category} discount deals`,
            `Tech & lifestyle enthusiasts who value durable design`
        ];
        const categoryVisualMap = {
            Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
            Apparel: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
            Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
            Beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
            Fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
            Jewelry: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&auto=format&fit=crop&q=80',
            Home: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
            General: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80'
        };
        const baseBgUrl = params.customImageUrl || categoryVisualMap[category] || categoryVisualMap['General'];
        // Render high-converting Composite Ad Banner with Headline, Promo Pill, and CTA Overlay!
        const generatedVisualUrl = await (0, adBannerRenderer_service_1.renderAndUploadAdBanner)({
            headline: chosenHeadline,
            brandName: brand,
            category,
            promotionalOffer: offer,
            price,
            cta: resolvedCta,
            bgImageUrl: baseBgUrl
        });
        let videoScript = undefined;
        if (hasVideoAsset || objective.includes('Video')) {
            videoScript = `[0:00 - 0:03 HOOK]: Dynamic kinetic visual of ${productName}. On-screen text: "Upgrade to ${productName.toUpperCase()}"\n[0:03 - 0:08 PROBLEM/SOLUTION]: Fast 3D cinematic showcase. Voiceover: "Engineered by ${brand} for supreme ${category.toLowerCase()} quality."\n[0:08 - 0:12 PROMO]: Split screen showing deal: "${offer}"\n[0:12 - 0:15 CTA]: High-impact red button: "${resolvedCta}". Voiceover: "Express your interest today!"`;
        }
        return {
            headline: chosenHeadline,
            primaryText,
            description,
            cta: resolvedCta,
            promotionalWording: offer,
            socialCaption,
            targetAudienceSuggestions,
            videoScript,
            generatedVisualUrl,
            provider: params.modelProvider || this.name,
            generatedAt: new Date()
        };
    }
}
exports.GeminiProvider = GeminiProvider;
class AIService {
    provider;
    constructor(provider) {
        this.provider = provider || new GeminiProvider();
    }
    setProvider(provider) {
        this.provider = provider;
    }
    async generateFreeAd(params) {
        return this.provider.generateAdvertisement(params);
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
//# sourceMappingURL=ai.service.js.map