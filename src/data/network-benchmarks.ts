import { dailyMetrics, locations } from '@/data/seed'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NetworkBenchmark {
  metric: string
  metricLabel: string
  unit: 'percent' | 'currency' | 'number' | 'minutes'
  yourValue: number
  networkAvg: number
  networkMedian: number
  networkP25: number
  networkP75: number
  networkP90: number
  networkTop10: number
  yourPercentile: number
  trend: number // change in percentile over 90 days
  sampleSize: number // how many locations in the network
}

export interface NetworkLocation {
  id: string
  region: string
  size: 'small' | 'medium' | 'large'
  specialtyMix: string
}

export interface PercentileHistory {
  metric: string
  data: { date: string; percentile: number }[]
}

// ---------------------------------------------------------------------------
// Compute "your" aggregate values from seed data (last 30 days, all locations)
// ---------------------------------------------------------------------------

function computeYourValues() {
  const now = new Date()
  const last30 = dailyMetrics.filter((m) => {
    const d = new Date(m.date)
    return (now.getTime() - d.getTime()) / 86400000 <= 30
  })

  const totalRevenue = last30.reduce((s, m) => s + m.revenue, 0)
  const totalBookings = last30.reduce((s, m) => s + m.bookings, 0)
  const totalNewClients = last30.reduce((s, m) => s + m.newClients, 0)
  const avgUtil = last30.length
    ? last30.reduce((s, m) => s + m.utilizationRate, 0) / last30.length
    : 0
  const avgNoShow = last30.length
    ? last30.reduce((s, m) => s + m.noShowRate, 0) / last30.length
    : 0
  const avgRebook = last30.length
    ? last30.reduce((s, m) => s + m.rebookingRate, 0) / last30.length
    : 0
  const avgResponseTime = last30.length
    ? last30.reduce((s, m) => s + m.responseTimeAvg, 0) / last30.length
    : 0

  const locationCount = locations.length
  const revenuePerLocation = totalRevenue / locationCount

  // Provider count from locations
  const totalProviders = locations.reduce((s, l) => s + l.providers, 0)
  const revenuePerProvider = totalRevenue / totalProviders

  // Avg ticket = total revenue / total bookings
  const avgTicket = totalBookings > 0 ? totalRevenue / totalBookings : 0

  // New client % = new clients / total bookings
  const newClientPct = totalBookings > 0 ? (totalNewClients / totalBookings) * 100 : 0

  // Package adoption: use revenueByType.package / total revenue
  const totalPackageRevenue = last30.reduce((s, m) => s + m.revenueByType.package, 0)
  const packageAdoption = totalRevenue > 0 ? (totalPackageRevenue / totalRevenue) * 100 : 0

  // Client retention 12mo — simulated from rebook rate with retention multiplier
  const clientRetention12mo = Math.min(avgRebook * 1.15, 82)

  return {
    revenuePerLocation: Math.round(revenuePerLocation),
    revenuePerProvider: Math.round(revenuePerProvider),
    utilization: +avgUtil.toFixed(1),
    noShowRate: +avgNoShow.toFixed(1),
    rebookRate: +avgRebook.toFixed(1),
    avgTicket: Math.round(avgTicket),
    newClientPct: +newClientPct.toFixed(1),
    responseTime: +(avgResponseTime / 60).toFixed(1), // convert seconds to minutes
    packageAdoption: +packageAdoption.toFixed(1),
    clientRetention12mo: +clientRetention12mo.toFixed(1),
  }
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random for reproducible network data
// ---------------------------------------------------------------------------

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

// ---------------------------------------------------------------------------
// Build network benchmarks positioned so "your" values land around 40th-65th %ile
// ---------------------------------------------------------------------------

function buildNetworkBenchmarks(): NetworkBenchmark[] {
  const yours = computeYourValues()

  // For each metric, define the network distribution so your value falls at the target percentile
  // Format: [metric key, label, unit, yourValue, targetPercentile, networkShape]
  const metricDefs: {
    metric: string
    metricLabel: string
    unit: 'percent' | 'currency' | 'number' | 'minutes'
    yourValue: number
    targetPercentile: number
    higherIsBetter: boolean
    trend: number
  }[] = [
    { metric: 'revenue_per_location', metricLabel: 'Revenue / Location', unit: 'currency', yourValue: yours.revenuePerLocation, targetPercentile: 52, higherIsBetter: true, trend: 8 },
    { metric: 'revenue_per_provider', metricLabel: 'Revenue / Provider', unit: 'currency', yourValue: yours.revenuePerProvider, targetPercentile: 48, higherIsBetter: true, trend: 6 },
    { metric: 'utilization', metricLabel: 'Utilization Rate', unit: 'percent', yourValue: yours.utilization, targetPercentile: 58, higherIsBetter: true, trend: 14 },
    { metric: 'no_show_rate', metricLabel: 'No-Show Rate', unit: 'percent', yourValue: yours.noShowRate, targetPercentile: 45, higherIsBetter: false, trend: 12 },
    { metric: 'rebook_rate', metricLabel: 'Rebook Rate', unit: 'percent', yourValue: yours.rebookRate, targetPercentile: 62, higherIsBetter: true, trend: 18 },
    { metric: 'avg_ticket', metricLabel: 'Avg Ticket Size', unit: 'currency', yourValue: yours.avgTicket, targetPercentile: 55, higherIsBetter: true, trend: 4 },
    { metric: 'new_client_pct', metricLabel: 'New Client %', unit: 'percent', yourValue: yours.newClientPct, targetPercentile: 42, higherIsBetter: true, trend: -3 },
    { metric: 'response_time', metricLabel: 'Avg Response Time', unit: 'minutes', yourValue: yours.responseTime, targetPercentile: 64, higherIsBetter: false, trend: 22 },
    { metric: 'package_adoption', metricLabel: 'Package Adoption Rate', unit: 'percent', yourValue: yours.packageAdoption, targetPercentile: 44, higherIsBetter: true, trend: 7 },
    { metric: 'client_retention_12mo', metricLabel: 'Client Retention (12mo)', unit: 'percent', yourValue: yours.clientRetention12mo, targetPercentile: 50, higherIsBetter: true, trend: 10 },
  ]

  return metricDefs.map((def) => {
    const { metric, metricLabel, unit, yourValue, targetPercentile, higherIsBetter, trend } = def

    // Build distribution around "your" value so it falls at the target percentile
    // For "higher is better" metrics: values above yours push you down in percentile
    // For "lower is better" metrics (no-show, response time): values below yours are better

    let p25: number, median: number, p75: number, p90: number, top10: number, avg: number

    if (higherIsBetter) {
      // Your value at target percentile — means (100-target)% of the network is above you
      const spread = yourValue * 0.35
      p25 = +(yourValue - spread * (targetPercentile - 25) / 50).toFixed(1)
      median = +(yourValue + spread * (50 - targetPercentile) / 50).toFixed(1)
      p75 = +(yourValue + spread * (75 - targetPercentile) / 50).toFixed(1)
      p90 = +(yourValue + spread * (90 - targetPercentile) / 50).toFixed(1)
      top10 = +(p90 * 1.08).toFixed(1)
      avg = +(median * 0.98).toFixed(1)
    } else {
      // For lower-is-better: lower value = better = higher percentile
      const spread = yourValue * 0.4
      p25 = +(yourValue + spread * (targetPercentile - 25) / 50).toFixed(1) // worst quartile (high value)
      median = +(yourValue - spread * (targetPercentile - 50) / 50).toFixed(1)
      p75 = +(yourValue - spread * (75 - targetPercentile) / 50).toFixed(1) // good (low value)
      p90 = +(yourValue - spread * (90 - targetPercentile) / 50).toFixed(1) // great (very low)
      top10 = +(p90 * 0.7).toFixed(1)
      avg = +(median * 1.05).toFixed(1)
    }

    // Clamp: no negatives, no-show/utilization capped at 100
    const clamp = (v: number, min = 0, max = Infinity) => Math.max(min, Math.min(max, v))
    if (unit === 'percent') {
      p25 = clamp(p25, 0, 100)
      median = clamp(median, 0, 100)
      p75 = clamp(p75, 0, 100)
      p90 = clamp(p90, 0, 100)
      top10 = clamp(top10, 0, 100)
      avg = clamp(avg, 0, 100)
    } else {
      p25 = clamp(p25)
      median = clamp(median)
      p75 = clamp(p75)
      p90 = clamp(p90)
      top10 = clamp(top10)
      avg = clamp(avg)
    }

    // Round currency values
    if (unit === 'currency') {
      p25 = Math.round(p25)
      median = Math.round(median)
      p75 = Math.round(p75)
      p90 = Math.round(p90)
      top10 = Math.round(top10)
      avg = Math.round(avg)
    }

    return {
      metric,
      metricLabel,
      unit,
      yourValue: unit === 'currency' ? Math.round(yourValue) : +yourValue.toFixed(1),
      networkAvg: avg,
      networkMedian: median,
      networkP25: p25,
      networkP75: p75,
      networkP90: p90,
      networkTop10: top10,
      yourPercentile: targetPercentile,
      trend,
      sampleSize: 247,
    }
  })
}

// ---------------------------------------------------------------------------
// Network locations (simulated)
// ---------------------------------------------------------------------------

const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'Mid-Atlantic', 'Pacific Northwest', 'Mountain West']
const SIZES: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large']
const SPECIALTY_MIXES = ['Injectable-heavy', 'Balanced', 'Laser-focused', 'Body-focused', 'Facial-dominant']

function buildNetworkLocations(): NetworkLocation[] {
  const locs: NetworkLocation[] = []
  for (let i = 0; i < 247; i++) {
    locs.push({
      id: `network-loc-${String(i + 1).padStart(3, '0')}`,
      region: REGIONS[Math.floor(seededRandom(i * 3 + 1) * REGIONS.length)],
      size: SIZES[Math.floor(seededRandom(i * 3 + 2) * SIZES.length)],
      specialtyMix: SPECIALTY_MIXES[Math.floor(seededRandom(i * 3 + 3) * SPECIALTY_MIXES.length)],
    })
  }
  return locs
}

// ---------------------------------------------------------------------------
// Percentile history — 12 months of gradual improvement
// ---------------------------------------------------------------------------

function buildPercentileHistory(benchmarks: NetworkBenchmark[]): PercentileHistory[] {
  const now = new Date()

  return benchmarks.map((bm, bmIdx) => {
    const data: { date: string; percentile: number }[] = []
    const currentPercentile = bm.yourPercentile
    const trendOver90 = bm.trend

    // Extrapolate backward: 12 months ago you were lower
    // trend is per-90-days, so per-month is trend / 3
    const monthlyTrend = trendOver90 / 3

    for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - monthsAgo)
      const basePercentile = currentPercentile - monthlyTrend * monthsAgo
      // Add small noise
      const noise = (seededRandom(bmIdx * 100 + monthsAgo * 7) - 0.5) * 4
      const percentile = Math.max(5, Math.min(95, Math.round(basePercentile + noise)))

      data.push({
        date: d.toISOString().slice(0, 7), // YYYY-MM
        percentile,
      })
    }

    return {
      metric: bm.metric,
      data,
    }
  })
}

// ---------------------------------------------------------------------------
// Exports — computed once
// ---------------------------------------------------------------------------

export const networkBenchmarks: NetworkBenchmark[] = buildNetworkBenchmarks()
export const networkLocations: NetworkLocation[] = buildNetworkLocations()
export const percentileHistories: PercentileHistory[] = buildPercentileHistory(networkBenchmarks)

// Aggregate stats
export const NETWORK_STATS = {
  totalLocations: 247,
  totalStates: 38,
  growthPerMonth: 12,
  dataPointsAnalyzed: '2.4M',
} as const
