import { dailyMetrics, appointments, conversations, opportunities } from '@/data/seed'

export function computeContext(locationId: string) {
  const now = new Date()

  const last30 = dailyMetrics.filter((m) => {
    const d = new Date(m.date)
    return (now.getTime() - d.getTime()) / 86400000 <= 30 &&
      (locationId === 'all' || m.locationId === locationId)
  })

  const filteredAppts = locationId === 'all'
    ? appointments
    : appointments.filter((a) => a.locationId === locationId)

  const filteredConvos = locationId === 'all'
    ? conversations
    : conversations.filter((c) => c.locationId === locationId)

  const filteredOpps = locationId === 'all'
    ? opportunities
    : opportunities.filter((o) => o.locationId === locationId)

  const totalRevenue = last30.reduce((s, m) => s + m.revenue, 0)
  const avgUtil = last30.length ? last30.reduce((s, m) => s + m.utilizationRate, 0) / last30.length : 0
  const avgNoShow = last30.length ? last30.reduce((s, m) => s + m.noShowRate, 0) / last30.length : 0
  const avgRebook = last30.length ? last30.reduce((s, m) => s + m.rebookingRate, 0) / last30.length : 0
  const totalRecovered = last30.reduce((s, m) => s + m.revenueRecovered, 0)
  const totalBookings = last30.reduce((s, m) => s + m.bookings, 0)
  const totalNewClients = last30.reduce((s, m) => s + m.newClients, 0)
  const aiResolved = filteredConvos.filter((c) => c.status === 'ai_resolved').length
  const aiBooked = filteredAppts.filter((a) => a.bookedBy === 'ai').length
  const highRiskAppts = filteredAppts.filter((a) => a.noShowRisk === 'high' && a.status === 'confirmed').length
  const avgResponseTime = last30.length ? last30.reduce((s, m) => s + m.responseTimeAvg, 0) / last30.length : 0

  const oppsByStatus = {
    new: filteredOpps.filter((o) => o.status === 'new').length,
    contacted: filteredOpps.filter((o) => o.status === 'contacted').length,
    booked: filteredOpps.filter((o) => o.status === 'booked').length,
    lost: filteredOpps.filter((o) => o.status === 'lost').length,
  }
  const oppPipelineValue = filteredOpps
    .filter((o) => o.status !== 'lost')
    .reduce((s, o) => s + o.estimatedRevenue, 0)

  // Per-location breakdown
  const locationIds = ['soho', 'williamsburg', 'hoboken', 'white-plains', 'stamford']
  const locationNames: Record<string, string> = {
    'soho': 'SoHo Flagship',
    'williamsburg': 'Williamsburg',
    'hoboken': 'Hoboken',
    'white-plains': 'White Plains',
    'stamford': 'Stamford',
  }

  const byLocation = locationIds.map((lid) => {
    const locMetrics = last30.filter((m) => m.locationId === lid)
    const locRevenue = locMetrics.reduce((s, m) => s + m.revenue, 0)
    const locUtil = locMetrics.length ? locMetrics.reduce((s, m) => s + m.utilizationRate, 0) / locMetrics.length : 0
    const locNoShow = locMetrics.length ? locMetrics.reduce((s, m) => s + m.noShowRate, 0) / locMetrics.length : 0
    const locNewClients = locMetrics.reduce((s, m) => s + m.newClients, 0)
    const locRebook = locMetrics.length ? locMetrics.reduce((s, m) => s + m.rebookingRate, 0) / locMetrics.length : 0
    return {
      id: lid,
      name: locationNames[lid],
      revenue: locRevenue,
      utilization: locUtil,
      noShowRate: locNoShow,
      newClients: locNewClients,
      rebookingRate: locRebook,
    }
  })

  // Revenue disaggregation
  const revenueByType = last30.reduce(
    (acc, m) => ({
      service: acc.service + m.revenueByType.service,
      package: acc.package + m.revenueByType.package,
      product: acc.product + m.revenueByType.product,
      membership: acc.membership + m.revenueByType.membership,
      giftcard: acc.giftcard + m.revenueByType.giftcard,
    }),
    { service: 0, package: 0, product: 0, membership: 0, giftcard: 0 }
  )
  const totalNormalizedRevenue = last30.reduce((s, m) => s + m.normalizedRevenue, 0)
  const totalPackageBookings = last30.reduce((s, m) => s + m.packageBookings, 0)

  return {
    totalRevenue,
    totalNormalizedRevenue,
    revenueByType,
    totalPackageBookings,
    avgUtil,
    avgNoShow,
    avgRebook,
    totalRecovered,
    totalBookings,
    totalNewClients,
    aiResolved,
    aiBooked,
    highRiskAppts,
    avgResponseTime,
    oppsByStatus,
    oppPipelineValue,
    byLocation,
    totalConversations: filteredConvos.length,
  }
}

export type AIContext = ReturnType<typeof computeContext>
