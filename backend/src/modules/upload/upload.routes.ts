import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads folder exists
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

// 1. Multipart Form File Upload (Single file)
router.post('/file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    return res.json({ success: true, url: fileUrl, filename: req.file.filename });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Multipart Form File Upload (Multiple files)
router.post('/files', upload.array('files', 10), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const urls = files.map(file => `${protocol}://${host}/uploads/${file.filename}`);
    return res.json({ success: true, urls });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Base64 to Static File Converter (Single or Array)
router.post('/base64', (req, res) => {
  try {
    const { image, images } = req.body;
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';

    const saveSingleBase64 = (base64Str: string): string => {
      if (!base64Str || typeof base64Str !== 'string') return '';
      if (!base64Str.startsWith('data:image') && !base64Str.startsWith('data:video')) {
        if (base64Str.startsWith('http')) return base64Str; // Already a URL
        return '';
      }

      const matches = base64Str.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) return '';

      const mimeType = matches[1];
      const dataBuffer = Buffer.from(matches[2], 'base64');
      const ext = mimeType.split('/')[1] || 'png';
      const filename = `upload-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, dataBuffer);
      return `${protocol}://${host}/uploads/${filename}`;
    };

    if (images && Array.isArray(images)) {
      const urls = images.map(img => saveSingleBase64(img)).filter(u => u.length > 0);
      return res.json({ success: true, urls });
    }

    if (image) {
      const url = saveSingleBase64(image);
      return res.json({ success: true, url });
    }

    return res.status(400).json({ success: false, message: 'No image base64 provided' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
