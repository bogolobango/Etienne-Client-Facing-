// ---------------------------------------------------------------------------
// Analytics engine type definitions
// ---------------------------------------------------------------------------

// --- Cohort Analysis ---

export interface AtRiskClient {
  clientId: string
  name: string
  clv: number
  lastVisit: string
  avgInterval: number
  daysSinceLastVisit: number
  preferredLocation: string
}

export interface ServiceRetention {
  service: string
  rate: number
  count: number
}

export interface CohortAnalysis {
  retentionRate: number
  serviceRetention: ServiceRetention[]
  atRiskClients: AtRiskClient[]
  crossLocationClients: number
  crossLocationPct: number
}

// --- Revenue Attribution ---

export interface RevenueBySegment {
  service: string
  revenue: number
  pct: number
}

export interface RevenueByProvider {
  provider: string
  revenue: number
  pct: number
}

export interface RevenueByTimeSlot {
  slot: string
  revenue: number
  pct: number
}

export interface RevenueByDayOfWeek {
  day: string
  revenue: number
  pct: number
}

export interface RevenueAttribution {
  byService: RevenueBySegment[]
  byProvider: RevenueByProvider[]
  byTimeSlot: RevenueByTimeSlot[]
  byDayOfWeek: RevenueByDayOfWeek[]
  newClientRevenue: number
  returningClientRevenue: number
  packageDistortion: number
}

// --- Revenue Leakage ---

export interface LeakageCategory {
  name: string
  amount: number
  confidence: 'high' | 'medium' | 'low'
  computation: string
  details: string
}

export interface RevenueLeakage {
  totalLeakage: number
  categories: LeakageCategory[]
  theoreticalRevenue: number
  actualRevenue: number
}

// --- Anomaly Detection ---

export interface Anomaly {
  metric: string
  locationId: string
  locationName: string
  severity: 'info' | 'warning' | 'critical'
  description: string
  currentValue: number
  expectedValue: number
  deviation: number
}

export interface TrendChange {
  metric: string
  locationId: string
  locationName: string
  direction: 'up' | 'down'
  changePct: number
  current7Day: number
  previous7Day: number
}

export interface AnomalyReport {
  anomalies: Anomaly[]
  trends: TrendChange[]
}

// --- No-Show Risk ---

export interface NoShowFactor {
  name: string
  points: number
  reason: string
}

export interface NoShowRiskScore {
  score: number
  level: 'low' | 'medium' | 'high'
  factors: NoShowFactor[]
}

// --- Provider Economics ---

export interface ProviderEconomicsRow {
  providerId: string
  providerName: string
  title: string
  locationId: string
  revenue: number
  cost: number
  margin: number
  marginPct: number
  revenuePerHour: number
  avgTicket: number
  appointments: number
  hoursWorked: number
}

export interface ProviderEconomicsResult {
  providers: ProviderEconomicsRow[]
  networkAvgMarginPct: number
  networkAvgRevPerHour: number
}

// --- Benchmarks ---

export interface BenchmarkRange {
  bottom25: number
  median: number
  top25: number
  topDecile: number
}

export interface SegmentedBenchmarks {
  segment: string
  noShowRate: BenchmarkRange
  utilizationRate: BenchmarkRange
  rebookingRate: BenchmarkRange
  avgTicket: BenchmarkRange
  revenuePerProvider: BenchmarkRange
  newClientRate: BenchmarkRange
  source: string
}

export interface PracticeProfile {
  setting: 'urban' | 'suburban'
  serviceType: 'full_service' | 'injectable'
  locationCount: '1_3' | '4_15' | '16_plus'
}

// --- Package Analytics ---

export interface PackageBreakdown {
  packageId: string
  packageName: string
  totalSold: number
  completionRate: number
  avgSessionsUsed: number
  deferredRevenue: number
}

export interface PackageAnalytics {
  byPackage: PackageBreakdown[]
  totalDeferred: number
  totalCompleted: number
  overallCompletionRate: number
  atRiskPackages: number
}

// --- Aggregate Result ---

export interface AnalyticsResult {
  cohorts: CohortAnalysis
  revenueAttribution: RevenueAttribution
  leakage: RevenueLeakage
  anomalies: AnomalyReport
  providerEconomics: ProviderEconomicsResult
  benchmarks: SegmentedBenchmarks
  packages: PackageAnalytics
  noShowScores: Map<string, NoShowRiskScore>
}
