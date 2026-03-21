export interface SyncOptions {
  fullSync?: boolean
  daysBack?: number
}

export interface SyncResult {
  status: 'completed' | 'failed'
  recordsSynced: number
  error?: string
  duration: number
}

export interface SyncState {
  lastSyncDate: string | null
  isRunning: boolean
}
