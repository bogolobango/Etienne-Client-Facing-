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
    const { clientName, metrics, locations, benchmarks } = await req.json();

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

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
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
