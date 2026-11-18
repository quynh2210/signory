import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'di7xar1oz',
  api_key: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || '815682547284463',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'rwXAxgY6916noL7fj4DEtb9xXjs',
  secure: true
});

export default async function handler(req, res) {
  // CORS headers
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
    const { folder = 'signory' } = body;
    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
      timestamp: timestamp,
      folder: folder
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET || 'rwXAxgY6916noL7fj4DEtb9xXjs'
    );

    return res.status(200).json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'di7xar1oz',
      apiKey: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || '815682547284463',
      folder
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return res.status(500).json({ error: error.message });
  }
}
