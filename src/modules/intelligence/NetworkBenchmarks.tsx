import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Network,
  Globe,
  Target,
  DollarSign,
} from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLocationStore } from '@/stores/useLocationStore'
import {
  networkBenchmarks,
  percentileHistories,
  NETWORK_STATS,
} from '@/data/network-benchmarks'
import type { NetworkBenchmark } from '@/data/network-benchmarks'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatValue(value: number, unit: NetworkBenchmark['unit']): string {
  switch (unit) {
    case 'currency':
      return `$${value.toLocaleString()}`
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'minutes':
      return `${value.toFixed(1)}m`
    case 'number':
      return value.toLocaleString()
  }
}

function percentileColor(p: number): string {
  if (p >= 60) return 'text-emerald-400'
  if (p >= 30) return 'text-amber-400'
  return 'text-red-400'
}

function percentileBg(p: number): string {
  if (p >= 60) return 'bg-emerald-400/10'
  if (p >= 30) return 'bg-amber-400/10'
  return 'bg-red-400/10'
}

function percentileBorder(p: number): string {
  if (p >= 60) return 'border-emerald-400/30'
  if (p >= 30) return 'border-amber-400/30'
  return 'border-red-400/30'
}

function cellColor(yourValue: number, benchmarkValue: number, higherIsBetter: boolean): string {
  const diff = higherIsBetter
    ? (yourValue - benchmarkValue) / benchmarkValue
    : (benchmarkValue - yourValue) / benchmarkValue
  if (diff > 0.05) return 'text-emerald-400'
  if (diff > -0.05) return 'text-amber-400'
  return 'text-red-400'
}

const HIGHER_IS_BETTER_METRICS = new Set([
  'revenue_per_location',
  'revenue_per_provider',
  'utilization',
  'rebook_rate',
  'avg_ticket',
  'new_client_pct',
  'package_adoption',
  'client_retention_12mo',
])

// Which metrics to show in the percentile history chart
const HISTORY_METRICS = ['utilization', 'rebook_rate', 'no_show_rate', 'revenue_per_location']

const HISTORY_COLORS = ['#818cf8', '#34d399', '#f59e0b', '#f472b6']

// Animation variants
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NetworkStatsBanner() {
  return (
    <motion.div
      variants={fadeUp}
      className="card-premium p-4 flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Globe className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Your locations benchmarked against{' '}
            <span className="text-primary font-semibold">{NETWORK_STATS.totalLocations}</span> med spas across{' '}
            <span className="text-primary font-semibold">{NETWORK_STATS.totalStates}</span> states
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {NETWORK_STATS.dataPointsAnalyzed}+ data points analyzed from network members
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{NETWORK_STATS.totalLocations}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Locations</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{NETWORK_STATS.totalStates}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">States</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">10</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Metrics</p>
        </div>
      </div>
    </motion.div>
  )
}

function PercentileBar({ benchmark }: { benchmark: NetworkBenchmark }) {
  // Positions on the 0-100 bar
  const markerPos = (percentile: number) => `${Math.max(2, Math.min(98, percentile))}%`

  return (
    <div className="mt-3 relative">
      {/* Track */}
      <div className="h-2 rounded-full bg-primary/[0.08] relative overflow-visible">
        {/* Interquartile range fill */}
        <div
          className="absolute top-0 h-full bg-primary/20 rounded-full"
          style={{ left: '25%', width: '50%' }}
        />

        {/* P25 marker */}
        <div className="absolute top-0 h-full w-px bg-muted-foreground/30" style={{ left: '25%' }} />
        {/* P50 marker */}
        <div className="absolute top-0 h-full w-px bg-muted-foreground/50" style={{ left: '50%' }} />
        {/* P75 marker */}
        <div className="absolute top-0 h-full w-px bg-muted-foreground/30" style={{ left: '75%' }} />
        {/* P90 marker */}
        <div className="absolute top-0 h-full w-px bg-muted-foreground/20" style={{ left: '90%' }} />

        {/* "You" marker */}
        <motion.div
          initial={{ left: '0%', opacity: 0 }}
          animate={{ left: markerPos(benchmark.yourPercentile), opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="absolute -top-1 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg shadow-primary/30"
          style={{ transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-muted-foreground">P25</span>
        <span className="text-[10px] text-muted-foreground">P50</span>
        <span className="text-[10px] text-muted-foreground">P75</span>
        <span className="text-[10px] text-muted-foreground">P90</span>
      </div>
    </div>
  )
}

function PercentileCard({ benchmark }: { benchmark: NetworkBenchmark }) {
  const trendPositive = benchmark.trend > 0
  const trendNeutral = benchmark.trend === 0

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'card-premium p-4 border',
        percentileBorder(benchmark.yourPercentile)
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {benchmark.metricLabel}
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatValue(benchmark.yourValue, benchmark.unit)}
          </p>
        </div>
        <div className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold', percentileBg(benchmark.yourPercentile), percentileColor(benchmark.yourPercentile))}>
          <span>P{benchmark.yourPercentile}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-muted-foreground">
          Network avg: {formatValue(benchmark.networkAvg, benchmark.unit)}
        </span>
        <span className="text-muted-foreground/40">|</span>
        {trendNeutral ? (
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Minus className="w-3 h-3" />
            Flat
          </span>
        ) : trendPositive ? (
          <span className="flex items-center gap-0.5 text-xs text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            +{benchmark.trend} pts (90d)
          </span>
        ) : (
          <span className="flex items-center gap-0.5 text-xs text-red-400">
            <TrendingDown className="w-3 h-3" />
            {benchmark.trend} pts (90d)
          </span>
        )}
      </div>

      <PercentileBar benchmark={benchmark} />
    </motion.div>
  )
}

function RadarSection() {
  const radarData = networkBenchmarks.map((bm) => ({
    metric: bm.metricLabel.replace(/ \(.*\)/, '').replace('Revenue / ', 'Rev/'),
    you: bm.yourPercentile,
    network: 50,
  }))

  return (
    <motion.div variants={fadeUp} className="card-premium p-6">
      <h2 className="text-lg font-semibold text-foreground mb-1">Performance Shape</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Your percentile profile vs. network median across all metrics
      </p>
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name="Network (P50)"
              dataKey="network"
              stroke="rgba(255,255,255,0.2)"
              fill="rgba(255,255,255,0.04)"
              strokeDasharray="4 4"
            />
            <Radar
              name="Your Locations"
              dataKey="you"
              stroke="#818cf8"
              fill="rgba(129,140,248,0.15)"
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

function PercentileHistorySection() {
  const historyMetrics = HISTORY_METRICS
  const histories = percentileHistories.filter((h) => historyMetrics.includes(h.metric))

  // Merge into chart data: array of { date, metric1, metric2, ... }
  const dateMap = new Map<string, Record<string, number>>()
  histories.forEach((h) => {
    h.data.forEach((point) => {
      if (!dateMap.has(point.date)) dateMap.set(point.date, {})
      dateMap.get(point.date)![h.metric] = point.percentile
    })
  })

  const chartData = Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, values]) => {
      const d = new Date(date + '-01')
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        ...values,
      }
    })

  const metricLabels: Record<string, string> = {}
  networkBenchmarks.forEach((bm) => {
    metricLabels[bm.metric] = bm.metricLabel
  })

  return (
    <motion.div variants={fadeUp} className="card-premium p-6">
      <h2 className="text-lg font-semibold text-foreground mb-1">Percentile Trajectory</h2>
      <p className="text-xs text-muted-foreground mb-4">
        How your standing in the network has changed over the last 12 months
      </p>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              label={{
                value: 'Percentile',
                angle: -90,
                position: 'insideLeft',
                style: { fill: 'rgba(255,255,255,0.3)', fontSize: 11 },
              }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(10,10,20,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: any, name: any) => [
                `P${value}`,
                metricLabels[name] || name,
              ]) as any}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}
              formatter={(value: string) => metricLabels[value] || value}
            />
            {/* Reference line at P50 */}
            {historyMetrics.map((metric, i) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={HISTORY_COLORS[i]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: HISTORY_COLORS[i] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

function PeerComparisonTable() {
  // Simulate slight variations for region/size sub-segments
  function segmentAvg(bm: NetworkBenchmark, seed: number): number {
    const base = bm.networkAvg
    const variation = (Math.sin(seed * 127 + bm.yourPercentile) * 0.08)
    return +(base * (1 + variation)).toFixed(bm.unit === 'currency' ? 0 : 1)
  }

  return (
    <motion.div variants={fadeUp} className="card-premium p-6 overflow-x-auto">
      <h2 className="text-lg font-semibold text-foreground mb-1">Peer Comparison</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Your metrics vs. network segments — Northeast region, similar-size locations, and top performers
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-3 text-muted-foreground font-medium">Metric</th>
            <th className="text-right p-3 text-muted-foreground font-medium">You</th>
            <th className="text-right p-3 text-muted-foreground font-medium">Network Avg</th>
            <th className="text-right p-3 text-muted-foreground font-medium">Similar Size</th>
            <th className="text-right p-3 text-muted-foreground font-medium">Northeast</th>
            <th className="text-right p-3 text-muted-foreground font-medium">Top 10%</th>
          </tr>
        </thead>
        <tbody>
          {networkBenchmarks.map((bm, idx) => {
            const higherIsBetter = HIGHER_IS_BETTER_METRICS.has(bm.metric)
            const similarSizeAvg = segmentAvg(bm, idx * 2)
            const regionAvg = segmentAvg(bm, idx * 3 + 1)

            return (
              <tr key={bm.metric} className="border-b border-border/50 hover:bg-primary/[0.03] transition-colors">
                <td className="p-3 text-foreground font-medium">{bm.metricLabel}</td>
                <td className="p-3 text-right font-semibold text-foreground">
                  {formatValue(bm.yourValue, bm.unit)}
                </td>
                <td className={cn('p-3 text-right', cellColor(bm.yourValue, bm.networkAvg, higherIsBetter))}>
                  {formatValue(bm.networkAvg, bm.unit)}
                </td>
                <td className={cn('p-3 text-right', cellColor(bm.yourValue, similarSizeAvg, higherIsBetter))}>
                  {formatValue(similarSizeAvg, bm.unit)}
                </td>
                <td className={cn('p-3 text-right', cellColor(bm.yourValue, regionAvg, higherIsBetter))}>
                  {formatValue(regionAvg, bm.unit)}
                </td>
                <td className={cn('p-3 text-right', cellColor(bm.yourValue, bm.networkTop10, higherIsBetter))}>
                  {formatValue(bm.networkTop10, bm.unit)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </motion.div>
  )
}

function ImprovementOpportunities() {
  // Find 3 metrics furthest below P75
  const opportunities = [...networkBenchmarks]
    .map((bm) => {
      const higherIsBetter = HIGHER_IS_BETTER_METRICS.has(bm.metric)
      let gapToP75: number
      if (higherIsBetter) {
        gapToP75 = bm.networkP75 - bm.yourValue
      } else {
        gapToP75 = bm.yourValue - bm.networkP75
      }
      // Estimate revenue impact of reaching P75
      let revenueImpact: number
      if (bm.unit === 'currency') {
        revenueImpact = Math.max(0, gapToP75 * 5) // 5 locations
      } else if (bm.metric === 'utilization') {
        revenueImpact = Math.max(0, gapToP75 * 1800) // each % point = ~$1800/mo across locations
      } else if (bm.metric === 'no_show_rate') {
        revenueImpact = Math.max(0, gapToP75 * 2200) // each % point no-show reduction
      } else if (bm.metric === 'rebook_rate') {
        revenueImpact = Math.max(0, gapToP75 * 1500)
      } else if (bm.metric === 'package_adoption') {
        revenueImpact = Math.max(0, gapToP75 * 1200)
      } else if (bm.metric === 'client_retention_12mo') {
        revenueImpact = Math.max(0, gapToP75 * 2500)
      } else {
        revenueImpact = Math.max(0, gapToP75 * 500)
      }

      return { ...bm, gapToP75, revenueImpact, higherIsBetter }
    })
    .filter((o) => o.gapToP75 > 0)
    .sort((a, b) => b.revenueImpact - a.revenueImpact)
    .slice(0, 3)

  if (opportunities.length === 0) return null

  return (
    <motion.div variants={fadeUp} className="card-premium p-6">
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Improvement Opportunities</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Highest-impact metrics where reaching the 75th percentile unlocks the most revenue
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {opportunities.map((opp, i) => (
          <motion.div
            key={opp.metric}
            variants={fadeUp}
            className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                #{i + 1} Opportunity
              </span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', percentileBg(opp.yourPercentile), percentileColor(opp.yourPercentile))}>
                P{opp.yourPercentile} now
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{opp.metricLabel}</p>
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Your value</span>
                <span className="text-foreground">{formatValue(opp.yourValue, opp.unit)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">P75 target</span>
                <span className="text-primary">{formatValue(opp.networkP75, opp.unit)}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">
                  +${Math.round(opp.revenueImpact).toLocaleString()}/mo
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Estimated impact of reaching P75
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">
            Total addressable gap: ${opportunities.reduce((s, o) => s + o.revenueImpact, 0).toLocaleString()}/mo
          </span>{' '}
          — reaching P75 across these three metrics alone
        </p>
      </div>
    </motion.div>
  )
}

function NetworkGrowthTicker() {
  const [count, setCount] = useState(NETWORK_STATS.totalLocations)

  useEffect(() => {
    // Subtle animated counter that ticks occasionally
    const interval = setInterval(() => {
      setCount((prev) => prev) // keep stable — just a visual element
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      variants={fadeUp}
      className="card-premium p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-xs text-muted-foreground">
          Network grows by ~<span className="text-foreground font-medium">{NETWORK_STATS.growthPerMonth} locations/month</span>. More data = better benchmarks.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Network className="w-4 h-4 text-primary/60" />
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-foreground"
        >
          {count} locations
        </motion.span>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function NetworkBenchmarks() {
  // useLocationStore available for per-location filtering
  useLocationStore()

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link
          to="/intelligence"
          className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">
              Etienne Intelligence Network
            </h1>
          </div>
          <p className="text-muted-foreground mt-0.5">
            Anonymous benchmarks from {NETWORK_STATS.totalLocations}+ med spa locations nationwide
          </p>
        </div>
      </motion.div>

      {/* Network Stats Banner */}
      <NetworkStatsBanner />

      {/* Percentile Overview Cards */}
      <motion.div variants={stagger}>
        <motion.h2 variants={fadeUp} className="text-lg font-semibold text-foreground mb-3">
          Your Percentile Rankings
        </motion.h2>
        <motion.div
          variants={stagger}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {networkBenchmarks.map((bm) => (
            <PercentileCard key={bm.metric} benchmark={bm} />
          ))}
        </motion.div>
      </motion.div>

      {/* Radar Chart + Percentile History side by side on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RadarSection />
        <PercentileHistorySection />
      </div>

      {/* Peer Comparison Table */}
      <PeerComparisonTable />

      {/* Improvement Opportunities */}
      <ImprovementOpportunities />

      {/* Network Growth Ticker */}
      <NetworkGrowthTicker />
    </motion.div>
  )
}
