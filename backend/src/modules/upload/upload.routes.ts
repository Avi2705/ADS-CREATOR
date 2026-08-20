import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary from '../../config/cloudinary';

const router = Router();

// Helper: Upload file or base64 to Cloudinary CDN
async function uploadToCloudinary(filePathOrBase64: string): Promise<string | null> {
  try {
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.warn('[Cloudinary Notice] Credentials incomplete. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.');
      return null;
    }
    const result = await cloudinary.uploader.upload(filePathOrBase64, {
      folder: 'adhunter_creatives',
      resource_type: 'auto'
    });
    console.log(`[Cloudinary Upload Success] ${result.secure_url}`);
    return result.secure_url;
  } catch (err: any) {
    console.error("Cloudinary upload notice:", err?.message || err);
    return null;
  }
}

// Ensure local uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const uniqueName = `img-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// 1. Multipart Form File Upload (Single file) -> Cloudinary CDN Only
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const localFilePath = path.join(uploadsDir, req.file.filename);
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';

    // Upload directly to Cloudinary CDN
    const cloudinaryUrl = await uploadToCloudinary(localFilePath);

    // Unlink temporary local disk file after Cloudinary upload
    if (cloudinaryUrl && fs.existsSync(localFilePath)) {
      try { fs.unlinkSync(localFilePath); } catch (e) {}
    }

    const finalUrl = cloudinaryUrl || `${protocol}://${host}/uploads/${req.file.filename}`;

    return res.json({ 
      success: true, 
      url: finalUrl, 
      isPublicCdn: !!cloudinaryUrl,
      filename: req.file.filename 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Multipart Form File Upload (Multiple files) -> Cloudinary CDN Only
router.post('/files', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';

    const urls = await Promise.all(
      files.map(async file => {
        const localPath = path.join(uploadsDir, file.filename);
        const cloudUrl = await uploadToCloudinary(localPath);
        if (cloudUrl && fs.existsSync(localPath)) {
          try { fs.unlinkSync(localPath); } catch (e) {}
        }
        return cloudUrl || `${protocol}://${host}/uploads/${file.filename}`;
      })
    );

    return res.json({ success: true, urls });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Base64 / Media URL to Cloudinary CDN Converter
router.post('/base64', async (req, res) => {
  try {
    const { image, images } = req.body;
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';

    const saveAndUploadSingle = async (base64Str: string): Promise<string> => {
      if (!base64Str || typeof base64Str !== 'string') return '';
      
      // If already a public Cloudinary / HTTPS URL, return directly
      if (base64Str.startsWith('https://') && !base64Str.includes('localhost')) {
        return base64Str;
      }

      // If it is a localhost /uploads/ URL, resolve to local disk path and upload to Cloudinary
      if (base64Str.includes('/uploads/')) {
        const filename = path.basename(base64Str);
        const diskPath = path.join(uploadsDir, filename);
        if (fs.existsSync(diskPath)) {
          const cloudUrl = await uploadToCloudinary(diskPath);
          if (cloudUrl) {
            try { fs.unlinkSync(diskPath); } catch (e) {}
            return cloudUrl;
          }
        }
      }

      // Try Cloudinary directly if it's base64 or existing file path
      if (base64Str.startsWith('data:image') || base64Str.startsWith('data:video') || fs.existsSync(base64Str)) {
        const cloudUrl = await uploadToCloudinary(base64Str);
        if (cloudUrl) return cloudUrl;
      }

      if (!base64Str.startsWith('data:image') && !base64Str.startsWith('data:video')) {
        return base64Str;
      }

      const matches = base64Str.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) return '';

      const mimeType = matches[1];
      const dataBuffer = Buffer.from(matches[2], 'base64');
      const ext = mimeType.split('/')[1] || 'png';
      const filename = `upload-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, dataBuffer);

      // Upload to Cloudinary and cleanup local file
      const cloudFileUrl = await uploadToCloudinary(filePath);
      if (cloudFileUrl && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }

      return cloudFileUrl || `${protocol}://${host}/uploads/${filename}`;
    };

    if (images && Array.isArray(images)) {
      const urls = (await Promise.all(images.map(img => saveAndUploadSingle(img)))).filter(u => u.length > 0);
      return res.json({ success: true, urls });
    }

    if (image) {
      const url = await saveAndUploadSingle(image);
      return res.json({ success: true, url });
    }

    return res.status(400).json({ success: false, message: 'No image base64 provided' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
