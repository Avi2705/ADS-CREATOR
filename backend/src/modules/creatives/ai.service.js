"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = exports.GeminiProvider = void 0;
class GeminiProvider {
    name = 'Gemini-Flash-2.0';
    async generateAdvertisement(params) {
        const { productName, category, price, targetAudience, objective, cta, tone, sellingPoints, promotionalOffer, brandName, hasVideoAsset } = params;
        // High-converting algorithmic marketing prompt generator
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
        const description = `Premium ${category} crafted for excellence. ${price ? `Starting at ₹${price.toLocaleString()}.` : ''} Fast dispatch & guaranteed quality.`;
        const socialCaption = `🔥 Introducing ${productName} by #${brand.replace(/\s+/g, '')}!\n\n✨ Designed for ${hookAudience}\n🎯 Objective: ${objective}\n💥 ${offer}\n\n👉 Click "${cta}" below to secure yours now!\n\n#${category.replace(/\s+/g, '')} #${productName.replace(/\s+/g, '')} #AdHunter #Trending #ExclusiveDeal`;
        const targetAudienceSuggestions = [
            `${targetAudience} interested in high-quality ${category}`,
            `Urban trendsetters aged 21-45 looking for premium ${category}`,
            `Online shoppers actively browsing ${category} discount deals`,
            `Tech & lifestyle enthusiasts who value durable design`
        ];
        const categoryVisualMap = {
            Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80',
            Apparel: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&auto=format&fit=crop&q=80',
            Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
            Beauty: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=1000&auto=format&fit=crop&q=80',
            Fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1000&auto=format&fit=crop&q=80',
            Jewelry: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1000&auto=format&fit=crop&q=80',
            Home: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1000&auto=format&fit=crop&q=80'
        };
        const generatedVisualUrl = params.customImageUrl || categoryVisualMap[category] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80';
        let videoScript = undefined;
        if (hasVideoAsset || objective.includes('Video') || objective.includes('TikTok')) {
            videoScript = `[0:00 - 0:03 HOOK]: Dynamic kinetic visual of ${productName}. On-screen text: "Upgrade to ${productName.toUpperCase()}"\n[0:03 - 0:08 PROBLEM/SOLUTION]: Fast 3D cinematic showcase. Voiceover: "Engineered by ${brand} for supreme ${category.toLowerCase()} quality."\n[0:08 - 0:12 PROMO]: Split screen showing deal: "${offer}"\n[0:12 - 0:15 CTA]: High-impact red button: "${cta}". Voiceover: "Get yours now!"`;
        }
        return {
            headline: chosenHeadline,
            primaryText,
            description,
            cta: cta || 'Shop Now',
            promotionalWording: offer,
            socialCaption,
            targetAudienceSuggestions,
            videoScript,
            generatedVisualUrl,
            provider: this.name,
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