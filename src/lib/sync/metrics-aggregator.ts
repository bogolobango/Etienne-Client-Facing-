// ================================================================
// Metrics Aggregator
// After sync, aggregates appointment data into daily_metrics rows.
// Runs server-side only (Vercel serverless).
// ================================================================

import type { SupabaseClient } from '@supabase/supabase-js'

interface AppointmentRow {
  date: string
  location_id: string
  status: string
  revenue: number
  normalized_revenue: number
  sale_type: string
  client_id: string | null
}

interface AggregatedMetrics {
  workspace_id: string
  location_id: string
  date: string
  revenue: number
  normalized_revenue: number
  bookings: number
  package_bookings: number
  no_shows: number
  no_show_rate: number
  utilization_rate: number
  new_clients: number
  rebooking_rate: number
}

/**
 * Aggregate appointment data into daily_metrics for a workspace.
 * Called after the Zenoti sync completes.
 */
export async function aggregateMetrics(
  supabase: SupabaseClient,
  workspaceId: string,
  startDate?: string,
  endDate?: string,
): Promise<number> {
  // Build the appointments query
  let query = supabase
    .from('appointments')
    .select('date, location_id, status, revenue, normalized_revenue, sale_type, client_id')
    .eq('workspace_id', workspaceId)

  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)

  const { data: appointments, error } = await query

  if (error) {
    throw new Error(`Failed to fetch appointments for aggregation: ${error.message}`)
  }

  if (!appointments || appointments.length === 0) return 0

  // Get new client join dates for the workspace
  const { data: clientsData } = await supabase
    .from('clients')
    .select('id, join_date, preferred_location_id')
    .eq('workspace_id', workspaceId)

  const clientJoinDates = new Map<string, { joinDate: string | null; locationId: string | null }>()
  for (const c of clientsData ?? []) {
    clientJoinDates.set(c.id, { joinDate: c.join_date, locationId: c.preferred_location_id })
  }

  // Get location rooms/providers for utilization calculation
  const { data: locationsData } = await supabase
    .from('locations')
    .select('id, rooms, providers')
    .eq('workspace_id', workspaceId)

  const locationCapacity = new Map<string, { rooms: number; providers: number }>()
  for (const loc of locationsData ?? []) {
    locationCapacity.set(loc.id, { rooms: loc.rooms ?? 4, providers: loc.providers ?? 2 })
  }

  // Group appointments by location + date
  const groups = new Map<string, AppointmentRow[]>()
  for (const apt of appointments as AppointmentRow[]) {
    if (!apt.location_id || !apt.date) continue
    const key = `${apt.location_id}|${apt.date}`
    const group = groups.get(key) ?? []
    group.push(apt)
    groups.set(key, group)
  }

  // Aggregate each group
  const metrics: AggregatedMetrics[] = []

  for (const [key, appts] of groups) {
    const [locationId, date] = key.split('|')

    const completed = appts.filter((a) => a.status === 'completed')
    const noShows = appts.filter((a) => a.status === 'no_show')
    const packageBookings = appts.filter((a) => a.sale_type === 'package')
    const totalBookings = appts.filter((a) => a.status !== 'cancelled').length

    const revenue = completed.reduce((sum, a) => sum + (Number(a.revenue) || 0), 0)
    const normalizedRevenue = completed.reduce((sum, a) => sum + (Number(a.normalized_revenue) || 0), 0)

    // Count new clients: clients whose join_date matches this date
    let newClients = 0
    const seenClients = new Set<string>()
    for (const apt of appts) {
      if (apt.client_id && !seenClients.has(apt.client_id)) {
        seenClients.add(apt.client_id)
        const clientInfo = clientJoinDates.get(apt.client_id)
        if (clientInfo?.joinDate === date) {
          newClients++
        }
      }
    }

    // Utilization: completed appointments / (providers * 8 hours * slots per hour)
    const capacity = locationCapacity.get(locationId)
    const slotsPerDay = (capacity?.providers ?? 2) * 8 // 8 hours, 1 slot per hour
    const utilizationRate = slotsPerDay > 0
      ? Math.min(100, Math.round((completed.length / slotsPerDay) * 100 * 100) / 100)
      : 0

    const noShowRate = totalBookings > 0
      ? Math.round((noShows.length / totalBookings) * 100 * 100) / 100
      : 0

    metrics.push({
      workspace_id: workspaceId,
      location_id: locationId,
      date,
      revenue: Math.round(revenue * 100) / 100,
      normalized_revenue: Math.round(normalizedRevenue * 100) / 100,
      bookings: totalBookings,
      package_bookings: packageBookings.length,
      no_shows: noShows.length,
      no_show_rate: noShowRate,
      utilization_rate: utilizationRate,
      new_clients: newClients,
      rebooking_rate: 0, // Requires historical analysis — computed separately
    })
  }

  if (metrics.length === 0) return 0

  // Upsert in batches of 500
  const BATCH_SIZE = 500
  let totalUpserted = 0

  for (let i = 0; i < metrics.length; i += BATCH_SIZE) {
    const batch = metrics.slice(i, i + BATCH_SIZE)
    const { error: upsertError } = await supabase
      .from('daily_metrics')
      .upsert(batch, { onConflict: 'workspace_id,location_id,date' })

    if (upsertError) {
      throw new Error(`Failed to upsert daily_metrics batch: ${upsertError.message}`)
    }
    totalUpserted += batch.length
  }

  return totalUpserted
}
