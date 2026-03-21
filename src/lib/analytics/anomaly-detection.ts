// ---------------------------------------------------------------------------
// Anomaly detection — time-series, cross-location, trend detection
// ---------------------------------------------------------------------------

import type { DailyMetrics, Location } from '@/types'
import type { AnomalyReport, Anomaly, TrendChange } from './types'

interface MetricDef {
  key: keyof DailyMetrics
  label: string
  higherIsBetter: boolean
}

const TRACKED_METRICS: MetricDef[] = [
  { key: 'revenue', label: 'Revenue', higherIsBetter: true },
  { key: 'noShowRate', label: 'No-Show Rate', higherIsBetter: false },
  { key: 'utilizationRate', label: 'Utilization Rate', higherIsBetter: true },
  { key: 'rebookingRate', label: 'Rebooking Rate', higherIsBetter: true },
  { key: 'bookings', label: 'Bookings', higherIsBetter: true },
  { key: 'newClients', label: 'New Clients', higherIsBetter: true },
]

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function getSeverity(deviation: number): 'info' | 'warning' | 'critical' {
  const abs = Math.abs(deviation)
  if (abs >= 3) return 'critical'
  if (abs >= 2) return 'warning'
  return 'info'
}

export function detectAnomalies(
  dailyMetrics: DailyMetrics[],
  locations: Location[],
  windowDays = 14,
): AnomalyReport {
  if (dailyMetrics.length === 0) {
    return { anomalies: [], trends: [] }
  }

  const locationMap = new Map(locations.map((l) => [l.id, l.name]))
  const anomalies: Anomaly[] = []
  const trends: TrendChange[] = []

  // Group metrics by location
  const byLocation = new Map<string, DailyMetrics[]>()
  for (const m of dailyMetrics) {
    const list = byLocation.get(m.locationId) ?? []
    list.push(m)
    byLocation.set(m.locationId, list)
  }
  // Sort each location's metrics by date
  for (const list of byLocation.values()) {
    list.sort((a, b) => a.date.localeCompare(b.date))
  }

  // --- Time-series anomalies ---
  for (const [locId, locMetrics] of byLocation) {
    const locName = locationMap.get(locId) ?? locId

    for (const metricDef of TRACKED_METRICS) {
      const values = locMetrics.map((m) => m[metricDef.key] as number)
      if (values.length < windowDays) continue

      // Use rolling window for baseline
      const windowValues = values.slice(0, -1) // exclude last day for comparison
      const lastValue = values[values.length - 1]

      const avg = mean(windowValues)
      const sd = stdDev(windowValues)

      if (sd === 0) continue

      const deviation = (lastValue - avg) / sd

      if (Math.abs(deviation) >= 1.5) {
        const severity = getSeverity(deviation)
        const direction = deviation > 0 ? 'above' : 'below'
        anomalies.push({
          metric: metricDef.label,
          locationId: locId,
          locationName: locName,
          severity,
          description: `${metricDef.label} at ${locName} is ${Math.abs(deviation).toFixed(1)}\u03c3 ${direction} average`,
          currentValue: Math.round(lastValue * 100) / 100,
          expectedValue: Math.round(avg * 100) / 100,
          deviation: Math.round(deviation * 100) / 100,
        })
      }
    }
  }

  // --- Cross-location anomalies ---
  // If one location's 7-day average deviates > 1.5σ from network average
  for (const metricDef of TRACKED_METRICS) {
    const loc7DayAvgs: { locId: string; locName: string; avg: number }[] = []

    for (const [locId, locMetrics] of byLocation) {
      const last7 = locMetrics.slice(-7)
      if (last7.length === 0) continue
      const avg = mean(last7.map((m) => m[metricDef.key] as number))
      loc7DayAvgs.push({ locId, locName: locationMap.get(locId) ?? locId, avg })
    }

    if (loc7DayAvgs.length < 2) continue

    const networkAvg = mean(loc7DayAvgs.map((l) => l.avg))
    const networkSd = stdDev(loc7DayAvgs.map((l) => l.avg))

    if (networkSd === 0) continue

    for (const loc of loc7DayAvgs) {
      const deviation = (loc.avg - networkAvg) / networkSd
      if (Math.abs(deviation) >= 1.5) {
        const direction = deviation > 0 ? 'above' : 'below'
        // Avoid duplicates with time-series anomalies
        const exists = anomalies.some(
          (a) => a.metric === metricDef.label && a.locationId === loc.locId,
        )
        if (!exists) {
          anomalies.push({
            metric: metricDef.label,
            locationId: loc.locId,
            locationName: loc.locName,
            severity: getSeverity(deviation),
            description: `${loc.locName}'s 7-day ${metricDef.label} avg is ${Math.abs(deviation).toFixed(1)}\u03c3 ${direction} the network average`,
            currentValue: Math.round(loc.avg * 100) / 100,
            expectedValue: Math.round(networkAvg * 100) / 100,
            deviation: Math.round(deviation * 100) / 100,
          })
        }
      }
    }
  }

  // --- Trend detection ---
  // Compare current 7-day avg vs previous 7-day avg. Flag if change > 15%
  for (const [locId, locMetrics] of byLocation) {
    if (locMetrics.length < 14) continue
    const locName = locationMap.get(locId) ?? locId

    for (const metricDef of TRACKED_METRICS) {
      const values = locMetrics.map((m) => m[metricDef.key] as number)
      const current7 = values.slice(-7)
      const previous7 = values.slice(-14, -7)

      const current7Day = mean(current7)
      const previous7Day = mean(previous7)

      if (previous7Day === 0) continue

      const changePct = ((current7Day - previous7Day) / previous7Day) * 100

      if (Math.abs(changePct) >= 15) {
        trends.push({
          metric: metricDef.label,
          locationId: locId,
          locationName: locName,
          direction: changePct > 0 ? 'up' : 'down',
          changePct: Math.round(changePct * 10) / 10,
          current7Day: Math.round(current7Day * 100) / 100,
          previous7Day: Math.round(previous7Day * 100) / 100,
        })
      }
    }
  }

  // Sort anomalies by severity (critical first)
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 }
  anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  // Sort trends by absolute change pct descending
  trends.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))

  return { anomalies, trends }
}
