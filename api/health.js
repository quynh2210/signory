export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    app: 'SIGNORY Vercel Serverless API',
    timestamp: new Date().toISOString()
  });
}
