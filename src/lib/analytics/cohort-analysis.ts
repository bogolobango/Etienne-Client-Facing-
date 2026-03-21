// ---------------------------------------------------------------------------
// Cohort analysis — retention, at-risk clients, cross-location behavior
// ---------------------------------------------------------------------------

import type { Appointment, Client, Location } from '@/types'
import type { CohortAnalysis, AtRiskClient, ServiceRetention } from './types'

const MS_PER_DAY = 86_400_000

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / MS_PER_DAY
}

export function analyzeCohorts(
  clients: Client[],
  appointments: Appointment[],
  locations: Location[],
): CohortAnalysis {
  if (clients.length === 0 || appointments.length === 0) {
    return {
      retentionRate: 0,
      serviceRetention: [],
      atRiskClients: [],
      crossLocationClients: 0,
      crossLocationPct: 0,
    }
  }

  const now = new Date()
  const nowStr = now.toISOString().slice(0, 10)

  // Build visit history per client (completed appointments only)
  const completed = appointments.filter((a) => a.status === 'completed')
  const visitsByClient = new Map<string, Appointment[]>()
  for (const appt of completed) {
    const list = visitsByClient.get(appt.clientId) ?? []
    list.push(appt)
    visitsByClient.set(appt.clientId, list)
  }
  // Sort each client's visits by date
  for (const list of visitsByClient.values()) {
    list.sort((a, b) => a.date.localeCompare(b.date))
  }

  // --- Retention rate ---
  // Of clients who visited in days 31-60 ago, what % also visited in days 0-30?
  const day30Ago = new Date(now.getTime() - 30 * MS_PER_DAY).toISOString().slice(0, 10)
  const day60Ago = new Date(now.getTime() - 60 * MS_PER_DAY).toISOString().slice(0, 10)

  const visitedIn31to60 = new Set<string>()
  const visitedIn0to30 = new Set<string>()

  for (const [clientId, visits] of visitsByClient) {
    for (const v of visits) {
      if (v.date >= day60Ago && v.date < day30Ago) visitedIn31to60.add(clientId)
      if (v.date >= day30Ago && v.date <= nowStr) visitedIn0to30.add(clientId)
    }
  }

  let retainedCount = 0
  for (const cid of visitedIn31to60) {
    if (visitedIn0to30.has(cid)) retainedCount++
  }
  const retentionRate = visitedIn31to60.size > 0
    ? Math.round((retainedCount / visitedIn31to60.size) * 1000) / 10
    : 0

  // --- Service-level retention ---
  // Group clients by their most frequent service, compute retention per group
  const clientMostFreqService = new Map<string, string>()
  for (const [clientId, visits] of visitsByClient) {
    const freq = new Map<string, number>()
    for (const v of visits) {
      freq.set(v.service, (freq.get(v.service) ?? 0) + 1)
    }
    let best = ''
    let bestCount = 0
    for (const [svc, count] of freq) {
      if (count > bestCount) { best = svc; bestCount = count }
    }
    clientMostFreqService.set(clientId, best)
  }

  const serviceGroups = new Map<string, Set<string>>()
  for (const [clientId, svc] of clientMostFreqService) {
    const group = serviceGroups.get(svc) ?? new Set()
    group.add(clientId)
    serviceGroups.set(svc, group)
  }

  const serviceRetention: ServiceRetention[] = []
  for (const [svc, clientIds] of serviceGroups) {
    const inCohort = [...clientIds].filter((c) => visitedIn31to60.has(c))
    const retained = inCohort.filter((c) => visitedIn0to30.has(c))
    const rate = inCohort.length > 0
      ? Math.round((retained.length / inCohort.length) * 1000) / 10
      : 0
    serviceRetention.push({ service: svc, rate, count: clientIds.size })
  }
  serviceRetention.sort((a, b) => b.count - a.count)

  // --- At-risk clients ---
  const locationMap = new Map(locations.map((l) => [l.id, l.name]))
  const atRisk: AtRiskClient[] = []

  for (const client of clients) {
    const visits = visitsByClient.get(client.id)
    if (!visits || visits.length < 2) continue

    // Compute average interval between visits
    const intervals: number[] = []
    for (let i = 1; i < visits.length; i++) {
      intervals.push(daysBetween(visits[i].date, visits[i - 1].date))
    }
    const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length
    const lastVisitDate = visits[visits.length - 1].date
    const daysSince = daysBetween(nowStr, lastVisitDate)

    if (daysSince > avgInterval * 1.5) {
      atRisk.push({
        clientId: client.id,
        name: client.name,
        clv: client.clv,
        lastVisit: lastVisitDate,
        avgInterval: Math.round(avgInterval),
        daysSinceLastVisit: Math.round(daysSince),
        preferredLocation: locationMap.get(client.preferredLocation) ?? client.preferredLocation,
      })
    }
  }

  // Sort by CLV descending, cap at 20
  atRisk.sort((a, b) => b.clv - a.clv)
  const cappedAtRisk = atRisk.slice(0, 20)

  // --- Cross-location clients ---
  const clientLocations = new Map<string, Set<string>>()
  for (const appt of completed) {
    const locs = clientLocations.get(appt.clientId) ?? new Set()
    locs.add(appt.locationId)
    clientLocations.set(appt.clientId, locs)
  }

  let crossLocationClients = 0
  for (const locs of clientLocations.values()) {
    if (locs.size >= 2) crossLocationClients++
  }
  const uniqueClients = clientLocations.size
  const crossLocationPct = uniqueClients > 0
    ? Math.round((crossLocationClients / uniqueClients) * 1000) / 10
    : 0

  return {
    retentionRate,
    serviceRetention,
    atRiskClients: cappedAtRisk,
    crossLocationClients,
    crossLocationPct,
  }
}
