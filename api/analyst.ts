import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGINS = [
  'https://etienne-client-facing.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
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

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Input validation
  const { question, metrics, locations, alerts, clientName } = req.body;
  if (typeof question !== 'string' || question.length === 0 || question.length > 2000) {
    return res.status(400).json({ error: 'Invalid question: must be a string under 2000 characters' });
  }

  const practiceName = (typeof clientName === 'string' && clientName.length > 0) ? clientName : 'GlowUp Aesthetics';

  try {
    const systemPrompt = `You are the Revenue Analyst AI for a multi-location med spa practice called ${practiceName}. You have access to the following real-time operational data from their Zenoti booking platform.

LOCATION PERFORMANCE (last 30 days):
${metrics}

CROSS-LOCATION COMPARISONS:
${locations}

RECENT ALERTS:
${alerts}

Rules:
- Always reference specific location names and dollar amounts from the data above
- Compare locations to each other using the actual numbers provided
- Suggest specific actions, not generic advice
- Use markdown tables when comparing 3+ data points
- Be concise but data-rich
- When asked about a specific location, pull its exact metrics
- Reference "Zenoti data" as your source
- Never say you don't have access to data — you DO have access via the metrics above
- Format currency with $ and commas
- Use bold for key numbers and location names
- Include actionable recommendations with estimated dollar impact where possible`;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
        stream: true,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error('Anthropic API error:', anthropicResponse.status, errorText);
      return res.status(502).json({ error: `Anthropic API error: ${anthropicResponse.status}` });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = anthropicResponse.body as unknown as NodeJS.ReadableStream;
    let buffer = '';
    const decoder = new TextDecoder();

    await new Promise<void>((resolve, reject) => {
      reader.on('data', (chunk: Buffer) => {
        buffer += decoder.decode(chunk, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const event = JSON.parse(data);
              if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                res.write(event.delta.text);
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      });

      reader.on('end', () => {
        if (buffer) {
          const lines = buffer.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const event = JSON.parse(data);
                if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                  res.write(event.delta.text);
                }
              } catch {
                // Skip
              }
            }
          }
        }
        resolve();
      });

      reader.on('error', reject);
    });

    return res.end();
  } catch (error: unknown) {
    console.error('Analyst error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (!res.headersSent) {
      return res.status(500).json({ error: message });
    }
    return res.end();
  }
}
