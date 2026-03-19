import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_ORIGINS = [
  'https://etienne-client-facing.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
]

/**
 * Server-side proxy for Zenoti API calls.
 * Avoids CORS issues and keeps credentials server-side during transit.
 *
 * Expects:
 *   POST /api/zenoti-proxy
 *   Body: { path: string, method?: string, params?: Record<string,string>, body?: unknown }
 *   Headers: x-zenoti-base-url, x-zenoti-api-key (or x-zenoti-token)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-zenoti-base-url, x-zenoti-api-key, x-zenoti-token')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { path, method = 'GET', params, body } = req.body ?? {}

    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Missing required field: path' })
    }

    const baseUrl = (req.headers['x-zenoti-base-url'] as string) || 'https://api.zenoti.com'
    const apiKey = req.headers['x-zenoti-api-key'] as string | undefined
    const token = req.headers['x-zenoti-token'] as string | undefined

    if (!apiKey && !token) {
      return res.status(401).json({ error: 'Missing Zenoti credentials (x-zenoti-api-key or x-zenoti-token)' })
    }

    // Build URL
    const url = new URL(path, baseUrl)
    if (params && typeof params === 'object') {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      }
    }

    // Auth header
    const authHeader = apiKey ? apiKey : `bearer ${token}`

    // Forward request to Zenoti
    const zenotiRes = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const responseData = await zenotiRes.json().catch(() => null)

    if (!zenotiRes.ok) {
      return res.status(zenotiRes.status).json({
        error: 'Zenoti API error',
        status: zenotiRes.status,
        details: responseData,
      })
    }

    return res.status(200).json(responseData)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown proxy error'
    return res.status(500).json({ error: message })
  }
}
