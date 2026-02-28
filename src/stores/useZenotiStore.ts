// ================================================================
// Zenoti Connection Store — tracks integration state
// ================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ZenotiSyncStatus = 'idle' | 'syncing' | 'success' | 'error'

interface ZenotiState {
  /** Whether the Zenoti integration is active */
  isConnected: boolean
  /** Last successful sync timestamp (ISO) */
  lastSyncAt: string | null
  /** Current sync status */
  syncStatus: ZenotiSyncStatus
  /** Human‑readable error from last failed sync */
  lastError: string | null
  /** Number of Zenoti centers discovered */
  centerCount: number

  // Actions
  connect: () => void
  disconnect: () => void
  setSyncStatus: (status: ZenotiSyncStatus, error?: string) => void
  setLastSync: (timestamp: string, centerCount: number) => void
}

export const useZenotiStore = create<ZenotiState>()(
  persist(
    (set) => ({
      isConnected: false,
      lastSyncAt: null,
      syncStatus: 'idle',
      lastError: null,
      centerCount: 0,

      connect: () =>
        set({ isConnected: true, syncStatus: 'idle', lastError: null }),

      disconnect: () =>
        set({
          isConnected: false,
          syncStatus: 'idle',
          lastSyncAt: null,
          lastError: null,
          centerCount: 0,
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
