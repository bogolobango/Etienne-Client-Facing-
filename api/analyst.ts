import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { question, metrics, locations, alerts } = await req.json();

    const systemPrompt = `You are the Revenue Analyst AI for a multi-location med spa practice called GlowUp Aesthetics. You have access to the following real-time operational data from their Zenoti booking platform.

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

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
