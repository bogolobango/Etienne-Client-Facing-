// ---------------------------------------------------------------------------
// Analytics engine — barrel exports + computeAllAnalytics()
// ---------------------------------------------------------------------------

import type { Appointment, Client, DailyMetrics, Location, Service } from '@/types'
import type { Provider } from '@/data/providers'
import type { AnalyticsResult } from './types'

import { analyzeCohorts } from './cohort-analysis'
import { attributeRevenue } from './revenue-attribution'
import { computeLeakage } from './leakage-model'
import { detectAnomalies } from './anomaly-detection'
import { scoreAllAppointments } from './no-show-model'
import { computeProviderEconomics } from './provider-economics'
import { getSegmentedBenchmarks } from './benchmark-engine'
import { analyzePackages } from './package-analytics'

// Re-export all types
export type {
  CohortAnalysis,
  AtRiskClient,
  ServiceRetention,
  RevenueAttribution,
  RevenueBySegment,
  RevenueByProvider,
  RevenueByTimeSlot,
  RevenueByDayOfWeek,
  RevenueLeakage,
  LeakageCategory,
  AnomalyReport,
  Anomaly,
  TrendChange,
  NoShowRiskScore,
  NoShowFactor,
  ProviderEconomicsResult,
  ProviderEconomicsRow,
  SegmentedBenchmarks,
  BenchmarkRange,
  PracticeProfile,
  PackageAnalytics,
  PackageBreakdown,
  AnalyticsResult,
} from './types'

// Re-export individual functions
export { analyzeCohorts } from './cohort-analysis'
export { attributeRevenue } from './revenue-attribution'
export { computeLeakage } from './leakage-model'
export { detectAnomalies } from './anomaly-detection'
export { scoreNoShowRisk, scoreAllAppointments } from './no-show-model'
export { computeProviderEconomics } from './provider-economics'
export { getSegmentedBenchmarks } from './benchmark-engine'
export { analyzePackages } from './package-analytics'

/**
 * Compute all analytics in one pass.
 * Pure computation — no React, no hooks, no stores.
 */
export function computeAllAnalytics(
  appointments: Appointment[],
  clients: Client[],
  dailyMetrics: DailyMetrics[],
  locations: Location[],
  services: Service[],
  providers: Provider[],
  locationFilter: string,
): AnalyticsResult {
  const cohorts = analyzeCohorts(clients, appointments, locations)
  const revenueAttribution = attributeRevenue(appointments, clients, locations, locationFilter)
  const leakage = computeLeakage(appointments, clients, dailyMetrics, locations, services, locationFilter)
  const anomalies = detectAnomalies(dailyMetrics, locations)
  const providerEconomics = computeProviderEconomics(appointments, providers, locations, locationFilter)
  const benchmarks = getSegmentedBenchmarks({
    setting: 'urban',
    serviceType: 'full_service',
    locationCount: '4_15',
  })
  const packages = analyzePackages(appointments, clients, locationFilter)

  // Score all confirmed (upcoming) appointments
  const upcomingAppts = appointments.filter((a) => a.status === 'confirmed')
  const noShowScores = scoreAllAppointments(upcomingAppts, clients, appointments)

  return {
    cohorts,
    revenueAttribution,
    leakage,
    anomalies,
    providerEconomics,
    benchmarks,
    packages,
    noShowScores,
  }
}
