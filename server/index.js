import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

app.use(cors());
app.use(express.json());

const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit for videos

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SIGNORY Backend Server',
    cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET)
  });
});

/**
 * Endpoint to generate upload signature for direct client-to-Cloudinary upload.
 * Keeps CLOUDINARY_API_SECRET strictly on the server!
 */
app.post('/api/cloudinary/sign', (req, res) => {
  try {
    const { folder = 'signory', resourceType = 'auto' } = req.body;
    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
      timestamp: timestamp,
      folder: folder
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Server-side upload endpoint (alternative for direct upload)
 */
app.post('/api/cloudinary/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const isVideo = req.file.mimetype.startsWith('video');
    const isAudio = req.file.mimetype.startsWith('audio');
    const resourceType = isVideo ? 'video' : (isAudio ? 'video' : 'image');

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'signory',
      resource_type: resourceType,
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      duration: result.duration || 0,
      width: result.width || null,
      height: result.height || null,
      originalFilename: req.file.originalname
    });
  } catch (error) {
    console.error('Server upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete media from Cloudinary to prevent garbage files
 */
app.post('/api/cloudinary/delete', async (req, res) => {
  try {
    const { publicId, resourceType = 'image' } = req.body;
    if (!publicId) {
      return res.status(400).json({ error: 'publicId is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error('Cloudinary destroy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 SIGNORY backend running on http://localhost:${port}`);
});
