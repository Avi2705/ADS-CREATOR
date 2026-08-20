import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';

export interface RenderAdBannerParams {
  headline: string;
  brandName?: string;
  category: string;
  promotionalOffer?: string;
  price?: number;
  cta: string;
  bgImageUrl: string;
}

/**
 * Helper to fetch a remote HTTP image URL and convert to Base64 data URI
 * to ensure background images inside SVGs are 100% visible and never blocked by CORS.
 */
async function fetchImageAsBase64(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const arrayBuffer = await res.arrayBuffer();
    const mime = res.headers.get('content-type') || 'image/jpeg';
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${mime};base64,${base64}`;
  } catch (err) {
    console.warn('[Ad Banner Renderer] Base64 image convert notice:', err);
    return url;
  }
}

/**
 * Generates a high-converting 1080x1080 Instagram Ad Banner (SVG base64) with
 * Headline text, Brand badge, Offer pill, and high-impact CTA Button overlay ("I'm Interested").
 */
export async function generateAdBannerSVG(params: RenderAdBannerParams): Promise<string> {
  const { headline, brandName, category, promotionalOffer, price, cta, bgImageUrl } = params;

  // Convert background image to Base64 data URI to guarantee 100% visibility
  const base64Bg = await fetchImageAsBase64(bgImageUrl);

  const brand = (brandName || 'OFFICIAL BRAND').toUpperCase();
  const offerText = promotionalOffer ? promotionalOffer.toUpperCase() : 'EXCLUSIVE LIMITED TIME OFFER';
  const ctaText = (cta || "I'M INTERESTED").toUpperCase();
  const priceDisplay = price ? `₹${price.toLocaleString('en-IN')}` : '';

  // Clean and wrap headline into max 3 lines for 1080 width
  const cleanHeadline = headline.replace(/["<>&]/g, '');
  const words = cleanHeadline.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).length <= 26) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  const headlineLines = lines.slice(0, 3); // Max 3 lines

  // Build SVG XML (1080x1350 - 4:5 Instagram Portrait Feed Standard)
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <!-- Background Dark Gradient Overlay -->
    <linearGradient id="bgOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
      <stop offset="50%" stop-color="#000000" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.92"/>
    </linearGradient>

    <!-- Card Glassmorphism Gradient -->
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b" stop-opacity="0.94"/>
      <stop offset="100%" stop-color="#09090b" stop-opacity="0.98"/>
    </linearGradient>

    <!-- Promo Gold Badge Gradient -->
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>

    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Image Asset (Base64 embedded for 100% visibility) -->
  <image href="${base64Bg}" width="1080" height="1350" preserveAspectRatio="xMidYMid slice" />

  <!-- Full Black Gradient Mask -->
  <rect width="1080" height="1350" fill="url(#bgOverlay)"/>

  <!-- TOP-LEFT: Brand & Category Header Bar -->
  <g transform="translate(60, 70)">
    <!-- Brand Pill -->
    <rect width="400" height="72" rx="36" fill="#dc2626" filter="url(#dropShadow)" />
    <text x="200" y="46" font-family="'Impact', 'Montserrat', sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">
      🔥 ${brand.slice(0, 22)}
    </text>
  </g>

  <!-- TOP-RIGHT: Sleek Gold/Red Offer Badge -->
  <g transform="translate(540, 70)">
    <rect width="480" height="72" rx="36" fill="url(#goldGradient)" filter="url(#dropShadow)" />
    <text x="240" y="46" font-family="'Montserrat', 'Impact', sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      ⚡ ${offerText.slice(0, 36)}
    </text>
  </g>

  <!-- Bottom Ad Overlay Glass Card -->
  <g transform="translate(50, 920)">
    <!-- Card Frame -->
    <rect width="980" height="370" rx="36" fill="url(#cardGradient)" stroke="#3f3f46" stroke-width="2" filter="url(#dropShadow)" />

    ${priceDisplay ? `
    <!-- Price Badge at Top Right of Card -->
    <g transform="translate(670, 40)">
      <rect width="270" height="60" rx="30" fill="#16a34a" />
      <text x="135" y="42" font-family="'Impact', sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle">
        ${priceDisplay}
      </text>
    </g>
    ` : ''}

    ${category ? `
    <!-- Category Pill -->
    <g transform="translate(44, 40)">
      <rect width="260" height="54" rx="27" fill="#27272a" opacity="0.95" />
      <text x="130" y="36" font-family="'Montserrat', sans-serif" font-size="20" font-weight="800" fill="#e4e4e7" text-anchor="middle">
        ${category.toUpperCase().slice(0, 16)}
      </text>
    </g>
    ` : ''}

    <!-- Dynamic Bold Headline Text -->
    <g transform="translate(44, 140)">
      ${headlineLines.map((line, i) => `
        <text x="0" y="${i * 64}" font-family="'Impact', 'Arial Black', sans-serif" font-size="52" font-weight="900" fill="#ffffff" letter-spacing="0.5">
          ${line.toUpperCase()}
        </text>
      `).join('')}
    </g>

    <!-- Tiny Subtext Words (Fine Print & Micro Copy Disclaimer) -->
    <text x="44" y="332" font-family="'Montserrat', 'Arial', sans-serif" font-size="15" font-weight="700" fill="#a1a1aa" letter-spacing="1">
      ⚡ * LIMITED TIME OFFER • T&amp;C APPLY • FREE EXPRESS SHIPPING • 100% MONEY BACK GUARANTEE
    </text>
  </g>
</svg>
  `.trim();

  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

/**
 * Uploads the rendered composite SVG banner to Cloudinary or saves locally,
 * returning a public HTTPS Cloudinary CDN URL for social posts.
 */
export async function renderAndUploadAdBanner(params: RenderAdBannerParams): Promise<string> {
  const svgDataUri = await generateAdBannerSVG(params);

  try {
    if (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL) {
      const result = await cloudinary.uploader.upload(svgDataUri, {
        folder: 'adhunter_creatives',
        resource_type: 'image'
      });
      console.log(`[Ad Banner Renderer] Created Cloudinary CDN Banner: ${result.secure_url}`);
      return result.secure_url;
    }
  } catch (err) {
    console.warn('[Ad Banner Renderer] Cloudinary notice:', err);
  }

  return svgDataUri;
}
