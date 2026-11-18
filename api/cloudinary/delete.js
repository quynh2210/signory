import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'di7xar1oz',
  api_key: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || '815682547284463',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'rwXAxgY6916noL7fj4DEtb9xXjs',
  secure: true
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { publicId, resourceType = 'image' } = body;
    if (!publicId) return res.status(400).json({ error: 'publicId is required' });

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: error.message });
  }
}
