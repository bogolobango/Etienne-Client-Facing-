// ================================================================
// Zenoti → Supabase Sync Engine
// Runs server-side only (Vercel serverless via /api/sync)
// Uses existing Zenoti types from src/integrations/zenoti/
// ================================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ZenotiCentersResponse,
  ZenotiCenter,
  ZenotiServicesResponse,
  ZenotiService,
  ZenotiGuestsResponse,
  ZenotiGuest,
  ZenotiAppointmentsResponse,
  ZenotiAppointment,
  ZenotiEmployeesResponse,
  ZenotiEmployee,
} from '@/integrations/zenoti/types'
import type { SyncOptions } from './types'

// ── Direct Zenoti HTTP client (server-side, no proxy needed) ────

interface ZenotiServerConfig {
  baseUrl: string
  apiKey: string
}

async function zenotiServerRequest<T>(
  config: ZenotiServerConfig,
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(path, config.baseUrl)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `apikey ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Zenoti API error ${res.status}: ${await res.text()}`)
  }

  return (await res.json()) as T
}

// ── Sync functions ──────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getDateRange(options: SyncOptions, lastSyncDate: string | null): { startDate: string; endDate: string } {
  const endDate = formatDate(new Date())

  if (options.fullSync) {
    const start = new Date()
    start.setDate(start.getDate() - (options.daysBack ?? 365))
    return { startDate: formatDate(start), endDate }
  }

  if (lastSyncDate) {
    return { startDate: lastSyncDate, endDate }
  }

  // First sync: default to 90 days back
  const start = new Date()
  start.setDate(start.getDate() - (options.daysBack ?? 90))
  return { startDate: formatDate(start), endDate }
}

/** Sync centers (locations) from Zenoti into Supabase */
export async function syncCenters(
  supabase: SupabaseClient,
  zenoti: ZenotiServerConfig,
  workspaceId: string,
): Promise<number> {
  const response = await zenotiServerRequest<ZenotiCentersResponse>(zenoti, '/v1/centers')
  const centers = response.centers.filter((c: ZenotiCenter) => c.is_active)

  if (centers.length === 0) return 0

  const rows = centers.map((c: ZenotiCenter) => ({
    workspace_id: workspaceId,
    external_id: c.id,
    name: c.display_name || c.name,
    city: c.city || null,
    state: c.state?.code || c.state?.name || null,
    rooms: c.rooms?.filter((r) => r.is_active).length ?? 4,
    providers: c.provider_count ?? 2,
  }))

  const { error } = await supabase
    .from('locations')
    .upsert(rows, { onConflict: 'workspace_id,external_id' })

  if (error) throw new Error(`Failed to sync centers: ${error.message}`)
  return rows.length
}

/** Sync services from Zenoti into Supabase */
export async function syncServices(
  supabase: SupabaseClient,
  zenoti: ZenotiServerConfig,
  workspaceId: string,
  centerIds: string[],
): Promise<number> {
  let totalSynced = 0

  for (const centerId of centerIds) {
    const response = await zenotiServerRequest<ZenotiServicesResponse>(
      zenoti,
      `/v1/centers/${centerId}/services`,
    )
    const services = response.services.filter((s: ZenotiService) => s.is_active)

    if (services.length === 0) continue

    const rows = services.map((s: ZenotiService) => ({
      workspace_id: workspaceId,
      external_id: s.id,
      name: s.name,
      price: s.price?.sales ?? 0,
      duration: s.duration ?? 0,
      category: s.category?.name ?? null,
    }))

    const { error } = await supabase
      .from('services')
      .upsert(rows, { onConflict: 'workspace_id,external_id' })

    if (error) throw new Error(`Failed to sync services for center ${centerId}: ${error.message}`)
    totalSynced += rows.length
  }

  return totalSynced
}

/** Sync guests (clients) from Zenoti into Supabase */
export async function syncGuests(
  supabase: SupabaseClient,
  zenoti: ZenotiServerConfig,
  workspaceId: string,
  centerIds: string[],
): Promise<number> {
  let totalSynced = 0

  // Look up location UUIDs by external_id
  const { data: locationRows } = await supabase
    .from('locations')
    .select('id, external_id')
    .eq('workspace_id', workspaceId)

  const locationMap = new Map<string, string>()
  for (const row of locationRows ?? []) {
    locationMap.set(row.external_id, row.id)
  }

  for (const centerId of centerIds) {
    let page = 1
    const pageSize = 100
    let hasMore = true

    while (hasMore) {
      const response = await zenotiServerRequest<ZenotiGuestsResponse>(
        zenoti,
        `/v1/centers/${centerId}/guests`,
        { page, size: pageSize },
      )
      const guests = response.guests.filter((g: ZenotiGuest) => g.is_active)

      if (guests.length === 0) {
        hasMore = false
        continue
      }

      const rows = guests.map((g: ZenotiGuest) => ({
        workspace_id: workspaceId,
        external_id: g.id,
        name: `${g.personal_info.first_name} ${g.personal_info.last_name}`.trim(),
        email: g.personal_info.email || null,
        phone: g.personal_info.mobile_phone?.number || null,
        preferred_location_id: locationMap.get(g.home_center_id ?? g.center_id) ?? null,
        join_date: g.creation_date ? g.creation_date.slice(0, 10) : null,
      }))

      const { error } = await supabase
        .from('clients')
        .upsert(rows, { onConflict: 'workspace_id,external_id' })

      if (error) throw new Error(`Failed to sync guests for center ${centerId}: ${error.message}`)
      totalSynced += rows.length

      hasMore = guests.length === pageSize
      page++
    }
  }

  return totalSynced
}

/** Sync employees (providers) from Zenoti into Supabase */
export async function syncEmployees(
  supabase: SupabaseClient,
  zenoti: ZenotiServerConfig,
  workspaceId: string,
  centerIds: string[],
): Promise<number> {
  let totalSynced = 0

  // Look up location UUIDs
  const { data: locationRows } = await supabase
    .from('locations')
    .select('id, external_id')
    .eq('workspace_id', workspaceId)

  const locationMap = new Map<string, string>()
  for (const row of locationRows ?? []) {
    locationMap.set(row.external_id, row.id)
  }

  for (const centerId of centerIds) {
    const response = await zenotiServerRequest<ZenotiEmployeesResponse>(
      zenoti,
      `/v1/centers/${centerId}/employees`,
      { page: 1, size: 100 },
    )
    const employees = response.employees.filter((e: ZenotiEmployee) => e.is_active)

    if (employees.length === 0) continue

    const rows = employees.map((e: ZenotiEmployee) => ({
      workspace_id: workspaceId,
      external_id: e.id,
      name: `${e.personal_info.first_name} ${e.personal_info.last_name}`.trim(),
      title: e.job_title || null,
      location_id: locationMap.get(e.center_id) ?? null,
      hourly_rate: null,
    }))

    const { error } = await supabase
      .from('providers')
      .upsert(rows, { onConflict: 'workspace_id,external_id' })

    if (error) throw new Error(`Failed to sync employees for center ${centerId}: ${error.message}`)
    totalSynced += rows.length
  }

  return totalSynced
}

/** Map Zenoti appointment status code to EIP status string */
function mapStatusCode(status: number): string {
  switch (status) {
    case 0:
    case 1:
    case 2:
      return 'confirmed'
    case 4:
      return 'completed'
    case 10:
      return 'no_show'
    case -1:
      return 'cancelled'
    default:
      return 'confirmed'
  }
}

/** Map Zenoti booking source code to EIP bookedBy string */
function mapBookingSourceCode(source: number): string {
  switch (source) {
    case 0:
    case 1:
      return 'staff'
    case 2:
    case 3:
      return 'online'
    case 4:
      return 'ai'
    default:
      return 'staff'
  }
}

/** Sync appointments from Zenoti into Supabase */
export async function syncAppointments(
  supabase: SupabaseClient,
  zenoti: ZenotiServerConfig,
  workspaceId: string,
  centerIds: string[],
  options: SyncOptions,
  lastSyncDate: string | null,
): Promise<number> {
  const { startDate, endDate } = getDateRange(options, lastSyncDate)
  let totalSynced = 0

  // Build lookup maps for foreign keys
  const { data: locationRows } = await supabase
    .from('locations')
    .select('id, external_id')
    .eq('workspace_id', workspaceId)

  const { data: clientRows } = await supabase
    .from('clients')
    .select('id, external_id')
    .eq('workspace_id', workspaceId)

  const { data: serviceRows } = await supabase
    .from('services')
    .select('id, external_id')
    .eq('workspace_id', workspaceId)

  const { data: providerRows } = await supabase
    .from('providers')
    .select('id, external_id')
    .eq('workspace_id', workspaceId)

  const locationMap = new Map<string, string>()
  for (const row of locationRows ?? []) locationMap.set(row.external_id, row.id)

  const clientMap = new Map<string, string>()
  for (const row of clientRows ?? []) clientMap.set(row.external_id, row.id)

  const serviceMap = new Map<string, string>()
  for (const row of serviceRows ?? []) serviceMap.set(row.external_id, row.id)

  const providerMap = new Map<string, string>()
  for (const row of providerRows ?? []) providerMap.set(row.external_id, row.id)

  for (const centerId of centerIds) {
    let page = 1
    const pageSize = 200
    let hasMore = true

    while (hasMore) {
      const response = await zenotiServerRequest<ZenotiAppointmentsResponse>(
        zenoti,
        '/v1/appointments',
        {
          center_id: centerId,
          start_date: startDate,
          end_date: endDate,
          page,
          size: pageSize,
        },
      )
      const appointments = response.appointments

      if (appointments.length === 0) {
        hasMore = false
        continue
      }

      const rows = appointments.map((a: ZenotiAppointment) => {
        const start = new Date(a.start_time)
        const end = new Date(a.end_time)
        const revenue = a.price?.sales ?? 0

        return {
          workspace_id: workspaceId,
          external_id: a.appointment_id,
          client_id: clientMap.get(a.guest.id) ?? null,
          service_id: serviceMap.get(a.service.id) ?? null,
          provider_id: providerMap.get(a.therapist.id) ?? null,
          location_id: locationMap.get(a.center_id) ?? null,
          date: start.toISOString().slice(0, 10),
          start_time: start.toTimeString().slice(0, 8),
          end_time: end.toTimeString().slice(0, 8),
          status: mapStatusCode(a.status),
          booked_by: mapBookingSourceCode(a.booking_source),
          revenue: Math.max(0, revenue),
          normalized_revenue: Math.max(0, revenue),
          sale_type: 'service',
          package_id: null,
          package_session: null,
        }
      })

      const { error } = await supabase
        .from('appointments')
        .upsert(rows, { onConflict: 'workspace_id,external_id' })

      if (error) throw new Error(`Failed to sync appointments for center ${centerId}: ${error.message}`)
      totalSynced += rows.length

      hasMore = appointments.length === pageSize
      page++
    }
  }

  return totalSynced
}

/** Run the full Zenoti sync pipeline */
export async function runZenotiSync(
  supabase: SupabaseClient,
  workspaceId: string,
  options: SyncOptions = {},
): Promise<number> {
  // Get workspace Zenoti credentials
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('zenoti_api_url, zenoti_api_key')
    .eq('id', workspaceId)
    .single()

  if (wsError || !workspace) {
    throw new Error(`Workspace not found: ${wsError?.message ?? 'unknown error'}`)
  }

  if (!workspace.zenoti_api_url || !workspace.zenoti_api_key) {
    throw new Error('Zenoti credentials not configured for this workspace')
  }

  const zenoti: ZenotiServerConfig = {
    baseUrl: workspace.zenoti_api_url,
    apiKey: workspace.zenoti_api_key,
  }

  // Get last sync date for incremental sync
  let lastSyncDate: string | null = null
  if (!options.fullSync) {
    const { data: lastSync } = await supabase
      .from('sync_log')
      .select('completed_at')
      .eq('workspace_id', workspaceId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    if (lastSync?.completed_at) {
      lastSyncDate = new Date(lastSync.completed_at).toISOString().slice(0, 10)
    }
  }

  let totalRecords = 0

  // 1. Sync centers (locations)
  totalRecords += await syncCenters(supabase, zenoti, workspaceId)

  // Get center IDs for subsequent syncs
  const { data: locations } = await supabase
    .from('locations')
    .select('external_id')
    .eq('workspace_id', workspaceId)

  const centerIds = (locations ?? []).map((l) => l.external_id)

  if (centerIds.length === 0) {
    return totalRecords
  }

  // 2. Sync services
  totalRecords += await syncServices(supabase, zenoti, workspaceId, centerIds)

  // 3. Sync guests (clients)
  totalRecords += await syncGuests(supabase, zenoti, workspaceId, centerIds)

  // 4. Sync employees (providers)
  totalRecords += await syncEmployees(supabase, zenoti, workspaceId, centerIds)

  // 5. Sync appointments
  totalRecords += await syncAppointments(supabase, zenoti, workspaceId, centerIds, options, lastSyncDate)

  return totalRecords
}
