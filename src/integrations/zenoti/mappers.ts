// ================================================================
// Data Mappers — Zenoti API responses → EIP domain types
// These let the dashboard consume Zenoti data through the
// same interfaces the seed data already satisfies.
// ================================================================

import type {
  Location,
  Service,
  Appointment,
  Client,
  DailyMetrics,
} from '@/types'

import type {
  ZenotiCenter,
  ZenotiService,
  ZenotiAppointment,
  ZenotiGuest,
  ZenotiSalesReport,
  ZenotiDailySales,
  ZenotiCollection,
} from './types'

// ── Centers → Locations ─────────────────────────────────────────

export function mapCenter(c: ZenotiCenter): Location {
  return {
    id: c.id,
    name: c.display_name || c.name,
    city: c.city,
    state: c.state?.code ?? c.state?.name ?? '',
    rooms: c.rooms?.filter((r) => r.is_active).length ?? 0,
    providers: c.provider_count ?? 0,
  }
}

export function mapCenters(centers: ZenotiCenter[]): Location[] {
  return centers.filter((c) => c.is_active).map(mapCenter)
}

// ── Services ────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, Service['category']> = {
  injectable: 'Injectable',
  injectables: 'Injectable',
  facial: 'Facial',
  facials: 'Facial',
  laser: 'Laser',
  body: 'Body',
  'body contouring': 'Body',
}

function inferServiceCategory(
  zenotiCategory: string,
): Service['category'] {
  const key = zenotiCategory.toLowerCase().trim()
  return CATEGORY_MAP[key] ?? 'Facial' // default fallback
}

export function mapService(s: ZenotiService): Service {
  return {
    id: s.id,
    name: s.name,
    price: s.price?.sales ?? 0,
    duration: s.duration,
    category: inferServiceCategory(s.category?.name ?? ''),
  }
}

export function mapServices(services: ZenotiService[]): Service[] {
  return services.filter((s) => s.is_active).map(mapService)
}

// ── Appointments ────────────────────────────────────────────────

/**
 * Zenoti status codes → EIP status strings
 *  0 = Booked     → confirmed
 *  1 = Confirmed  → confirmed
 *  2 = Checked‑in → confirmed
 *  4 = Completed  → completed
 * 10 = No‑show    → no_show
 * -1 = Cancelled  → cancelled
 */
function mapAppointmentStatus(
  status: number,
): Appointment['status'] {
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

/**
 * Zenoti booking source → EIP bookedBy
 * 0 = Walk‑in → staff,  1 = Phone → staff,
 * 2 = Online → online,  3 = App → online,  4 = API → ai
 */
function mapBookingSource(source: number): Appointment['bookedBy'] {
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

export function mapAppointment(a: ZenotiAppointment): Appointment {
  const start = new Date(a.start_time)
  const end = new Date(a.end_time)

  return {
    id: a.appointment_id,
    clientName: `${a.guest.first_name} ${a.guest.last_name}`.trim(),
    clientId: a.guest.id,
    service: a.service?.name ?? '',
    provider: `${a.therapist.first_name} ${a.therapist.last_name}`.trim(),
    locationId: a.center_id,
    date: start.toISOString().slice(0, 10),
    startTime: start.toTimeString().slice(0, 5),
    endTime: end.toTimeString().slice(0, 5),
    status: mapAppointmentStatus(a.status),
    bookedBy: mapBookingSource(a.booking_source),
    noShowRisk: 'low', // EIP AI calculates this separately
    room: a.room ? 1 : 1, // Zenoti returns room object; map to number
    revenue: a.price?.sales ?? 0,
  }
}

export function mapAppointments(
  appointments: ZenotiAppointment[],
): Appointment[] {
  return appointments.map(mapAppointment)
}

// ── Guests → Clients ────────────────────────────────────────────

export function mapGuest(g: ZenotiGuest): Client {
  const p = g.personal_info
  return {
    id: g.id,
    name: `${p.first_name} ${p.last_name}`.trim(),
    email: p.email ?? '',
    phone: p.mobile_phone?.number ?? p.home_phone?.number ?? '',
    preferredLocation: g.home_center_id ?? g.center_id,
    totalVisits: g.total_visits ?? 0,
    clv: g.clv ?? 0,
    lastVisit: g.last_visit_date ?? g.creation_date,
    joinDate: g.creation_date,
    favoriteService: g.preferred_service_id ?? '',
    noShowCount: g.no_show_count ?? 0,
  }
}

export function mapGuests(guests: ZenotiGuest[]): Client[] {
  return guests.filter((g) => g.is_active).map(mapGuest)
}

// ── Sales / Collections → DailyMetrics ──────────────────────────

/**
 * Convert a Zenoti daily sales breakdown row + appointment stats
 * into the EIP DailyMetrics shape.
 *
 * For fields that Zenoti doesn't provide natively (responseTimeAvg,
 * callsAnswered, aiResolved, etc.) we set zero — EIP's own AI
 * modules fill these in from the command‑center channel.
 */
export function mapDailySales(
  d: ZenotiDailySales,
  centerId: string,
): DailyMetrics {
  const bookings = d.bookings ?? 0
  const noShows = d.no_shows ?? 0
  return {
    date: d.date,
    locationId: centerId,
    revenue: d.revenue ?? 0,
    bookings,
    noShows,
    noShowRate: bookings > 0 ? (noShows / bookings) * 100 : 0,
    responseTimeAvg: 0, // Populated by EIP command‑center
    utilizationRate: (d.utilization_rate ?? 0) * 100,
    newClients: d.new_clients ?? 0,
    rebookingRate: 0, // Calculated separately by EIP
    callsAnswered: 0, // Populated by EIP command‑center
    callsMissed: 0,
    aiResolved: 0,
    escalated: 0,
    revenueRecovered: 0,
  }
}

/** Map a full sales report into an array of DailyMetrics */
export function mapSalesReport(report: ZenotiSalesReport): DailyMetrics[] {
  return (report.daily_breakdown ?? []).map((d) =>
    mapDailySales(d, report.center_id),
  )
}

/**
 * Map Zenoti collections (daily revenue summaries) into DailyMetrics.
 * This is a lightweight alternative when the v2 sales report
 * endpoint is unavailable.
 */
export function mapCollection(c: ZenotiCollection): DailyMetrics {
  return {
    date: c.date,
    locationId: c.center_id,
    revenue: c.net_revenue ?? c.total_revenue ?? 0,
    bookings: c.total_transactions ?? 0,
    noShows: 0,
    noShowRate: 0,
    responseTimeAvg: 0,
    utilizationRate: 0,
    newClients: 0,
    rebookingRate: 0,
    callsAnswered: 0,
    callsMissed: 0,
    aiResolved: 0,
    escalated: 0,
    revenueRecovered: 0,
  }
}

export function mapCollections(
  collections: ZenotiCollection[],
): DailyMetrics[] {
  return collections.map(mapCollection)
}
