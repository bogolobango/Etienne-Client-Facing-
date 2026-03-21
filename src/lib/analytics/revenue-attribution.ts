// ---------------------------------------------------------------------------
// Revenue attribution — by service, provider, time slot, day, client type
// ---------------------------------------------------------------------------

import type { Appointment, Client, Location } from '@/types'
import type { RevenueAttribution } from './types'

const MS_PER_DAY = 86_400_000

const TIME_SLOTS = ['9-11', '11-1', '1-3', '3-5'] as const
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

function getTimeSlot(startTime: string): string {
  const hour = parseInt(startTime.split(':')[0], 10)
  if (hour < 11) return '9-11'
  if (hour < 13) return '11-1'
  if (hour < 15) return '1-3'
  return '3-5'
}

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 1000) / 10 : 0
}

export function attributeRevenue(
  appointments: Appointment[],
  clients: Client[],
  _locations: Location[],
  locationFilter: string,
): RevenueAttribution {
  // Filter by location
  const filtered = locationFilter === 'all'
    ? appointments
    : appointments.filter((a) => a.locationId === locationFilter)

  const completed = filtered.filter((a) => a.status === 'completed')

  if (completed.length === 0) {
    return {
      byService: [],
      byProvider: [],
      byTimeSlot: TIME_SLOTS.map((slot) => ({ slot, revenue: 0, pct: 0 })),
      byDayOfWeek: DAY_NAMES.map((day) => ({ day, revenue: 0, pct: 0 })),
      newClientRevenue: 0,
      returningClientRevenue: 0,
      packageDistortion: 0,
    }
  }

  const totalRevenue = completed.reduce((s, a) => s + a.normalizedRevenue, 0)

  // --- By service ---
  const serviceMap = new Map<string, number>()
  for (const a of completed) {
    serviceMap.set(a.service, (serviceMap.get(a.service) ?? 0) + a.normalizedRevenue)
  }
  const byService = [...serviceMap.entries()]
    .map(([service, revenue]) => ({ service, revenue: Math.round(revenue), pct: pct(revenue, totalRevenue) }))
    .sort((a, b) => b.revenue - a.revenue)

  // --- By provider ---
  const providerMap = new Map<string, number>()
  for (const a of completed) {
    providerMap.set(a.provider, (providerMap.get(a.provider) ?? 0) + a.normalizedRevenue)
  }
  const byProvider = [...providerMap.entries()]
    .map(([provider, revenue]) => ({ provider, revenue: Math.round(revenue), pct: pct(revenue, totalRevenue) }))
    .sort((a, b) => b.revenue - a.revenue)

  // --- By time slot ---
  const slotMap = new Map<string, number>()
  for (const slot of TIME_SLOTS) slotMap.set(slot, 0)
  for (const a of completed) {
    const slot = getTimeSlot(a.startTime)
    slotMap.set(slot, (slotMap.get(slot) ?? 0) + a.normalizedRevenue)
  }
  const byTimeSlot = TIME_SLOTS.map((slot) => {
    const revenue = Math.round(slotMap.get(slot) ?? 0)
    return { slot, revenue, pct: pct(revenue, totalRevenue) }
  })

  // --- By day of week ---
  const dayMap = new Map<string, number>()
  for (const day of DAY_NAMES) dayMap.set(day, 0)
  for (const a of completed) {
    const dayIndex = new Date(a.date).getDay()
    const dayName = DAY_NAMES[dayIndex]
    dayMap.set(dayName, (dayMap.get(dayName) ?? 0) + a.normalizedRevenue)
  }
  const byDayOfWeek = DAY_NAMES.map((day) => {
    const revenue = Math.round(dayMap.get(day) ?? 0)
    return { day, revenue, pct: pct(revenue, totalRevenue) }
  })

  // --- New vs returning ---
  const clientMap = new Map(clients.map((c) => [c.id, c]))
  let newClientRevenue = 0
  let returningClientRevenue = 0
  for (const a of completed) {
    const client = clientMap.get(a.clientId)
    if (client) {
      const joinDate = new Date(client.joinDate).getTime()
      const apptDate = new Date(a.date).getTime()
      const isNew = (apptDate - joinDate) < 30 * MS_PER_DAY
      if (isNew) {
        newClientRevenue += a.normalizedRevenue
      } else {
        returningClientRevenue += a.normalizedRevenue
      }
    } else {
      returningClientRevenue += a.normalizedRevenue
    }
  }

  // --- Package distortion ---
  const packageAppts = completed.filter((a) => a.saleType === 'package')
  const totalBookedRevenue = packageAppts.reduce((s, a) => s + a.revenue, 0)
  const totalNormRevenue = packageAppts.reduce((s, a) => s + a.normalizedRevenue, 0)
  const packageDistortion = totalNormRevenue > 0
    ? Math.round(((totalBookedRevenue - totalNormRevenue) / totalNormRevenue) * 1000) / 10
    : 0

  return {
    byService,
    byProvider,
    byTimeSlot,
    byDayOfWeek,
    newClientRevenue: Math.round(newClientRevenue),
    returningClientRevenue: Math.round(returningClientRevenue),
    packageDistortion,
  }
}
