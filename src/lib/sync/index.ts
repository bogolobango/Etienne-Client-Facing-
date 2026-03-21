// ================================================================
// Sync Orchestrator
// Coordinates Zenoti sync → metrics aggregation → analytics cache
// Runs server-side only (Vercel serverless via /api/sync)
// ================================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { SyncOptions, SyncResult } from './types'
import { runZenotiSync } from './zenoti-sync'
import { aggregateMetrics } from './metrics-aggregator'

/**
 * Run the full sync pipeline:
 * 1. Pull data from Zenoti into Supabase tables
 * 2. Aggregate appointment data into daily_metrics
 * 3. Recompute analytics cache
 */
export async function runSync(
  supabase: SupabaseClient,
  workspaceId: string,
  options: SyncOptions = {},
): Promise<SyncResult> {
  const startTime = Date.now()
  const syncType = options.fullSync ? 'full' : 'incremental'

  // Create sync log entry
  const { data: syncLog, error: logError } = await supabase
    .from('sync_log')
    .insert({
      workspace_id: workspaceId,
      sync_type: syncType,
      status: 'running',
      records_synced: 0,
    })
    .select('id')
    .single()

  if (logError) {
    throw new Error(`Failed to create sync log: ${logError.message}`)
  }

  const syncLogId = syncLog.id

  try {
    // Step 1: Sync from Zenoti
    const recordsSynced = await runZenotiSync(supabase, workspaceId, options)

    // Step 2: Aggregate metrics
    const metricsCount = await aggregateMetrics(supabase, workspaceId)

    // Step 3: Recompute analytics cache
    await recomputeAnalyticsCache(supabase, workspaceId)

    const totalRecords = recordsSynced + metricsCount
    const duration = Date.now() - startTime

    // Update sync log
    await supabase
      .from('sync_log')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_synced: totalRecords,
      })
      .eq('id', syncLogId)

    return {
      status: 'completed',
      recordsSynced: totalRecords,
      duration,
    }
  } catch (err) {
    const duration = Date.now() - startTime
    const errorMessage = err instanceof Error ? err.message : 'Unknown sync error'

    // Update sync log with failure
    await supabase
      .from('sync_log')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq('id', syncLogId)

    return {
      status: 'failed',
      recordsSynced: 0,
      error: errorMessage,
      duration,
    }
  }
}

/**
 * Recompute the analytics_cache table with pre-aggregated data
 * for fast dashboard reads.
 */
async function recomputeAnalyticsCache(
  supabase: SupabaseClient,
  workspaceId: string,
): Promise<void> {
  // Fetch all locations
  const { data: locations } = await supabase
    .from('locations')
    .select('id, external_id, name')
    .eq('workspace_id', workspaceId)

  if (!locations || locations.length === 0) return

  // Fetch all daily_metrics for this workspace (last 90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { data: metricsRows } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('workspace_id', workspaceId)
    .gte('date', ninetyDaysAgo.toISOString().slice(0, 10))

  if (!metricsRows || metricsRows.length === 0) return

  // Build "all" aggregate
  const allResult = buildAggregate(metricsRows)
  const cacheRows = [
    {
      workspace_id: workspaceId,
      location_filter: 'all',
      result: allResult,
      computed_at: new Date().toISOString(),
    },
  ]

  // Build per-location aggregates
  for (const loc of locations) {
    const locMetrics = metricsRows.filter((m) => m.location_id === loc.id)
    if (locMetrics.length === 0) continue
    cacheRows.push({
      workspace_id: workspaceId,
      location_filter: loc.id,
      result: buildAggregate(locMetrics),
      computed_at: new Date().toISOString(),
    })
  }

  await supabase
    .from('analytics_cache')
    .upsert(cacheRows, { onConflict: 'workspace_id,location_filter' })
}

interface MetricsRow {
  date: string
  revenue: number
  normalized_revenue: number
  bookings: number
  package_bookings: number
  no_shows: number
  no_show_rate: number
  utilization_rate: number
  new_clients: number
}

function buildAggregate(rows: MetricsRow[]): Record<string, unknown> {
  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.revenue), 0)
  const totalNormalizedRevenue = rows.reduce((sum, r) => sum + Number(r.normalized_revenue), 0)
  const totalBookings = rows.reduce((sum, r) => sum + (r.bookings ?? 0), 0)
  const totalPackageBookings = rows.reduce((sum, r) => sum + (r.package_bookings ?? 0), 0)
  const totalNoShows = rows.reduce((sum, r) => sum + (r.no_shows ?? 0), 0)
  const totalNewClients = rows.reduce((sum, r) => sum + (r.new_clients ?? 0), 0)

  const avgNoShowRate = rows.length > 0
    ? rows.reduce((sum, r) => sum + Number(r.no_show_rate), 0) / rows.length
    : 0

  const avgUtilization = rows.length > 0
    ? rows.reduce((sum, r) => sum + Number(r.utilization_rate), 0) / rows.length
    : 0

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalNormalizedRevenue: Math.round(totalNormalizedRevenue * 100) / 100,
    totalBookings,
    totalPackageBookings,
    totalNoShows,
    totalNewClients,
    avgNoShowRate: Math.round(avgNoShowRate * 100) / 100,
    avgUtilization: Math.round(avgUtilization * 100) / 100,
    days: rows.length,
    periodStart: rows.reduce((min, r) => (r.date < min ? r.date : min), rows[0].date),
    periodEnd: rows.reduce((max, r) => (r.date > max ? r.date : max), rows[0].date),
  }
}

export type { SyncOptions, SyncResult } from './types'
