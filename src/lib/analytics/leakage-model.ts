// ---------------------------------------------------------------------------
// Revenue leakage model — the critical module
// Every category computed from ACTUAL DATA, not multipliers
// ---------------------------------------------------------------------------

import type { Appointment, Client, DailyMetrics, Location, Service } from '@/types'
import type { RevenueLeakage, LeakageCategory } from './types'

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function apptDurationMinutes(a: Appointment): number {
  return Math.max(0, parseTime(a.endTime) - parseTime(a.startTime))
}

export function computeLeakage(
  appointments: Appointment[],
  clients: Client[],
  dailyMetrics: DailyMetrics[],
  locations: Location[],
  services: Service[],
  locationFilter: string,
): RevenueLeakage {
  // Filter by location
  const appts = locationFilter === 'all'
    ? appointments
    : appointments.filter((a) => a.locationId === locationFilter)

  const metrics = locationFilter === 'all'
    ? dailyMetrics
    : dailyMetrics.filter((m) => m.locationId === locationFilter)

  const locs = locationFilter === 'all'
    ? locations
    : locations.filter((l) => l.id === locationFilter)

  if (appts.length === 0) {
    return { totalLeakage: 0, categories: [], theoreticalRevenue: 0, actualRevenue: 0 }
  }

  // Suppress unused lint — services is used for type context but we derive from appointments
  void services

  const completed = appts.filter((a) => a.status === 'completed')
  const actualRevenue = completed.reduce((s, a) => s + a.normalizedRevenue, 0)

  const categories: LeakageCategory[] = []

  // --- 1. No-Show Leakage (confidence: high) ---
  const noShows = appts.filter((a) => a.status === 'no_show')
  const noShowRevenue = noShows.reduce((s, a) => s + a.normalizedRevenue, 0)
  const avgNoShowBookedRev = noShows.length > 0
    ? Math.round(noShowRevenue / noShows.length)
    : 0
  categories.push({
    name: 'No-Show Leakage',
    amount: Math.round(noShowRevenue),
    confidence: 'high',
    computation: `${noShows.length} no-shows \u00d7 $${avgNoShowBookedRev} avg booked revenue = $${Math.round(noShowRevenue).toLocaleString()}`,
    details: `${noShows.length} appointments where clients did not show up, representing lost revenue that was already booked.`,
  })

  // --- 2. Utilization Gap (confidence: medium) ---
  // Per location: actual utilization = total appt minutes / (rooms * 10hrs * 60 * days)
  const uniqueDates = new Set(metrics.map((m) => m.date))
  const totalDays = uniqueDates.size || 1

  let totalApptMinutes = 0
  for (const a of completed) {
    totalApptMinutes += apptDurationMinutes(a)
  }
  const totalApptHours = totalApptMinutes / 60

  const totalRooms = locs.reduce((s, l) => s + l.rooms, 0)
  const totalCapacityHours = totalRooms * 10 * totalDays // 10-hour operating day
  const unusedRoomHours = Math.max(0, totalCapacityHours - totalApptHours)

  const revPerHour = totalApptHours > 0
    ? actualRevenue / totalApptHours
    : 0
  const utilizationGap = Math.round(unusedRoomHours * revPerHour)

  categories.push({
    name: 'Utilization Gap',
    amount: utilizationGap,
    confidence: 'medium',
    computation: `${Math.round(unusedRoomHours)} unused room-hours \u00d7 $${Math.round(revPerHour)} actual rev/hour = $${utilizationGap.toLocaleString()}`,
    details: `Based on ${totalRooms} rooms across ${locs.length} location(s) over ${totalDays} days with a 10-hour operating day. Actual appointment hours: ${Math.round(totalApptHours)}.`,
  })

  // --- 3. Rebooking Gap (confidence: medium) ---
  // Clients who completed an appointment but have no future appointment booked
  const now = new Date().toISOString().slice(0, 10)
  const clientsWithFuture = new Set<string>()
  const clientsCompleted = new Set<string>()

  for (const a of appts) {
    if (a.status === 'completed') clientsCompleted.add(a.clientId)
    if ((a.status === 'confirmed' || a.status === 'waitlist') && a.date >= now) {
      clientsWithFuture.add(a.clientId)
    }
  }

  const clientsWithoutFuture: string[] = []
  for (const cid of clientsCompleted) {
    if (!clientsWithFuture.has(cid)) clientsWithoutFuture.push(cid)
  }

  // Avg ticket per completed appointment
  const avgTicket = completed.length > 0
    ? Math.round(actualRevenue / completed.length)
    : 0
  const rebookingGap = clientsWithoutFuture.length * avgTicket

  categories.push({
    name: 'Rebooking Gap',
    amount: rebookingGap,
    confidence: 'medium',
    computation: `${clientsWithoutFuture.length} clients without future bookings \u00d7 $${avgTicket} avg ticket = $${rebookingGap.toLocaleString()}`,
    details: `Of ${clientsCompleted.size} clients with completed visits, ${clientsWithoutFuture.length} have no upcoming appointment scheduled.`,
  })

  // --- 4. Late Cancellation (confidence: high) ---
  const cancellations = appts.filter((a) => a.status === 'cancelled')
  const cancelledRevenue = cancellations.reduce((s, a) => s + a.normalizedRevenue, 0)
  const avgCancelRev = cancellations.length > 0
    ? Math.round(cancelledRevenue / cancellations.length)
    : 0

  categories.push({
    name: 'Late Cancellation',
    amount: Math.round(cancelledRevenue),
    confidence: 'high',
    computation: `${cancellations.length} cancellations \u00d7 $${avgCancelRev} avg booked revenue = $${Math.round(cancelledRevenue).toLocaleString()}`,
    details: `${cancellations.length} appointments were cancelled, resulting in schedule gaps that could not be filled.`,
  })

  // --- 5. New Client Acquisition Gap (confidence: low) ---
  // Best location's new client rate vs worst
  if (locations.length >= 2 && locationFilter === 'all') {
    const locNewClientRates = new Map<string, { total: number; days: number }>()
    for (const m of metrics) {
      const entry = locNewClientRates.get(m.locationId) ?? { total: 0, days: 0 }
      entry.total += m.newClients
      entry.days += 1
      locNewClientRates.set(m.locationId, entry)
    }

    let bestRate = 0
    let bestLocName = ''
    let worstRate = Infinity
    let worstLocName = ''
    let worstDays = 1

    for (const [locId, data] of locNewClientRates) {
      const rate = data.days > 0 ? data.total / data.days : 0
      const loc = locations.find((l) => l.id === locId)
      const name = loc?.name ?? locId
      if (rate > bestRate) { bestRate = rate; bestLocName = name }
      if (rate < worstRate) {
        worstRate = rate
        worstLocName = name
        worstDays = data.days
      }
    }

    if (bestRate > worstRate && worstDays > 0) {
      // Compute avg first-visit revenue
      const clientMap = new Map(clients.map((c) => [c.id, c]))
      const firstVisitAppts = completed.filter((a) => {
        const c = clientMap.get(a.clientId)
        if (!c) return false
        const joinDate = new Date(c.joinDate).getTime()
        const apptDate = new Date(a.date).getTime()
        return (apptDate - joinDate) < 30 * 86_400_000
      })
      const avgFirstVisitRev = firstVisitAppts.length > 0
        ? Math.round(firstVisitAppts.reduce((s, a) => s + a.normalizedRevenue, 0) / firstVisitAppts.length)
        : avgTicket

      const additionalNewClientsPerMonth = (bestRate - worstRate) * 30
      const gapAmount = Math.round(additionalNewClientsPerMonth * avgFirstVisitRev)

      categories.push({
        name: 'New Client Acquisition Gap',
        amount: gapAmount,
        confidence: 'low',
        computation: `If ${worstLocName} matched ${bestLocName}'s new client rate, +$${gapAmount.toLocaleString()}/month`,
        details: `${bestLocName} averages ${bestRate.toFixed(1)} new clients/day vs ${worstLocName}'s ${worstRate.toFixed(1)}. Gap of ${additionalNewClientsPerMonth.toFixed(0)} clients/month \u00d7 $${avgFirstVisitRev} avg first-visit revenue.`,
      })
    }
  }

  // --- 6. Cross-Location Gap (confidence: medium) ---
  if (locations.length >= 2 && locationFilter === 'all') {
    // Compare utilization across locations — if worst matched best
    const locUtilData = new Map<string, { apptMinutes: number; rooms: number; days: number }>()

    for (const loc of locations) {
      locUtilData.set(loc.id, { apptMinutes: 0, rooms: loc.rooms, days: 0 })
    }

    for (const a of completed) {
      const data = locUtilData.get(a.locationId)
      if (data) {
        data.apptMinutes += apptDurationMinutes(a)
      }
    }

    const locDays = new Map<string, Set<string>>()
    for (const m of metrics) {
      const dates = locDays.get(m.locationId) ?? new Set()
      dates.add(m.date)
      locDays.set(m.locationId, dates)
    }
    for (const [locId, dates] of locDays) {
      const data = locUtilData.get(locId)
      if (data) data.days = dates.size
    }

    // Compute utilization % per location
    const locUtils: { locId: string; name: string; util: number; rooms: number; days: number; revPerHour: number }[] = []
    for (const [locId, data] of locUtilData) {
      if (data.days === 0 || data.rooms === 0) continue
      const capacityMins = data.rooms * 10 * 60 * data.days
      const util = (data.apptMinutes / capacityMins) * 100
      const locCompleted = completed.filter((a) => a.locationId === locId)
      const locRev = locCompleted.reduce((s, a) => s + a.normalizedRevenue, 0)
      const locHours = data.apptMinutes / 60
      const rph = locHours > 0 ? locRev / locHours : 0
      const loc = locations.find((l) => l.id === locId)
      locUtils.push({ locId, name: loc?.name ?? locId, util, rooms: data.rooms, days: data.days, revPerHour: rph })
    }

    locUtils.sort((a, b) => b.util - a.util)

    if (locUtils.length >= 2) {
      const best = locUtils[0]
      const worst = locUtils[locUtils.length - 1]

      if (best.util > worst.util) {
        const worstCapacityHrs = worst.rooms * 10 * worst.days
        const currentUsedHrs = (worst.util / 100) * worstCapacityHrs
        const targetUsedHrs = (best.util / 100) * worstCapacityHrs
        const additionalHours = Math.max(0, targetUsedHrs - currentUsedHrs)
        const gapAmount = Math.round(additionalHours * worst.revPerHour)

        categories.push({
          name: 'Cross-Location Utilization Gap',
          amount: gapAmount,
          confidence: 'medium',
          computation: `If ${worst.name} matched ${best.name}'s utilization (${Math.round(best.util)}% vs ${Math.round(worst.util)}%), that's ${Math.round(additionalHours)} additional room-hours \u00d7 $${Math.round(worst.revPerHour)} = $${gapAmount.toLocaleString()}`,
          details: `${best.name} operates at ${Math.round(best.util)}% utilization while ${worst.name} is at ${Math.round(worst.util)}%. Closing this gap would add ${Math.round(additionalHours)} productive room-hours.`,
        })
      }
    }
  }

  const totalLeakage = categories.reduce((s, c) => s + c.amount, 0)
  const theoreticalRevenue = actualRevenue + totalLeakage

  return {
    totalLeakage,
    categories,
    theoreticalRevenue,
    actualRevenue: Math.round(actualRevenue),
  }
}
