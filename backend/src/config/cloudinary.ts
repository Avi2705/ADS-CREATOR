import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Extract credentials from CLOUDINARY_URL if CLOUDINARY_CLOUD_NAME is missing
let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
let apiKey = process.env.CLOUDINARY_API_KEY;
let apiSecret = process.env.CLOUDINARY_API_SECRET;

const cloudinaryUrl = process.env.CLOUDINARY_URL;

if ((!cloudName || !apiKey || !apiSecret) && cloudinaryUrl) {
  try {
    // Expected format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const urlPattern = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/;
    const matches = cloudinaryUrl.trim().match(urlPattern);
    if (matches && matches.length === 4) {
      apiKey = matches[1];
      apiSecret = matches[2];
      cloudName = matches[3];
    }
  } catch (e) {
    console.warn('Failed to parse CLOUDINARY_URL:', e);
  }
}

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log(`[Cloudinary Config] Initialized for cloud: ${cloudName}`);
} else {
  console.warn('[Cloudinary Config] Missing credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env');
}

export default cloudinary;
