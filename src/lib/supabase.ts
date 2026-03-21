import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance

  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) return null

  supabaseInstance = createClient(url, key)
  return supabaseInstance
}

// Server-side client (for API routes — used in /api/*.ts Vercel functions)
// Uses globalThis to avoid Vite bundling issues with process.env
export function getSupabaseServer(): SupabaseClient | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (globalThis as any).process?.env ?? {}
  const url: string | undefined = env.SUPABASE_URL
  const key: string | undefined = env.SUPABASE_SERVICE_KEY

  if (!url || !key) return null

  return createClient(url, key)
}
