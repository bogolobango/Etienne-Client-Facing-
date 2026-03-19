// ================================================================
// Zenoti HTTP Client — routes through /api/zenoti-proxy to avoid
// CORS issues and keep credentials server-side during transit.
// ================================================================

import { useZenotiStore } from '@/stores/useZenotiStore'

// ── Configuration ───────────────────────────────────────────────

export interface ZenotiConfig {
  baseUrl: string
  apiKey?: string
}

/** Read config from the Zustand store (live credentials) */
export function getZenotiConfig(): ZenotiConfig {
  const { credentials } = useZenotiStore.getState()
  return {
    baseUrl: credentials?.baseUrl ?? 'https://api.zenoti.com',
    apiKey: credentials?.apiKey ?? undefined,
  }
}

// ── Core fetch wrapper ──────────────────────────────────────────

export interface ZenotiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
}

/**
 * Core request function. Routes through /api/zenoti-proxy serverless
 * function to avoid CORS and keep API keys off the client.
 */
export async function zenotiRequest<T>(
  path: string,
  options: ZenotiRequestOptions = {},
): Promise<T> {
  const config = getZenotiConfig()
  const { method = 'GET', body, params } = options

  if (!config.apiKey) {
    throw new ZenotiAuthError('No Zenoti API key configured. Connect in Settings.')
  }

  // Clean params — remove undefined values
  const cleanParams: Record<string, string> | undefined = params
    ? Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    : undefined

  // Retry with exponential back-off
  const MAX_RETRIES = 3
  const RETRY_DELAYS = [1000, 2000, 4000]

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch('/api/zenoti-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-zenoti-base-url': config.baseUrl,
        'x-zenoti-api-key': config.apiKey,
      },
      body: JSON.stringify({
        path,
        method,
        params: cleanParams,
        body,
      }),
    })

    if (res.ok) {
      return (await res.json()) as T
    }

    const isRetryable =
      res.status === 429 || (res.status >= 500 && res.status < 600)

    if (isRetryable && attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAYS[attempt])
      continue
    }

    const errorBody = await res.json().catch(() => null)
    throw new ZenotiApiError(
      res.status,
      errorBody?.error ?? `Request failed (${res.status})`,
      errorBody,
    )
  }

  throw new ZenotiApiError(500, 'Unexpected retry loop exit')
}

// ── Error classes ───────────────────────────────────────────────

export class ZenotiApiError extends Error {
  status: number
  response: unknown

  constructor(status: number, message: string, response?: unknown) {
    super(message)
    this.name = 'ZenotiApiError'
    this.status = status
    this.response = response ?? null
  }
}

export class ZenotiAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ZenotiAuthError'
  }
}

// ── Internal helpers ────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
