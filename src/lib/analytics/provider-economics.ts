// ---------------------------------------------------------------------------
// Provider economics — revenue, cost, margin, efficiency metrics
// ---------------------------------------------------------------------------

import type { Appointment, Location } from '@/types'
import type { Provider } from '@/data/providers'
import type { ProviderEconomicsResult, ProviderEconomicsRow } from './types'

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function computeProviderEconomics(
  appointments: Appointment[],
  providers: Provider[],
  _locations: Location[],
  locationFilter: string,
): ProviderEconomicsResult {
  // Filter by location
  const filteredProviders = locationFilter === 'all'
    ? providers
    : providers.filter((p) => p.locationId === locationFilter)

  const filteredAppts = locationFilter === 'all'
    ? appointments
    : appointments.filter((a) => a.locationId === locationFilter)

  const completed = filteredAppts.filter((a) => a.status === 'completed')

  if (filteredProviders.length === 0) {
    return { providers: [], networkAvgMarginPct: 0, networkAvgRevPerHour: 0 }
  }

  // Group completed appointments by provider name
  const apptsByProvider = new Map<string, Appointment[]>()
  for (const a of completed) {
    const list = apptsByProvider.get(a.provider) ?? []
    list.push(a)
    apptsByProvider.set(a.provider, list)
  }

  const rows: ProviderEconomicsRow[] = []

  for (const provider of filteredProviders) {
    const provAppts = apptsByProvider.get(provider.name) ?? []
    const revenue = provAppts.reduce((s, a) => s + a.normalizedRevenue, 0)
    const appointmentCount = provAppts.length

    // Compute hours worked from appointment durations
    let totalMinutes = 0
    for (const a of provAppts) {
      const duration = parseTime(a.endTime) - parseTime(a.startTime)
      totalMinutes += Math.max(0, duration)
    }
    const hoursWorked = Math.round((totalMinutes / 60) * 10) / 10

    const cost = Math.round(provider.hourlyRate * hoursWorked)
    const margin = Math.round(revenue - cost)
    const marginPct = revenue > 0 ? Math.round((margin / revenue) * 1000) / 10 : 0
    const revenuePerHour = hoursWorked > 0 ? Math.round(revenue / hoursWorked) : 0
    const avgTicket = appointmentCount > 0 ? Math.round(revenue / appointmentCount) : 0

    rows.push({
      providerId: provider.id,
      providerName: provider.name,
      title: provider.title,
      locationId: provider.locationId,
      revenue: Math.round(revenue),
      cost,
      margin,
      marginPct,
      revenuePerHour,
      avgTicket,
      appointments: appointmentCount,
      hoursWorked,
    })
  }

  // Sort by margin descending
  rows.sort((a, b) => b.margin - a.margin)

  // Network averages
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const totalCost = rows.reduce((s, r) => s + r.cost, 0)
  const totalHours = rows.reduce((s, r) => s + r.hoursWorked, 0)

  const networkAvgMarginPct = totalRevenue > 0
    ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 1000) / 10
    : 0
  const networkAvgRevPerHour = totalHours > 0
    ? Math.round(totalRevenue / totalHours)
    : 0

  return {
    providers: rows,
    networkAvgMarginPct,
    networkAvgRevPerHour,
  }
}
