// ================================================================
// Zenoti HTTP Client — handles auth, retries, and rate‑limiting
// ================================================================

import type {
  ZenotiTokenRequest,
  ZenotiTokenResponse,
  ZenotiErrorResponse,
} from './types'

// ── Configuration ───────────────────────────────────────────────

export interface ZenotiConfig {
  /** Base URL — differs per data‑center (US, EU, AU, etc.) */
  baseUrl: string
  /** API Key (long‑lived, valid ~1 year) — used for server‑to‑server calls */
  apiKey?: string
  /** Application ID from Zenoti Admin > Setup > Apps */
  applicationId?: string
  /** Secret key generated alongside the Application ID */
  secretKey?: string
  /** Account / organization name in Zenoti */
  accountName?: string
}

/** Read config from Vite env vars with sensible defaults */
export function getZenotiConfig(): ZenotiConfig {
  return {
    baseUrl:
      import.meta.env.VITE_ZENOTI_BASE_URL ?? 'https://api.zenoti.com',
    apiKey: import.meta.env.VITE_ZENOTI_API_KEY ?? undefined,
    applicationId: import.meta.env.VITE_ZENOTI_APP_ID ?? undefined,
    secretKey: import.meta.env.VITE_ZENOTI_SECRET_KEY ?? undefined,
    accountName: import.meta.env.VITE_ZENOTI_ACCOUNT_NAME ?? undefined,
  }
}

// ── Token cache ─────────────────────────────────────────────────

let cachedToken: string | null = null
let tokenExpiresAt = 0

function isTokenValid(): boolean {
  return cachedToken !== null && Date.now() < tokenExpiresAt
}

// ── Public helpers ──────────────────────────────────────────────

/**
 * Generate a bearer access token from Zenoti.
 * Token is valid for up to 24 h; we cache it and refresh at 90 % lifetime.
 */
export async function getAccessToken(
  config: ZenotiConfig,
): Promise<string> {
  if (isTokenValid()) return cachedToken!

  if (!config.applicationId || !config.secretKey || !config.accountName) {
    throw new ZenotiAuthError(
      'Missing applicationId, secretKey, or accountName — cannot generate token.',
    )
  }

  const body: ZenotiTokenRequest = {
    account_name: config.accountName,
    application_id: config.applicationId,
    secret_key: config.secretKey,
  }

  const res = await fetch(`${config.baseUrl}/v1/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as ZenotiErrorResponse | null
    throw new ZenotiAuthError(
      err?.errors?.[0]?.message ?? `Token request failed (${res.status})`,
    )
  }

  const data = (await res.json()) as ZenotiTokenResponse
  cachedToken = data.access_token
  // Refresh at 90 % of expiry window (default 24 h = 86 400 s)
  tokenExpiresAt = Date.now() + (data.expires_in ?? 86_400) * 900
  return cachedToken
}

/** Clear the cached bearer token (e.g. on disconnect) */
export function clearAccessToken(): void {
  cachedToken = null
  tokenExpiresAt = 0
}

// ── Core fetch wrapper ──────────────────────────────────────────

export interface ZenotiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  /** Override default headers */
  headers?: Record<string, string>
}

/**
 * Core request function. Adds auth headers, serialises query‑params,
 * handles errors, and supports automatic retry on 429 / 5xx.
 */
export async function zenotiRequest<T>(
  path: string,
  options: ZenotiRequestOptions = {},
): Promise<T> {
  const config = getZenotiConfig()
  const { method = 'GET', body, params, headers: extraHeaders } = options

  // Build URL with query‑string
  const url = new URL(path, config.baseUrl)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  // Auth header — prefer API key, fall back to bearer token
  const authHeader: Record<string, string> = {}
  if (config.apiKey) {
    authHeader['Authorization'] = config.apiKey
  } else {
    const token = await getAccessToken(config)
    authHeader['Authorization'] = `bearer ${token}`
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...authHeader,
    ...extraHeaders,
  }

  // Retry with exponential back‑off (429 rate‑limit & transient 5xx)
  const MAX_RETRIES = 3
  const RETRY_DELAYS = [1000, 2000, 4000]

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (res.ok) {
      return (await res.json()) as T
    }

    const isRetryable =
      res.status === 429 || (res.status >= 500 && res.status < 600)

    if (isRetryable && attempt < MAX_RETRIES) {
      // Use Retry‑After header if present, else exponential back‑off
      const retryAfter = res.headers.get('Retry-After')
      const delay = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : RETRY_DELAYS[attempt]
      await sleep(delay)
      continue
    }

    // Non‑retryable or exhausted retries → throw
    const errorBody = (await res.json().catch(() => null)) as ZenotiErrorResponse | null
    throw new ZenotiApiError(
      res.status,
      errorBody?.errors?.[0]?.message ?? `Request failed (${res.status})`,
      errorBody,
    )
  }

  // Unreachable, but TypeScript needs it
  throw new ZenotiApiError(500, 'Unexpected retry loop exit')
}

// ── Error classes ───────────────────────────────────────────────

export class ZenotiApiError extends Error {
  status: number
  response: ZenotiErrorResponse | null

  constructor(
    status: number,
    message: string,
    response?: ZenotiErrorResponse | null,
  ) {
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
