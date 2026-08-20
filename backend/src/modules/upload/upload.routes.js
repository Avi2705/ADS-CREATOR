"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const router = (0, express_1.Router)();
// Helper: Upload file or base64 to Cloudinary CDN
async function uploadToCloudinary(filePathOrBase64) {
    try {
        const config = cloudinary_1.default.config();
        if (!config.cloud_name || !config.api_key || !config.api_secret) {
            console.warn('[Cloudinary Notice] Credentials incomplete. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.');
            return null;
        }
        const result = await cloudinary_1.default.uploader.upload(filePathOrBase64, {
            folder: 'adhunter_creatives',
            resource_type: 'auto'
        });
        console.log(`[Cloudinary Upload Success] ${result.secure_url}`);
        return result.secure_url;
    }
    catch (err) {
        console.error("Cloudinary upload notice:", err?.message || err);
        return null;
    }
}
// Ensure local uploads folder exists
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure Multer storage
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || '.png';
        const uniqueName = `img-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});
// 1. Multipart Form File Upload (Single file) -> Cloudinary CDN Only
router.post('/file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const localFilePath = path_1.default.join(uploadsDir, req.file.filename);
        const host = req.get('host') || 'localhost:3000';
        const protocol = req.protocol || 'http';
        // Upload directly to Cloudinary CDN
        const cloudinaryUrl = await uploadToCloudinary(localFilePath);
        // Unlink temporary local disk file after Cloudinary upload
        if (cloudinaryUrl && fs_1.default.existsSync(localFilePath)) {
            try {
                fs_1.default.unlinkSync(localFilePath);
            }
            catch (e) { }
        }
        const finalUrl = cloudinaryUrl || `${protocol}://${host}/uploads/${req.file.filename}`;
        return res.json({
            success: true,
            url: finalUrl,
            isPublicCdn: !!cloudinaryUrl,
            filename: req.file.filename
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});
// 2. Multipart Form File Upload (Multiple files) -> Cloudinary CDN Only
router.post('/files', upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        const host = req.get('host') || 'localhost:3000';
        const protocol = req.protocol || 'http';
        const urls = await Promise.all(files.map(async (file) => {
            const localPath = path_1.default.join(uploadsDir, file.filename);
            const cloudUrl = await uploadToCloudinary(localPath);
            if (cloudUrl && fs_1.default.existsSync(localPath)) {
                try {
                    fs_1.default.unlinkSync(localPath);
                }
                catch (e) { }
            }
            return cloudUrl || `${protocol}://${host}/uploads/${file.filename}`;
        }));
        return res.json({ success: true, urls });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});
// 3. Base64 / Media URL to Cloudinary CDN Converter
router.post('/base64', async (req, res) => {
    try {
        const { image, images } = req.body;
        const host = req.get('host') || 'localhost:3000';
        const protocol = req.protocol || 'http';
        const saveAndUploadSingle = async (base64Str) => {
            if (!base64Str || typeof base64Str !== 'string')
                return '';
            // If already a public Cloudinary / HTTPS URL, return directly
            if (base64Str.startsWith('https://') && !base64Str.includes('localhost')) {
                return base64Str;
            }
            // If it is a localhost /uploads/ URL, resolve to local disk path and upload to Cloudinary
            if (base64Str.includes('/uploads/')) {
                const filename = path_1.default.basename(base64Str);
                const diskPath = path_1.default.join(uploadsDir, filename);
                if (fs_1.default.existsSync(diskPath)) {
                    const cloudUrl = await uploadToCloudinary(diskPath);
                    if (cloudUrl) {
                        try {
                            fs_1.default.unlinkSync(diskPath);
                        }
                        catch (e) { }
                        return cloudUrl;
                    }
                }
            }
            // Try Cloudinary directly if it's base64 or existing file path
            if (base64Str.startsWith('data:image') || base64Str.startsWith('data:video') || fs_1.default.existsSync(base64Str)) {
                const cloudUrl = await uploadToCloudinary(base64Str);
                if (cloudUrl)
                    return cloudUrl;
            }
            if (!base64Str.startsWith('data:image') && !base64Str.startsWith('data:video')) {
                return base64Str;
            }
            const matches = base64Str.match(/^data:(.+);base64,(.+)$/);
            if (!matches || matches.length !== 3)
                return '';
            const mimeType = matches[1];
            const dataBuffer = Buffer.from(matches[2], 'base64');
            const ext = mimeType.split('/')[1] || 'png';
            const filename = `upload-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
            const filePath = path_1.default.join(uploadsDir, filename);
            fs_1.default.writeFileSync(filePath, dataBuffer);
            // Upload to Cloudinary and cleanup local file
            const cloudFileUrl = await uploadToCloudinary(filePath);
            if (cloudFileUrl && fs_1.default.existsSync(filePath)) {
                try {
                    fs_1.default.unlinkSync(filePath);
                }
                catch (e) { }
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map