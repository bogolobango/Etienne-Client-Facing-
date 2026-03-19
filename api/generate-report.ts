import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { clientName, metrics, locations, benchmarks } = req.body;

    const systemPrompt = `You are a senior operational intelligence consultant at Etienne Agency. You are generating a professional Cross-Location Intelligence Report (Gap Analysis) for a multi-location med spa client.

Write a complete, data-rich gap analysis report in markdown format. Use the actual data provided — never use placeholder values.

The report must include these sections:

1. **Executive Summary** — 2-3 sentences summarizing the biggest finding with dollar amounts
2. **Location Performance Comparison** — A markdown table comparing all locations across: Revenue, No-Show Rate, Utilization %, Avg Ticket (if available), Rebooking Rate
3. **Revenue Gaps Identified** — Top 3-5 gaps with:
   - Gap name and description
   - Which locations are affected
   - Estimated monthly dollar impact
   - Specific recommendation to close the gap
4. **Industry Benchmarks** — Compare client metrics vs industry averages (AmSpa 2024/2025 data)
5. **90-Day Action Plan** — Prioritized list of 5-7 specific actions with expected impact
6. **Methodology** — Brief note on data source and analysis period

Rules:
- Use specific dollar amounts and percentages from the data
- Compare locations against each other AND against industry benchmarks
- Every gap must have a dollar impact estimate
- Recommendations must be specific and actionable, not generic
- Write in a professional consulting tone
- Use markdown tables for comparisons
- Bold key numbers and findings`;

    const userPrompt = `Generate a Cross-Location Intelligence Report for: ${clientName}

LOCATION DATA (Last 30 Days):
${metrics}

LOCATION DETAILS:
${locations}

INDUSTRY BENCHMARKS:
${benchmarks}

Generate the full report now.`;

    // Use raw fetch to Claude API for streaming (avoids SDK compatibility issues)
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        stream: true,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error('Anthropic API error:', anthropicResponse.status, errorText);
      return res.status(502).json({ error: `Anthropic API error: ${anthropicResponse.status}` });
    }

    // Stream the response back to the client
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = anthropicResponse.body as unknown as NodeJS.ReadableStream;
    const decoder = new TextDecoder();
    const chunks: Buffer[] = [];

    // Read the SSE stream from Anthropic and extract text deltas
    let buffer = '';

    await new Promise<void>((resolve, reject) => {
      reader.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        buffer += decoder.decode(chunk, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

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
        // Process any remaining buffer
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
    console.error('Report generation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (!res.headersSent) {
      return res.status(500).json({ error: message });
    }
    return res.end();
  }
}
