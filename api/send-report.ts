import type { VercelRequest, VercelResponse } from '@vercel/node';
import { marked } from 'marked';

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

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return res.status(503).json({
      error: 'Email delivery requires configuration. Contact your Etienne representative.',
    });
  }

  const { to, clientName, reportMarkdown, subject } = req.body;

  if (typeof to !== 'string' || !to.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }
  if (typeof reportMarkdown !== 'string' || reportMarkdown.length === 0) {
    return res.status(400).json({ error: 'Report content is required' });
  }

  const safeName = typeof clientName === 'string' ? clientName : 'Client';
  const emailSubject = typeof subject === 'string' && subject.length > 0
    ? subject
    : `${safeName} — Cross-Location Intelligence Report`;

  try {
    const htmlBody = await marked(reportMarkdown);

    const emailHtml = `
      <div style="max-width: 700px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a;">
        <div style="border-bottom: 3px solid #00d4aa; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="color: #00d4aa; font-size: 24px; margin: 0;">Etienne Agency</h1>
          <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Cross-Location Intelligence Report</p>
          <p style="color: #999; font-size: 12px; margin: 8px 0 0 0;">Prepared for: ${safeName}</p>
        </div>
        ${htmlBody}
        <div style="border-top: 1px solid #ddd; padding-top: 16px; margin-top: 32px;">
          <p style="color: #999; font-size: 11px;">Prepared by Etienne Agency — etienneagency.com</p>
        </div>
      </div>
    `;

    // Use Resend API directly via fetch to avoid SDK compatibility issues
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Etienne Agency <reports@etienneagency.com>',
        to: [to],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Resend API error:', resendResponse.status, err);
      return res.status(502).json({ error: err.message || `Email delivery failed (${resendResponse.status})` });
    }

    const result = await resendResponse.json();
    return res.status(200).json({ success: true, id: result.id });
  } catch (error: unknown) {
    console.error('Send report error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send email';
    return res.status(500).json({ error: message });
  }
}
