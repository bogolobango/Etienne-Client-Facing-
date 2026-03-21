// ---------------------------------------------------------------------------
// No-show risk scoring — points-based model
// ---------------------------------------------------------------------------

import type { Appointment, Client } from '@/types'
import type { NoShowRiskScore, NoShowFactor } from './types'

const DAY_OF_WEEK_POINTS: Record<number, number> = {
  0: 5,  // Sunday
  1: 15, // Monday
  2: 10, // Tuesday
  3: 5,  // Wednesday
  4: 2,  // Thursday
  5: 0,  // Friday
  6: 3,  // Saturday
}

const DAY_OF_WEEK_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 25) return 'low'
  if (score <= 50) return 'medium'
  return 'high'
}

export function scoreNoShowRisk(
  appointment: Appointment,
  client: Client,
  clientAppointments: Appointment[],
): NoShowRiskScore {
  const factors: NoShowFactor[] = []
  let score = 10 // base

  // --- 1. Client history: +30 max — (clientNoShowRate%) × 0.3 ---
  const totalAppts = clientAppointments.filter(
    (a) => a.status === 'completed' || a.status === 'no_show',
  ).length
  const noShowCount = clientAppointments.filter((a) => a.status === 'no_show').length
  const noShowRate = totalAppts > 0 ? (noShowCount / totalAppts) * 100 : 0
  const historyPoints = Math.min(30, Math.round(noShowRate * 0.3 * 10) / 10)
  if (historyPoints > 0) {
    factors.push({
      name: 'Client History',
      points: historyPoints,
      reason: `${noShowRate.toFixed(0)}% no-show rate (${noShowCount}/${totalAppts} appointments)`,
    })
    score += historyPoints
  }

  // --- 2. Day of week: +15 max ---
  const dayIndex = new Date(appointment.date).getDay()
  const dayPoints = DAY_OF_WEEK_POINTS[dayIndex] ?? 0
  if (dayPoints > 0) {
    factors.push({
      name: 'Day of Week',
      points: dayPoints,
      reason: `${DAY_OF_WEEK_NAMES[dayIndex]} appointments have higher no-show risk`,
    })
    score += dayPoints
  }

  // --- 3. Time of day: +10 max ---
  const hour = parseInt(appointment.startTime.split(':')[0], 10)
  let timePoints = 0
  let timeReason = ''
  if (hour >= 16 && hour < 17) {
    timePoints = 10
    timeReason = '4-5 PM slot has highest no-show risk'
  } else if (hour >= 9 && hour < 10) {
    timePoints = 8
    timeReason = '9-10 AM early slot has elevated no-show risk'
  }
  if (timePoints > 0) {
    factors.push({ name: 'Time of Day', points: timePoints, reason: timeReason })
    score += timePoints
  }

  // --- 4. Booking lead time: +15 max ---
  const now = new Date()
  const apptDate = new Date(appointment.date)
  const leadDays = Math.max(0, Math.round((apptDate.getTime() - now.getTime()) / 86_400_000))
  let leadPoints = 0
  let leadReason = ''
  if (leadDays >= 21) {
    leadPoints = 15
    leadReason = `Booked ${leadDays} days ahead (21+ days lead time)`
  } else if (leadDays >= 14) {
    leadPoints = 10
    leadReason = `Booked ${leadDays} days ahead (14-20 days lead time)`
  } else if (leadDays >= 7) {
    leadPoints = 5
    leadReason = `Booked ${leadDays} days ahead (7-13 days lead time)`
  }
  if (leadPoints > 0) {
    factors.push({ name: 'Booking Lead Time', points: leadPoints, reason: leadReason })
    score += leadPoints
  }

  // --- 5. New client: +15 ---
  if (client.totalVisits <= 1) {
    factors.push({ name: 'New Client', points: 15, reason: 'First-time or single-visit client' })
    score += 15
  }

  // --- 6. Service value: +10 max ---
  let valuePoints = 0
  let valueReason = ''
  if (appointment.normalizedRevenue < 300) {
    valuePoints = 10
    valueReason = `Low-value appointment ($${appointment.normalizedRevenue}) — higher no-show likelihood`
  } else if (appointment.normalizedRevenue <= 600) {
    valuePoints = 5
    valueReason = `Mid-value appointment ($${appointment.normalizedRevenue})`
  }
  if (valuePoints > 0) {
    factors.push({ name: 'Service Value', points: valuePoints, reason: valueReason })
    score += valuePoints
  }

  // --- 7. Provider rate: +5 max ---
  // Use the provider's no-show rate from their appointments
  const providerAppts = clientAppointments.length > 0
    ? clientAppointments // we use all client's appointments with this provider
    : []
  void providerAppts // provider-level scoring computed at aggregate level
  // For individual scoring, we approximate from the appointment list
  const providerNoShows = clientAppointments.filter(
    (a) => a.provider === appointment.provider && a.status === 'no_show',
  ).length
  const providerTotal = clientAppointments.filter(
    (a) => a.provider === appointment.provider && (a.status === 'completed' || a.status === 'no_show'),
  ).length
  const providerRate = providerTotal > 0 ? (providerNoShows / providerTotal) * 100 : 0
  const providerPoints = Math.min(5, Math.round(providerRate * 0.05 * 10) / 10)
  if (providerPoints > 0) {
    factors.push({
      name: 'Provider Rate',
      points: providerPoints,
      reason: `Provider has ${providerRate.toFixed(0)}% no-show rate`,
    })
    score += providerPoints
  }

  // Clamp score
  score = Math.min(100, Math.max(0, Math.round(score)))

  return {
    score,
    level: getLevel(score),
    factors,
  }
}

export function scoreAllAppointments(
  appointments: Appointment[],
  clients: Client[],
  allAppointments: Appointment[],
): Map<string, NoShowRiskScore> {
  const clientMap = new Map(clients.map((c) => [c.id, c]))

  // Build per-client appointment histories
  const clientApptMap = new Map<string, Appointment[]>()
  for (const a of allAppointments) {
    const list = clientApptMap.get(a.clientId) ?? []
    list.push(a)
    clientApptMap.set(a.clientId, list)
  }

  const results = new Map<string, NoShowRiskScore>()

  for (const appt of appointments) {
    const client = clientMap.get(appt.clientId)
    if (!client) continue

    const clientAppts = clientApptMap.get(appt.clientId) ?? []
    results.set(appt.id, scoreNoShowRisk(appt, client, clientAppts))
  }

  return results
}
