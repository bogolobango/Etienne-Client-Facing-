// ---------------------------------------------------------------------------
// Benchmark engine — segmented industry benchmarks
// ---------------------------------------------------------------------------

import type { PracticeProfile, SegmentedBenchmarks, BenchmarkRange } from './types'

interface BenchmarkData {
  noShowRate: BenchmarkRange
  utilizationRate: BenchmarkRange
  rebookingRate: BenchmarkRange
  avgTicket: BenchmarkRange
  revenuePerProvider: BenchmarkRange
  newClientRate: BenchmarkRange
  source: string
}

const BENCHMARK_DATA: Record<string, BenchmarkData> = {
  'urban_full_service_4_15': {
    noShowRate: { bottom25: 22, median: 16, top25: 12, topDecile: 8 },
    utilizationRate: { bottom25: 58, median: 68, top25: 78, topDecile: 85 },
    rebookingRate: { bottom25: 35, median: 47, top25: 58, topDecile: 65 },
    avgTicket: { bottom25: 320, median: 454, top25: 540, topDecile: 650 },
    revenuePerProvider: { bottom25: 18000, median: 28000, top25: 38000, topDecile: 48000 },
    newClientRate: { bottom25: 15, median: 30, top25: 50, topDecile: 75 },
    source: 'AmSpa 2024, Zenoti 2025 Benchmark Report \u2014 4-15 location urban full-service',
  },
  'suburban_full_service_4_15': {
    noShowRate: { bottom25: 25, median: 18, top25: 13, topDecile: 9 },
    utilizationRate: { bottom25: 52, median: 63, top25: 74, topDecile: 82 },
    rebookingRate: { bottom25: 32, median: 44, top25: 55, topDecile: 62 },
    avgTicket: { bottom25: 280, median: 390, top25: 480, topDecile: 580 },
    revenuePerProvider: { bottom25: 15000, median: 24000, top25: 33000, topDecile: 42000 },
    newClientRate: { bottom25: 12, median: 25, top25: 40, topDecile: 60 },
    source: 'AmSpa 2024, Skytale Group \u2014 4-15 location suburban',
  },
  'urban_injectable_4_15': {
    noShowRate: { bottom25: 18, median: 13, top25: 9, topDecile: 6 },
    utilizationRate: { bottom25: 62, median: 72, top25: 82, topDecile: 88 },
    rebookingRate: { bottom25: 55, median: 65, top25: 75, topDecile: 82 },
    avgTicket: { bottom25: 400, median: 520, top25: 650, topDecile: 800 },
    revenuePerProvider: { bottom25: 22000, median: 32000, top25: 42000, topDecile: 55000 },
    newClientRate: { bottom25: 10, median: 22, top25: 38, topDecile: 55 },
    source: 'Zenoti 2025, AmSpa 2024 \u2014 injectable-dominant 4-15 location',
  },
}

const DEFAULT_KEY = 'urban_full_service_4_15'

function buildKey(profile: PracticeProfile): string {
  return `${profile.setting}_${profile.serviceType}_${profile.locationCount}`
}

export function getSegmentedBenchmarks(profile: PracticeProfile): SegmentedBenchmarks {
  const key = buildKey(profile)
  const data = BENCHMARK_DATA[key] ?? BENCHMARK_DATA[DEFAULT_KEY]
  const segment = key in BENCHMARK_DATA ? key : DEFAULT_KEY

  return {
    segment,
    noShowRate: data.noShowRate,
    utilizationRate: data.utilizationRate,
    rebookingRate: data.rebookingRate,
    avgTicket: data.avgTicket,
    revenuePerProvider: data.revenuePerProvider,
    newClientRate: data.newClientRate,
    source: data.source,
  }
}
