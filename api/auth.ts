import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGINS = [
  'https://etienne-client-facing.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientPassword = process.env.CLIENT_PASSWORD;

  // If no password is configured, skip auth entirely
  if (!clientPassword) {
    return res.status(200).json({ authorized: true });
  }

  const { password } = req.body;

  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password === clientPassword) {
    return res.status(200).json({ authorized: true });
  }

  return res.status(401).json({ authorized: false });
}
