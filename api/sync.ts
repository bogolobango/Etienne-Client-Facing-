import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const ALLOWED_ORIGINS = [
  'https://etienne-client-facing.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Auth: require CLIENT_PASSWORD or API key
  const clientPassword = process.env.CLIENT_PASSWORD
  const authHeader = req.headers.authorization
  const { password, workspaceId, options } = req.body ?? {}

  const isAuthorized =
    // No password configured — allow (dev mode)
    !clientPassword ||
    // Password match
    (typeof password === 'string' && password === clientPassword) ||
    // Bearer token match
    (typeof authHeader === 'string' && authHeader === `Bearer ${clientPassword}`)

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!workspaceId || typeof workspaceId !== 'string') {
    return res.status(400).json({ error: 'workspaceId is required' })
  }

  // Validate Supabase env vars
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Dynamic import to keep the sync engine tree-shakeable
    const { runSync } = await import('../src/lib/sync/index')

    const result = await runSync(supabase, workspaceId, options ?? {})

    if (result.status === 'failed') {
      return res.status(500).json({
        error: result.error ?? 'Sync failed',
        duration: result.duration,
      })
    }

    return res.status(200).json({
      status: result.status,
      recordsSynced: result.recordsSynced,
      duration: result.duration,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
