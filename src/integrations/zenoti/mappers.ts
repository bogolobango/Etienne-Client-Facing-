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
  RevenueBreakdown,
} from '@/types'

import type {
  ZenotiCenter,
  ZenotiService,
  ZenotiAppointment,
  ZenotiGuest,
  ZenotiSalesReport,
  ZenotiDailySales,
  ZenotiCollection,
  ZenotiInvoice,
} from './types'

// ================================================================
// Data Cleansing & Validation Utilities
// ================================================================

/** Clamp a number to a valid range */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Ensure revenue is non-negative, capped at a sane daily max */
function cleanRevenue(value: number | null | undefined): number {
  const v = value ?? 0
  if (v < 0) return 0
  // Flag anything over $500k/day as likely erroneous
  if (v > 500000) return 0
  return Math.round(v * 100) / 100
}

/** Ensure percentage is between 0 and 100 */
function cleanPercent(value: number | null | undefined): number {
  return clamp(value ?? 0, 0, 100)
}

/** Ensure a count is non-negative integer */
function cleanCount(value: number | null | undefined): number {
  const v = Math.round(value ?? 0)
  return v < 0 ? 0 : v
}

/** Validate an ISO date string */
function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr)
  return !isNaN(d.getTime())
}

/** Clean and trim a string, replacing null/undefined with empty */
function cleanString(value: string | null | undefined): string {
  return (value ?? '').trim()
}

// ── Centers → Locations ─────────────────────────────────────────

export function mapCenter(c: ZenotiCenter): Location {
  return {
    id: c.id,
    name: cleanString(c.display_name) || cleanString(c.name),
    city: cleanString(c.city),
    state: cleanString(c.state?.code ?? c.state?.name),
    rooms: c.rooms?.filter((r) => r.is_active).length ?? 0,
    providers: cleanCount(c.provider_count),
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
    name: cleanString(s.name),
    price: cleanRevenue(s.price?.sales),
    duration: cleanCount(s.duration),
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
  const revenue = cleanRevenue(a.price?.sales)

  return {
    id: a.appointment_id,
    clientName: cleanString(`${a.guest.first_name} ${a.guest.last_name}`),
    clientId: a.guest.id,
    service: cleanString(a.service?.name),
    provider: cleanString(`${a.therapist.first_name} ${a.therapist.last_name}`),
    locationId: a.center_id,
    date: start.toISOString().slice(0, 10),
    startTime: start.toTimeString().slice(0, 5),
    endTime: end.toTimeString().slice(0, 5),
    status: mapAppointmentStatus(a.status),
    bookedBy: mapBookingSource(a.booking_source),
    noShowRisk: 'low', // EIP AI calculates this separately
    room: a.room ? 1 : 1,
    revenue,
    normalizedRevenue: revenue, // Will be updated by normalizePackageRevenue()
    saleType: 'service', // Default; updated when invoice data is available
  }
}

export function mapAppointments(
  appointments: ZenotiAppointment[],
): Appointment[] {
  return appointments
    .filter((a) => isValidDate(a.start_time)) // Skip appointments with invalid dates
    .map(mapAppointment)
}

// ── Invoice → Appointment enrichment ────────────────────────────

/**
 * Enrich appointments with invoice data to determine sale type
 * and package information. Call this after mapping appointments.
 */
export function enrichAppointmentsFromInvoice(
  appointments: Appointment[],
  invoice: ZenotiInvoice,
): Appointment[] {
  const packageItems = invoice.items.filter((i) => i.type === 'package')
  const serviceItems = invoice.items.filter((i) => i.type === 'service')

  return appointments.map((apt) => {
    // Check if any invoice item matches this appointment's service
    const pkgItem = packageItems.find(
      (i) => cleanString(i.name).toLowerCase().includes(apt.service.toLowerCase()),
    )

    if (pkgItem) {
      return {
        ...apt,
        saleType: 'package' as const,
        revenue: cleanRevenue(pkgItem.net.amount),
        // normalizedRevenue will be computed by normalizePackageRevenue()
      }
    }

    const svcItem = serviceItems.find(
      (i) => cleanString(i.name).toLowerCase().includes(apt.service.toLowerCase()),
    )
    if (svcItem) {
      return {
        ...apt,
        saleType: 'service' as const,
        revenue: cleanRevenue(svcItem.net.amount),
        normalizedRevenue: cleanRevenue(svcItem.net.amount),
      }
    }

    return apt
  })
}

// ── Package Revenue Normalization ───────────────────────────────

/**
 * Spread package revenue evenly across all sessions in the package.
 *
 * Problem: Zenoti may book a 6-session package as $3,000 on day 1 and $0
 * on sessions 2-6. This distorts per-visit revenue, utilization value,
 * and location comparisons.
 *
 * Solution: Group appointments by packageId, divide total package revenue
 * by session count, assign normalizedRevenue to each session.
 */
export function normalizePackageRevenue(
  appointments: Appointment[],
): Appointment[] {
  // Group package appointments by packageId
  const packageGroups = new Map<string, Appointment[]>()

  for (const apt of appointments) {
    if (apt.saleType === 'package' && apt.packageId) {
      const group = packageGroups.get(apt.packageId) ?? []
      group.push(apt)
      packageGroups.set(apt.packageId, group)
    }
  }

  // Normalize revenue within each package group
  const normalized = new Map<string, number>()
  for (const [pkgId, group] of packageGroups) {
    const totalRevenue = group.reduce((sum, a) => sum + a.revenue, 0)
    const perSession = totalRevenue / group.length
    normalized.set(pkgId, perSession)
  }

  return appointments.map((apt) => {
    if (apt.saleType === 'package' && apt.packageId && normalized.has(apt.packageId)) {
      return {
        ...apt,
        normalizedRevenue: Math.round(normalized.get(apt.packageId)! * 100) / 100,
      }
    }
    return apt
  })
}

// ── Guests → Clients ────────────────────────────────────────────

export function mapGuest(g: ZenotiGuest): Client {
  const p = g.personal_info
  return {
    id: g.id,
    name: cleanString(`${p.first_name} ${p.last_name}`),
    email: cleanString(p.email),
    phone: cleanString(p.mobile_phone?.number ?? p.home_phone?.number),
    preferredLocation: g.home_center_id ?? g.center_id,
    totalVisits: cleanCount(g.total_visits),
    clv: cleanRevenue(g.clv),
    lastVisit: g.last_visit_date ?? g.creation_date,
    joinDate: g.creation_date,
    favoriteService: g.preferred_service_id ?? '',
    noShowCount: cleanCount(g.no_show_count),
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
  const bookings = cleanCount(d.bookings)
  const noShows = cleanCount(d.no_shows)
  const revenue = cleanRevenue(d.revenue)

  const revenueByType: RevenueBreakdown = {
    service: cleanRevenue(d.service_revenue),
    package: cleanRevenue(d.package_revenue),
    product: cleanRevenue(d.product_revenue),
    membership: cleanRevenue(d.membership_revenue),
    giftcard: cleanRevenue(d.gift_card_revenue),
  }

  // If individual breakdowns don't exist, attribute all to service
  const breakdownTotal = revenueByType.service + revenueByType.package +
    revenueByType.product + revenueByType.membership + revenueByType.giftcard
  if (breakdownTotal === 0 && revenue > 0) {
    revenueByType.service = revenue
  }

  return {
    date: d.date,
    locationId: centerId,
    revenue,
    normalizedRevenue: revenue - revenueByType.package + revenueByType.package, // placeholder; normalized later
    revenueByType,
    bookings,
    packageBookings: cleanCount(d.package_bookings),
    noShows,
    noShowRate: bookings > 0 ? cleanPercent((noShows / bookings) * 100) : 0,
    responseTimeAvg: 0, // Populated by EIP command‑center
    utilizationRate: cleanPercent((d.utilization_rate ?? 0) * 100),
    newClients: cleanCount(d.new_clients),
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
  const revenueByType: RevenueBreakdown = {
    service: cleanRevenue(c.service_revenue),
    package: cleanRevenue(c.package_revenue),
    product: cleanRevenue(c.product_revenue),
    membership: cleanRevenue(c.membership_revenue),
    giftcard: cleanRevenue(c.gift_card_revenue),
  }

  const revenue = cleanRevenue(c.net_revenue ?? c.total_revenue)

  return {
    date: c.date,
    locationId: c.center_id,
    revenue,
    normalizedRevenue: revenue,
    revenueByType,
    bookings: cleanCount(c.total_transactions),
    packageBookings: 0,
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
