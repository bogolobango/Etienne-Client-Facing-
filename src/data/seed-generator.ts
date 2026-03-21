/**
 * seed-generator.ts — Deterministic seed data generator for EIP Dashboard
 *
 * Generates ~150 clients, ~500 appointments over 90 days, and derived DailyMetrics.
 * Uses a deterministic PRNG (Mulberry32) so output is stable across runs.
 */

import type {
  Location,
  Service,
  Appointment,
  DailyMetrics,
  RevenueBreakdown,
  Client,
  SaleType,
} from '@/types'

// ---------------------------------------------------------------------------
// PRNG (Mulberry32)
// ---------------------------------------------------------------------------
function createRNG(seed: number) {
  return function (): number {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function dayOfWeek(d: Date): number {
  return d.getDay() // 0=Sun
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

// ---------------------------------------------------------------------------
// Inline reference data
// ---------------------------------------------------------------------------
const LOCATIONS: Location[] = [
  { id: 'soho', name: 'SoHo Flagship', city: 'New York', state: 'NY', rooms: 6, providers: 3 },
  { id: 'williamsburg', name: 'Williamsburg', city: 'Brooklyn', state: 'NY', rooms: 4, providers: 2 },
  { id: 'hoboken', name: 'Hoboken', city: 'Hoboken', state: 'NJ', rooms: 4, providers: 3 },
  { id: 'white-plains', name: 'White Plains', city: 'White Plains', state: 'NY', rooms: 3, providers: 2 },
  { id: 'stamford', name: 'Stamford', city: 'Stamford', state: 'CT', rooms: 3, providers: 2 },
]

const SERVICES: Service[] = [
  { id: 'botox', name: 'Botox', price: 450, duration: 30, category: 'Injectable' },
  { id: 'filler', name: 'Dermal Filler', price: 850, duration: 45, category: 'Injectable' },
  { id: 'hydrafacial', name: 'Hydrafacial', price: 250, duration: 60, category: 'Facial' },
  { id: 'laser', name: 'Laser Hair Removal', price: 350, duration: 45, category: 'Laser' },
  { id: 'peel', name: 'Chemical Peel', price: 200, duration: 30, category: 'Facial' },
  { id: 'body', name: 'Body Contouring', price: 1200, duration: 90, category: 'Body' },
]

interface ProviderDef {
  name: string
  role: 'MD' | 'PA' | 'NP' | 'Aesthetician'
  locationId: string
}

const PROVIDERS: ProviderDef[] = [
  { name: 'Dr. Elena Vasquez', role: 'MD', locationId: 'soho' },
  { name: 'Sarah Kim', role: 'PA', locationId: 'soho' },
  { name: 'Olivia Chen', role: 'Aesthetician', locationId: 'soho' },
  { name: 'Dr. Marcus Rolle', role: 'MD', locationId: 'williamsburg' },
  { name: 'Jessica Taylor', role: 'NP', locationId: 'williamsburg' },
  { name: 'Dr. Amir Patel', role: 'MD', locationId: 'hoboken' },
  { name: 'Megan Russo', role: 'PA', locationId: 'hoboken' },
  { name: 'Daniela Moreno', role: 'Aesthetician', locationId: 'hoboken' },
  { name: 'Dr. Christine Lee', role: 'MD', locationId: 'white-plains' },
  { name: 'Rachel Nguyen', role: 'NP', locationId: 'white-plains' },
  { name: 'Dr. James Whitfield', role: 'MD', locationId: 'stamford' },
  { name: 'Amy Berkowitz', role: 'PA', locationId: 'stamford' },
]

interface PackageDef {
  id: string
  serviceId: string
  sessions: number
  totalPrice: number
  perSession: number
}

const PACKAGES: PackageDef[] = [
  { id: 'pkg-botox-3', serviceId: 'botox', sessions: 3, totalPrice: 1200, perSession: 400 },
  { id: 'pkg-laser-6', serviceId: 'laser', sessions: 6, totalPrice: 1800, perSession: 300 },
  { id: 'pkg-hydra-4', serviceId: 'hydrafacial', sessions: 4, totalPrice: 880, perSession: 220 },
  { id: 'pkg-body-3', serviceId: 'body', sessions: 3, totalPrice: 3000, perSession: 1000 },
  { id: 'pkg-peel-6', serviceId: 'peel', sessions: 6, totalPrice: 1020, perSession: 170 },
]

// Service return intervals in days
const RETURN_INTERVALS: Record<string, [number, number]> = {
  botox: [90, 120],
  filler: [120, 180],
  hydrafacial: [28, 42],
  laser: [28, 42],
  peel: [28, 42],
  body: [28, 42],
}

// Weekly seasonality multiplier (Sun=0 through Sat=6)
const DAY_WEIGHT = [0, 0.7, 0.7, 0.85, 1.1, 1.1, 1.05]

// ---------------------------------------------------------------------------
// Name pools
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  'Sophia', 'Emma', 'Olivia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia',
  'Harper', 'Evelyn', 'Abigail', 'Emily', 'Ella', 'Elizabeth', 'Camila',
  'Luna', 'Sofia', 'Avery', 'Mila', 'Aria', 'Scarlett', 'Penelope',
  'Layla', 'Chloe', 'Victoria', 'Madison', 'Eleanor', 'Grace', 'Nora',
  'Riley', 'Zoey', 'Hannah', 'Hazel', 'Lily', 'Ellie', 'Violet',
  'Lillian', 'Zoe', 'Stella', 'Aurora', 'Natalie', 'Emilia', 'Everly',
  'Leah', 'Aubrey', 'Willow', 'Addison', 'Lucy', 'Audrey', 'Bella',
  'Nova', 'Brooklyn', 'Paisley', 'Savannah', 'Claire', 'Skylar', 'Isla',
  'Genesis', 'Naomi', 'Elena', 'Caroline', 'Eliana', 'Anna', 'Maya',
  'Valentina', 'Ruby', 'Kennedy', 'Ivy', 'Ariana', 'Aaliyah', 'Cora',
  'Madelyn', 'Alice', 'Kinsley', 'Hailey', 'Gabriella', 'Allison',
  'Gianna', 'Serenity', 'Samantha', 'Sarah', 'Autumn', 'Quinn', 'Eva',
  'Piper', 'Sophie', 'Sadie', 'Delilah', 'Josephine', 'Nevaeh', 'Adeline',
  'Arya', 'Emery', 'Lydia', 'Clara', 'Vivian', 'Madeline', 'Peyton',
  'Julia', 'Rylee', 'Brielle',
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
  'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Kim', 'Chen', 'Patel',
  'Singh', 'Morales', 'Cohen', 'Shah', 'Park', 'Reyes', 'Cruz',
]

// ---------------------------------------------------------------------------
// No-show rate by provider role
// ---------------------------------------------------------------------------
function baseNoShowRate(role: ProviderDef['role']): [number, number] {
  switch (role) {
    case 'MD':
      return [0.08, 0.12]
    case 'PA':
    case 'NP':
      return [0.12, 0.16]
    case 'Aesthetician':
      return [0.15, 0.22]
  }
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------
export function generateSeedData(): {
  clients: Client[]
  appointments: Appointment[]
  dailyMetrics: DailyMetrics[]
} {
  const rand = createRNG(42)

  // Helpers using our PRNG
  function randInt(min: number, max: number): number {
    return Math.floor(rand() * (max - min + 1)) + min
  }
  function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(rand() * arr.length)]
  }
  function randFloat(min: number, max: number): number {
    return min + rand() * (max - min)
  }
  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  // -------------------------------------------------------------------
  // 1. Generate ~150 clients
  // -------------------------------------------------------------------
  const locationDistribution: Record<string, number> = {
    soho: 40,
    williamsburg: 30,
    hoboken: 30,
    'white-plains': 25,
    stamford: 25,
  }

  const usedNames = new Set<string>()
  const shuffledFirstNames = shuffle([...FIRST_NAMES])
  const shuffledLastNames = shuffle([...LAST_NAMES])
  let nameIdx = 0

  function generateUniqueName(): string {
    for (let attempts = 0; attempts < 200; attempts++) {
      const first = shuffledFirstNames[nameIdx % shuffledFirstNames.length]
      const last = shuffledLastNames[Math.floor(nameIdx / shuffledFirstNames.length) % shuffledLastNames.length]
      nameIdx++
      const full = `${first} ${last}`
      if (!usedNames.has(full)) {
        usedNames.add(full)
        return full
      }
    }
    // Fallback — very unlikely
    const fallback = `Client ${nameIdx}`
    nameIdx++
    return fallback
  }

  const ninetyDaysAgo = addDays(TODAY, -90)

  const clients: Client[] = []
  let clientIdCounter = 1

  for (const [locId, count] of Object.entries(locationDistribution)) {
    for (let i = 0; i < count; i++) {
      const name = generateUniqueName()
      const email =
        name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '') +
        `${clientIdCounter}@example.com`
      const phone = `(${randInt(200, 999)}) ${randInt(200, 999)}-${String(randInt(1000, 9999))}`
      // joinDate: spread over 18 months, some more recent
      const joinOffset = Math.floor(rand() * 540) // 0..540 days ago
      const joinDate = addDays(TODAY, -joinOffset)

      // Favorite services: 1-2
      const favServices = shuffle([...SERVICES])
      const numFavs = rand() < 0.6 ? 1 : 2
      const favorites = favServices.slice(0, numFavs)

      clients.push({
        id: `client-${String(clientIdCounter).padStart(3, '0')}`,
        name,
        email,
        phone,
        preferredLocation: locId,
        totalVisits: 0, // computed later
        clv: 0, // computed later
        lastVisit: formatDate(joinDate), // updated later
        joinDate: formatDate(joinDate),
        favoriteService: favorites[0].name,
        noShowCount: 0, // computed later
      })
      clientIdCounter++
    }
  }

  // Mark ~10-15% as cross-location clients (they'll visit other locations too)
  const crossLocationClientIds = new Set<string>()
  for (const c of clients) {
    if (rand() < 0.12) {
      crossLocationClientIds.add(c.id)
    }
  }

  // -------------------------------------------------------------------
  // 2. Generate appointments
  // -------------------------------------------------------------------
  const appointments: Appointment[] = []
  let apptIdCounter = 1

  // Track package enrollments per client
  interface PackageEnrollment {
    packageDef: PackageDef
    sessionsUsed: number
    enrollmentId: string
  }
  const clientPackages = new Map<string, PackageEnrollment[]>()

  // Decide which clients get packages (~20% of clients)
  const packageClients = new Set<string>()
  for (const c of clients) {
    if (rand() < 0.2) {
      packageClients.add(c.id)
    }
  }

  // Service lookup
  const serviceById = new Map<string, Service>()
  for (const s of SERVICES) {
    serviceById.set(s.id, s)
  }
  const serviceByName = new Map<string, Service>()
  for (const s of SERVICES) {
    serviceByName.set(s.name, s)
  }

  // Providers by location
  const providersByLocation = new Map<string, ProviderDef[]>()
  for (const p of PROVIDERS) {
    const arr = providersByLocation.get(p.locationId) ?? []
    arr.push(p)
    providersByLocation.set(p.locationId, arr)
  }

  // Location lookup
  const locationById = new Map<string, Location>()
  for (const l of LOCATIONS) {
    locationById.set(l.id, l)
  }

  // The 90-day window for appointments
  const windowStart = ninetyDaysAgo
  const windowEnd = TODAY

  // Helper: is date a Sunday?
  function isSunday(d: Date): boolean {
    return d.getDay() === 0
  }

  // Helper: should appointment no-show?
  function shouldNoShow(
    provider: ProviderDef,
    startHour: number,
    apptDate: Date,
    locationId: string,
  ): boolean {
    const [lo, hi] = baseNoShowRate(provider.role)
    let rate = randFloat(lo, hi)

    // Time-of-day adjustment: 9-10am and 4-5pm higher risk
    if (startHour === 9 || startHour === 16) {
      rate *= 1.4
    }

    // ANOMALY 1: Stamford no-show spike in last 7 days
    const daysFromToday = daysBetween(apptDate, TODAY)
    if (locationId === 'stamford' && daysFromToday >= 0 && daysFromToday <= 7) {
      rate = Math.min(rate * 3, 0.7)
    }

    // ANOMALY 3: Williamsburg bad weather day (3 days ago)
    const threeDaysAgo = formatDate(addDays(TODAY, -3))
    if (locationId === 'williamsburg' && formatDate(apptDate) === threeDaysAgo) {
      rate = 0.8 // 80% no-show rate
    }

    return rand() < rate
  }

  // Helper: compute no-show risk label
  function noShowRiskLabel(provider: ProviderDef, startHour: number): 'low' | 'medium' | 'high' {
    const [lo] = baseNoShowRate(provider.role)
    let risk = lo
    if (startHour === 9 || startHour === 16) risk *= 1.4
    if (risk < 0.1) return 'low'
    if (risk < 0.16) return 'medium'
    return 'high'
  }

  // Generate visit chain for each client
  for (const client of clients) {
    const joinDate = parseDate(client.joinDate)
    const service = serviceByName.get(client.favoriteService)
    if (!service) continue

    const serviceId = SERVICES.find((s) => s.name === client.favoriteService)?.id ?? 'botox'
    const [intervalMin, intervalMax] = RETURN_INTERVALS[serviceId] ?? [60, 90]

    // Determine if this client has a package for their favorite service
    let enrollment: PackageEnrollment | undefined
    if (packageClients.has(client.id)) {
      const matchingPkg = PACKAGES.find((p) => p.serviceId === serviceId)
      if (matchingPkg) {
        enrollment = {
          packageDef: matchingPkg,
          sessionsUsed: 0,
          enrollmentId: `enroll-${client.id}-${matchingPkg.id}`,
        }
        const arr = clientPackages.get(client.id) ?? []
        arr.push(enrollment)
        clientPackages.set(client.id, arr)
      }
    }

    // Walk forward from joinDate or windowStart
    let cursor = new Date(Math.max(joinDate.getTime(), windowStart.getTime()))

    // If client joined before window, fast-forward by random offset into interval
    if (joinDate < windowStart) {
      const elapsed = daysBetween(joinDate, windowStart)
      const intervalAvg = (intervalMin + intervalMax) / 2
      const cyclesElapsed = Math.floor(elapsed / intervalAvg)
      const remainder = elapsed - cyclesElapsed * intervalAvg
      cursor = addDays(windowStart, Math.max(0, Math.floor(intervalAvg - remainder)))
      // For package clients, simulate some sessions already used
      if (enrollment) {
        const preUsed = Math.min(cyclesElapsed, enrollment.packageDef.sessions - 1)
        enrollment.sessionsUsed = Math.max(0, preUsed)
      }
    }

    // How many visits to generate (based on tenure and interval)
    const maxVisits = rand() < 0.15 ? randInt(1, 2) : randInt(2, 8) // some lapsed clients get few

    let visitCount = 0
    while (cursor <= windowEnd && visitCount < maxVisits) {
      // Skip Sundays
      if (isSunday(cursor)) {
        cursor = addDays(cursor, 1)
        continue
      }

      // Skip if day weight is 0
      const dow = dayOfWeek(cursor)
      const weight = DAY_WEIGHT[dow]
      if (weight === 0) {
        cursor = addDays(cursor, 1)
        continue
      }

      // Seasonality: probabilistically skip based on day weight
      if (rand() > weight / 1.1) {
        cursor = addDays(cursor, 1)
        continue
      }

      // Pick location
      let locationId = client.preferredLocation
      if (crossLocationClientIds.has(client.id) && rand() < 0.25) {
        const otherLocs = LOCATIONS.filter((l) => l.id !== client.preferredLocation)
        locationId = pick(otherLocs).id
      }

      const loc = locationById.get(locationId)!
      const providers = providersByLocation.get(locationId) ?? []
      if (providers.length === 0) {
        cursor = addDays(cursor, Math.floor(randFloat(intervalMin, intervalMax) * randFloat(0.8, 1.2)))
        continue
      }
      const provider = pick(providers)

      // ANOMALY 2: Dr. Amir Patel part-time last 2 weeks — skip ~60% of his appointments
      const twoWeeksAgo = addDays(TODAY, -14)
      if (provider.name === 'Dr. Amir Patel' && cursor >= twoWeeksAgo && rand() < 0.6) {
        cursor = addDays(cursor, Math.floor(randFloat(intervalMin, intervalMax) * randFloat(0.8, 1.2)))
        visitCount++ // still counts as a "slot" that got skipped
        continue
      }

      // Time slot
      const startHour = randInt(9, 16) // 9am to 4pm start (last slot ends by 5pm for 60min)
      const startMinute = pick([0, 15, 30, 45])
      const startTime = `${pad2(startHour)}:${pad2(startMinute)}`
      const endMinutes = startHour * 60 + startMinute + service.duration
      const endHour = Math.min(Math.floor(endMinutes / 60), 17)
      const endMin = endMinutes % 60
      const endTime = `${pad2(endHour)}:${pad2(endMin)}`

      // Determine status
      const isInFuture = cursor > TODAY
      let status: Appointment['status']
      if (isInFuture) {
        status = 'confirmed'
      } else if (shouldNoShow(provider, startHour, cursor, locationId)) {
        status = 'no_show'
      } else if (rand() < 0.05) {
        status = 'cancelled'
      } else {
        status = 'completed'
      }

      // Revenue
      const isFirstVisit =
        formatDate(parseDate(client.joinDate)) === formatDate(cursor)
      const firstTimeDiscount = isFirstVisit ? 0.9 : 1.0
      const variation = randFloat(0.85, 1.15)

      let saleType: SaleType = 'service'
      let revenue = Math.round(service.price * variation * firstTimeDiscount)
      let normalizedRevenue = revenue
      let packageId: string | undefined
      let packageSession: string | undefined

      // Package handling
      if (enrollment && enrollment.sessionsUsed < enrollment.packageDef.sessions) {
        saleType = 'package'
        packageId = enrollment.packageDef.id
        enrollment.sessionsUsed++
        packageSession = `${enrollment.sessionsUsed} of ${enrollment.packageDef.sessions}`
        normalizedRevenue = Math.round(enrollment.packageDef.perSession * variation * firstTimeDiscount)
        // First session gets full package revenue; subsequent get $0
        if (enrollment.sessionsUsed === 1) {
          revenue = Math.round(enrollment.packageDef.totalPrice * firstTimeDiscount)
        } else {
          revenue = 0
        }
      }

      // Booked by
      const bookedByRoll = rand()
      const bookedBy: Appointment['bookedBy'] =
        bookedByRoll < 0.4 ? 'ai' : bookedByRoll < 0.75 ? 'online' : 'staff'

      const room = randInt(1, loc.rooms)
      const riskLabel = noShowRiskLabel(provider, startHour)

      appointments.push({
        id: `appt-${String(apptIdCounter).padStart(4, '0')}`,
        clientName: client.name,
        clientId: client.id,
        service: service.name,
        provider: provider.name,
        locationId,
        date: formatDate(cursor),
        startTime,
        endTime,
        status,
        bookedBy,
        noShowRisk: riskLabel,
        room,
        revenue: status === 'no_show' || status === 'cancelled' ? 0 : revenue,
        normalizedRevenue: status === 'no_show' || status === 'cancelled' ? 0 : normalizedRevenue,
        saleType,
        packageId,
        packageSession,
      })
      apptIdCounter++
      visitCount++

      // Next visit: interval ±20%
      const interval = Math.floor(randFloat(intervalMin, intervalMax) * randFloat(0.8, 1.2))
      cursor = addDays(cursor, Math.max(1, interval))
    }
  }

  // -------------------------------------------------------------------
  // 3. Compute client stats FROM appointments
  // -------------------------------------------------------------------
  const clientMap = new Map<string, Client>()
  for (const c of clients) {
    clientMap.set(c.id, c)
  }

  for (const appt of appointments) {
    const c = clientMap.get(appt.clientId)
    if (!c) continue

    if (appt.status === 'completed' || appt.status === 'confirmed') {
      c.totalVisits++
    }
    if (appt.status === 'completed') {
      c.clv += appt.normalizedRevenue
    }
    if (appt.status === 'no_show') {
      c.noShowCount++
    }
    // Track last visit date
    if (appt.date > c.lastVisit && appt.status !== 'cancelled') {
      c.lastVisit = appt.date
    }
  }

  // -------------------------------------------------------------------
  // 4. Derive DailyMetrics from appointments
  // -------------------------------------------------------------------
  // Build lookup: service name -> duration
  const serviceDuration = new Map<string, number>()
  for (const s of SERVICES) {
    serviceDuration.set(s.name, s.duration)
  }

  // Group appointments by (date, locationId)
  const apptGroups = new Map<string, Appointment[]>()
  for (const appt of appointments) {
    const key = `${appt.date}|${appt.locationId}`
    const arr = apptGroups.get(key) ?? []
    arr.push(appt)
    apptGroups.set(key, arr)
  }

  // For rebooking rate: build a set of (clientId, locationId) who had appointments in each 90-day lookback
  // We precompute: for each (clientId, locationId, date), did the client have a prior appt at that location in previous 90 days?
  const clientLocationDates = new Map<string, Set<string>>()
  for (const appt of appointments) {
    if (appt.status === 'cancelled') continue
    const key = `${appt.clientId}|${appt.locationId}`
    const dates = clientLocationDates.get(key) ?? new Set<string>()
    dates.add(appt.date)
    clientLocationDates.set(key, dates)
  }

  function hasReturnVisit(clientId: string, locationId: string, dateStr: string): boolean {
    const key = `${clientId}|${locationId}`
    const dates = clientLocationDates.get(key)
    if (!dates) return false
    const d = parseDate(dateStr)
    const lookback90 = addDays(d, -90)
    for (const ds of dates) {
      if (ds === dateStr) continue
      const dd = parseDate(ds)
      if (dd >= lookback90 && dd < d) return true
    }
    return false
  }

  const dailyMetrics: DailyMetrics[] = []

  // Iterate over all 90 days for each location
  for (const loc of LOCATIONS) {
    for (let dayOffset = -90; dayOffset <= 0; dayOffset++) {
      const d = addDays(TODAY, dayOffset)
      if (isSunday(d)) continue
      const dateStr = formatDate(d)
      const key = `${dateStr}|${loc.id}`
      const dayAppts = apptGroups.get(key) ?? []

      const nonCancelled = dayAppts.filter((a) => a.status !== 'cancelled')
      const completed = dayAppts.filter((a) => a.status === 'completed')
      const noShows = dayAppts.filter((a) => a.status === 'no_show')

      const revenue = completed.reduce((s, a) => s + a.revenue, 0)
      const normRevenue = completed.reduce((s, a) => s + a.normalizedRevenue, 0)

      const revenueByType: RevenueBreakdown = {
        service: 0,
        package: 0,
        product: 0,
        membership: 0,
        giftcard: 0,
      }
      for (const a of completed) {
        revenueByType[a.saleType] += a.normalizedRevenue
      }

      const bookings = nonCancelled.length
      const noShowCount = noShows.length
      const noShowRate = bookings > 0 ? (noShowCount / bookings) * 100 : 0

      // Utilization: sum of durations / (rooms * 600 minutes = 10hr day, but biz is 8hr, use 600 as spec)
      const totalMinutes = nonCancelled.reduce(
        (s, a) => s + (serviceDuration.get(a.service) ?? 30),
        0,
      )
      const utilizationRate = Math.min((totalMinutes / (loc.rooms * 600)) * 100, 100)

      // New clients
      const newClients = dayAppts.filter(
        (a) => {
          const c = clientMap.get(a.clientId)
          return c && c.joinDate === dateStr
        },
      ).length

      const packageBookings = nonCancelled.filter((a) => a.saleType === 'package').length

      // Rebooking rate
      const uniqueClients = new Set(nonCancelled.map((a) => a.clientId))
      let returnCount = 0
      for (const cid of uniqueClients) {
        if (hasReturnVisit(cid, loc.id, dateStr)) {
          returnCount++
        }
      }
      const rebookingRate = uniqueClients.size > 0
        ? (returnCount / uniqueClients.size) * 100
        : 0

      dailyMetrics.push({
        date: dateStr,
        locationId: loc.id,
        revenue,
        normalizedRevenue: normRevenue,
        revenueByType,
        bookings,
        packageBookings,
        noShows: noShowCount,
        noShowRate: Math.round(noShowRate * 100) / 100,
        responseTimeAvg: 0,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        newClients,
        rebookingRate: Math.round(rebookingRate * 100) / 100,
        callsAnswered: 0,
        callsMissed: 0,
        aiResolved: 0,
        escalated: 0,
        revenueRecovered: 0,
      })
    }
  }

  return { clients, appointments, dailyMetrics }
}
