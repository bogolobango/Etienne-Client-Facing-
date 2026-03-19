// ---------------------------------------------------------------------------
// Provider seed data — 12 providers across 5 locations
// ---------------------------------------------------------------------------

export interface Provider {
  id: string
  name: string
  title: string // 'MD' | 'PA' | 'NP' | 'Aesthetician'
  locationId: string
  hourlyRate: number // cost to the business
  specialties: string[]
}

export interface ProviderMetrics {
  providerId: string
  locationId: string
  period: string // date string
  revenue: number
  appointments: number
  completedAppointments: number
  noShows: number
  avgTicket: number
  rebookingRate: number
  utilizationRate: number
  hoursWorked: number
  newClients: number
  revenuePerHour: number
}

import { daysAgo } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
export const providers: Provider[] = [
  // SoHo Flagship — 3 providers
  { id: 'prov-1', name: 'Dr. Elena Vasquez', title: 'MD', locationId: 'soho', hourlyRate: 185, specialties: ['Botox', 'Dermal Filler', 'Body Contouring'] },
  { id: 'prov-2', name: 'Sarah Kim', title: 'PA', locationId: 'soho', hourlyRate: 110, specialties: ['Botox', 'Chemical Peel', 'Laser Hair Removal'] },
  { id: 'prov-3', name: 'Olivia Chen', title: 'Aesthetician', locationId: 'soho', hourlyRate: 65, specialties: ['Hydrafacial', 'Chemical Peel'] },

  // Williamsburg — 2 providers
  { id: 'prov-4', name: 'Dr. Marcus Rolle', title: 'MD', locationId: 'williamsburg', hourlyRate: 175, specialties: ['Botox', 'Dermal Filler'] },
  { id: 'prov-5', name: 'Jessica Taylor', title: 'NP', locationId: 'williamsburg', hourlyRate: 100, specialties: ['Botox', 'Laser Hair Removal', 'Chemical Peel'] },

  // Hoboken — 3 providers
  { id: 'prov-6', name: 'Dr. Amir Patel', title: 'MD', locationId: 'hoboken', hourlyRate: 170, specialties: ['Dermal Filler', 'Body Contouring'] },
  { id: 'prov-7', name: 'Megan Russo', title: 'PA', locationId: 'hoboken', hourlyRate: 105, specialties: ['Botox', 'Chemical Peel'] },
  { id: 'prov-8', name: 'Daniela Moreno', title: 'Aesthetician', locationId: 'hoboken', hourlyRate: 60, specialties: ['Hydrafacial', 'Chemical Peel', 'Laser Hair Removal'] },

  // White Plains — 2 providers
  { id: 'prov-9', name: 'Dr. Christine Lee', title: 'MD', locationId: 'white-plains', hourlyRate: 165, specialties: ['Botox', 'Dermal Filler', 'Body Contouring'] },
  { id: 'prov-10', name: 'Rachel Nguyen', title: 'NP', locationId: 'white-plains', hourlyRate: 95, specialties: ['Botox', 'Laser Hair Removal'] },

  // Stamford — 2 providers
  { id: 'prov-11', name: 'Dr. James Whitfield', title: 'MD', locationId: 'stamford', hourlyRate: 160, specialties: ['Botox', 'Dermal Filler'] },
  { id: 'prov-12', name: 'Amy Berkowitz', title: 'PA', locationId: 'stamford', hourlyRate: 100, specialties: ['Hydrafacial', 'Chemical Peel', 'Laser Hair Removal'] },
]

// ---------------------------------------------------------------------------
// Seeded random — deterministic pseudo-random for consistent data
// ---------------------------------------------------------------------------
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ---------------------------------------------------------------------------
// Generate 30 days of ProviderMetrics per provider
// ---------------------------------------------------------------------------
function generateProviderMetrics(): ProviderMetrics[] {
  const metrics: ProviderMetrics[] = []
  const rand = seededRandom(42)

  // Base profiles per provider — controls realistic variance
  const profiles: Record<string, { baseRevenue: number; baseAppts: number; baseUtil: number; baseRebook: number; baseNoShowPct: number; baseHours: number }> = {
    'prov-1':  { baseRevenue: 4800, baseAppts: 10, baseUtil: 88, baseRebook: 72, baseNoShowPct: 6,  baseHours: 8 },
    'prov-2':  { baseRevenue: 3200, baseAppts: 9,  baseUtil: 82, baseRebook: 68, baseNoShowPct: 8,  baseHours: 8 },
    'prov-3':  { baseRevenue: 1800, baseAppts: 8,  baseUtil: 78, baseRebook: 75, baseNoShowPct: 5,  baseHours: 7 },
    'prov-4':  { baseRevenue: 4200, baseAppts: 9,  baseUtil: 85, baseRebook: 70, baseNoShowPct: 7,  baseHours: 8 },
    'prov-5':  { baseRevenue: 2600, baseAppts: 8,  baseUtil: 76, baseRebook: 64, baseNoShowPct: 10, baseHours: 7.5 },
    'prov-6':  { baseRevenue: 4500, baseAppts: 8,  baseUtil: 90, baseRebook: 74, baseNoShowPct: 5,  baseHours: 7.5 },
    'prov-7':  { baseRevenue: 2900, baseAppts: 9,  baseUtil: 80, baseRebook: 66, baseNoShowPct: 9,  baseHours: 8 },
    'prov-8':  { baseRevenue: 1600, baseAppts: 7,  baseUtil: 72, baseRebook: 78, baseNoShowPct: 4,  baseHours: 7 },
    'prov-9':  { baseRevenue: 4000, baseAppts: 8,  baseUtil: 84, baseRebook: 71, baseNoShowPct: 7,  baseHours: 7.5 },
    'prov-10': { baseRevenue: 2400, baseAppts: 7,  baseUtil: 70, baseRebook: 62, baseNoShowPct: 12, baseHours: 7 },
    'prov-11': { baseRevenue: 3800, baseAppts: 8,  baseUtil: 82, baseRebook: 69, baseNoShowPct: 8,  baseHours: 7.5 },
    'prov-12': { baseRevenue: 2200, baseAppts: 7,  baseUtil: 74, baseRebook: 80, baseNoShowPct: 5,  baseHours: 7 },
  }

  for (const provider of providers) {
    const p = profiles[provider.id]
    for (let day = 0; day < 30; day++) {
      const r = rand
      const dayVariance = 0.8 + r() * 0.4 // 0.8-1.2x
      const revenue = Math.round(p.baseRevenue * dayVariance)
      const appointments = Math.max(3, Math.round(p.baseAppts * (0.85 + r() * 0.3)))
      const noShowPct = Math.max(0, p.baseNoShowPct + (r() * 8 - 4))
      const noShows = Math.max(0, Math.round(appointments * noShowPct / 100))
      const completed = appointments - noShows
      const hoursWorked = Math.round((p.baseHours + (r() * 1.5 - 0.75)) * 10) / 10
      const utilization = Math.min(100, Math.max(50, p.baseUtil + (r() * 14 - 7)))
      const rebookingRate = Math.min(100, Math.max(40, p.baseRebook + (r() * 12 - 6)))
      const newClients = Math.max(0, Math.round(1 + r() * 3))

      metrics.push({
        providerId: provider.id,
        locationId: provider.locationId,
        period: daysAgo(29 - day),
        revenue,
        appointments,
        completedAppointments: completed,
        noShows,
        avgTicket: completed > 0 ? Math.round(revenue / completed) : 0,
        rebookingRate: Math.round(rebookingRate * 10) / 10,
        utilizationRate: Math.round(utilization * 10) / 10,
        hoursWorked,
        newClients,
        revenuePerHour: hoursWorked > 0 ? Math.round(revenue / hoursWorked) : 0,
      })
    }
  }

  return metrics
}

export const providerMetrics: ProviderMetrics[] = generateProviderMetrics()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function getProviderById(id: string): Provider | undefined {
  return providers.find((p) => p.id === id)
}

export function getProvidersByLocation(locationId: string): Provider[] {
  if (locationId === 'all') return providers
  return providers.filter((p) => p.locationId === locationId)
}

export function getMetricsForProvider(providerId: string): ProviderMetrics[] {
  return providerMetrics.filter((m) => m.providerId === providerId)
}

export function getAggregatedProviderMetrics(providerId: string): {
  totalRevenue: number
  totalAppointments: number
  totalCompleted: number
  totalNoShows: number
  avgTicket: number
  avgRebookingRate: number
  avgUtilization: number
  totalHoursWorked: number
  totalNewClients: number
  avgRevenuePerHour: number
  noShowRate: number
} {
  const metrics = getMetricsForProvider(providerId)
  const totalRevenue = metrics.reduce((s, m) => s + m.revenue, 0)
  const totalAppointments = metrics.reduce((s, m) => s + m.appointments, 0)
  const totalCompleted = metrics.reduce((s, m) => s + m.completedAppointments, 0)
  const totalNoShows = metrics.reduce((s, m) => s + m.noShows, 0)
  const totalHoursWorked = metrics.reduce((s, m) => s + m.hoursWorked, 0)
  const totalNewClients = metrics.reduce((s, m) => s + m.newClients, 0)

  return {
    totalRevenue,
    totalAppointments,
    totalCompleted,
    totalNoShows,
    avgTicket: totalCompleted > 0 ? Math.round(totalRevenue / totalCompleted) : 0,
    avgRebookingRate: metrics.length ? Math.round(metrics.reduce((s, m) => s + m.rebookingRate, 0) / metrics.length * 10) / 10 : 0,
    avgUtilization: metrics.length ? Math.round(metrics.reduce((s, m) => s + m.utilizationRate, 0) / metrics.length * 10) / 10 : 0,
    totalHoursWorked: Math.round(totalHoursWorked * 10) / 10,
    totalNewClients,
    avgRevenuePerHour: totalHoursWorked > 0 ? Math.round(totalRevenue / totalHoursWorked) : 0,
    noShowRate: totalAppointments > 0 ? Math.round((totalNoShows / totalAppointments) * 1000) / 10 : 0,
  }
}
