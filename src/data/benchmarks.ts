export const INDUSTRY_BENCHMARKS = {
  noShowRate: { avg: 20, topPerformer: 12, label: 'No-Show Rate' },
  utilizationRate: { avg: 70, topPerformer: 82, label: 'Utilization' },
  rebookingRate: { avg: 47, topPerformer: 61, label: 'Rebook Rate' },
  newClientReturn90Day: { avg: 35, topPerformer: 50, label: '90-Day Return' },
  avgTicket: { avg: 454, topPerformer: 536, label: 'Avg Ticket' },
  revenueLeakagePct: { avg: 22, topPerformer: 8, label: 'Revenue Leakage %' },
  responseTimeMinutes: { avg: 125, topPerformer: 2, label: 'Response Time' },
} as const

export type BenchmarkKey = keyof typeof INDUSTRY_BENCHMARKS
