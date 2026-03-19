// ================================================================
// Zenoti Connection Store — tracks integration state + credentials
// ================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ZenotiSyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export interface ZenotiCredentials {
  /** Base URL — differs per data-center (US, EU, AU, etc.) */
  baseUrl: string
  /** API Key (long-lived) — used for server-to-server calls */
  apiKey: string
  /** Display-safe masked version of the key */
  maskedKey: string
  /** Organization / account name */
  accountName: string
}

interface ZenotiState {
  /** Whether the Zenoti integration is active */
  isConnected: boolean
  /** Stored credentials (API key is persisted — acceptable for v1 consulting tool) */
  credentials: ZenotiCredentials | null
  /** Last successful sync timestamp (ISO) */
  lastSyncAt: string | null
  /** Current sync status */
  syncStatus: ZenotiSyncStatus
  /** Human-readable error from last failed sync */
  lastError: string | null
  /** Number of Zenoti centers discovered */
  centerCount: number
  /** Center names discovered during connection test */
  centerNames: string[]

  // Actions
  connect: (credentials: ZenotiCredentials, centerCount: number, centerNames: string[]) => void
  disconnect: () => void
  setSyncStatus: (status: ZenotiSyncStatus, error?: string) => void
  setLastSync: (timestamp: string, centerCount: number) => void
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 4) + '_••••_••••_' + key.slice(-4)
}

export { maskApiKey }

export const useZenotiStore = create<ZenotiState>()(
  persist(
    (set) => ({
      isConnected: false,
      credentials: null,
      lastSyncAt: null,
      syncStatus: 'idle',
      lastError: null,
      centerCount: 0,
      centerNames: [],

      connect: (credentials, centerCount, centerNames) =>
        set({
          isConnected: true,
          credentials,
          centerCount,
          centerNames,
          syncStatus: 'success',
          lastSyncAt: new Date().toISOString(),
          lastError: null,
        }),

      disconnect: () =>
        set({
          isConnected: false,
          credentials: null,
          syncStatus: 'idle',
          lastSyncAt: null,
          lastError: null,
          centerCount: 0,
          centerNames: [],
        }),

      setSyncStatus: (status, error) =>
        set({
          syncStatus: status,
          lastError: error ?? null,
        }),

      setLastSync: (timestamp, centerCount) =>
        set({
          lastSyncAt: timestamp,
          centerCount,
          syncStatus: 'success',
          lastError: null,
        }),
    }),
    {
      name: 'eip-zenoti-connection',
    },
  ),
)
