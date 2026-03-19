import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import {
  Building2,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Crown,
  MapPin,
  Layers,
} from 'lucide-react'
import { useBrandStore } from '@/stores/useBrandStore'
import type { Brand } from '@/stores/useBrandStore'
import { dailyMetrics, locations } from '@/data/seed'
import { cn, formatCurrency } from '@/lib/utils'
import type { DailyMetrics } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLast30DaysMetrics(locationIds: string[]): DailyMetrics[] {
  const now = new Date()
  return dailyMetrics.filter((m) => {
    if (!locationIds.includes(m.locationId)) return false
    const d = new Date(m.date)
    return (now.getTime() - d.getTime()) / 86400000 <= 30
  })
}

function avgField(arr: DailyMetrics[], key: keyof DailyMetrics): number {
  if (!arr.length) return 0
  return arr.reduce((s, m) => s + (m[key] as number), 0) / arr.length
}

interface BrandMetrics {
  brand: Brand
  revenue: number
  utilization: number
  rebookRate: number
  noShowRate: number
  locationCount: number
  newClients: number
  bookings: number
}

function computeBrandMetrics(brand: Brand): BrandMetrics {
  const metrics = getLast30DaysMetrics(brand.locationIds)
  return {
    brand,
    revenue: metrics.reduce((s, m) => s + m.revenue, 0),
    utilization: avgField(metrics, 'utilizationRate'),
    rebookRate: avgField(metrics, 'rebookingRate'),
    noShowRate: avgField(metrics, 'noShowRate'),
    locationCount: brand.locationIds.length,
    newClients: metrics.reduce((s, m) => s + m.newClients, 0),
    bookings: metrics.reduce((s, m) => s + m.bookings, 0),
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BrandSelector({
  brands,
  selected,
  onSelect,
}: {
  brands: Brand[]
  selected: 'all' | string
  onSelect: (id: 'all' | string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2"
    >
      <button
        onClick={() => onSelect('all')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-all border',
          selected === 'all'
            ? 'bg-primary/20 border-primary/40 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/20 hover:text-foreground'
        )}
      >
        All Brands
      </button>
      {brands.map((b) => (
        <button
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-2',
            selected === b.id
              ? 'border-primary/40 text-foreground'
              : 'border-border text-muted-foreground hover:border-primary/20 hover:text-foreground'
          )}
          style={
            selected === b.id
              ? { backgroundColor: `${b.color}20`, borderColor: `${b.color}60` }
              : undefined
          }
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: b.color }}
          />
          {b.name}
        </button>
      ))}
    </motion.div>
  )
}

function BrandKPICards({
  allMetrics,
  onSelectBrand,
}: {
  allMetrics: BrandMetrics[]
  onSelectBrand: (id: string) => void
}) {
  const companyAvgRevenue =
    allMetrics.reduce((s, m) => s + m.revenue, 0) / allMetrics.length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {allMetrics.map((bm, i) => {
        const revDiff =
          companyAvgRevenue > 0
            ? ((bm.revenue - companyAvgRevenue) / companyAvgRevenue) * 100
            : 0
        const isAbove = revDiff >= 0

        return (
          <motion.div
            key={bm.brand.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelectBrand(bm.brand.id)}
            className="card-premium p-5 cursor-pointer hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: bm.brand.color }}
                />
                <h3 className="text-sm font-medium text-foreground">
                  {bm.brand.name}
                </h3>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <p className="text-2xl font-mono font-semibold text-foreground mb-1">
              {formatCurrency(bm.revenue)}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              30-day revenue
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Locations</p>
                <p className="text-foreground font-medium">{bm.locationCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Utilization</p>
                <p className="text-foreground font-medium">
                  {bm.utilization.toFixed(1)}%
                </p>
              </div>
            </div>

            <div
              className={cn(
                'flex items-center gap-1 mt-3 text-xs',
                isAbove ? 'text-primary' : 'text-destructive'
              )}
            >
              {isAbove ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span className="font-medium">
                {isAbove ? '+' : ''}
                {revDiff.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs brand avg</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function CrossBrandChart({ allMetrics }: { allMetrics: BrandMetrics[] }) {
  const chartData = [
    {
      metric: 'Revenue ($K)',
      ...Object.fromEntries(
        allMetrics.map((bm) => [bm.brand.name, +(bm.revenue / 1000).toFixed(1)])
      ),
    },
    {
      metric: 'Utilization %',
      ...Object.fromEntries(
        allMetrics.map((bm) => [bm.brand.name, +bm.utilization.toFixed(1)])
      ),
    },
    {
      metric: 'Rebook %',
      ...Object.fromEntries(
        allMetrics.map((bm) => [bm.brand.name, +bm.rebookRate.toFixed(1)])
      ),
    },
    {
      metric: 'No-Show %',
      ...Object.fromEntries(
        allMetrics.map((bm) => [bm.brand.name, +bm.noShowRate.toFixed(1)])
      ),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card-premium p-6"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        Cross-Brand Comparison
      </h3>
      <p className="text-xs text-muted-foreground mb-5">
        Revenue, Utilization, Rebook Rate, No-Show Rate across all brands
      </p>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <XAxis
              dataKey="metric"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--foreground)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }}
            />
            {allMetrics.map((bm) => (
              <Bar
                key={bm.brand.id}
                dataKey={bm.brand.name}
                fill={bm.brand.color}
                radius={[4, 4, 0, 0]}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

function BrandDrillDown({
  brand,
  allMetrics,
}: {
  brand: Brand
  allMetrics: BrandMetrics[]
}) {
  const companyMetrics = useMemo(() => {
    const all = getLast30DaysMetrics(
      locations.map((l) => l.id)
    )
    return {
      revenue: all.reduce((s, m) => s + m.revenue, 0) / locations.length,
      utilization: avgField(all, 'utilizationRate'),
      rebookRate: avgField(all, 'rebookingRate'),
      noShowRate: avgField(all, 'noShowRate'),
    }
  }, [])

  const brandMetrics = allMetrics.find((bm) => bm.brand.id === brand.id)!

  const locationRows = brand.locationIds.map((locId) => {
    const loc = locations.find((l) => l.id === locId)!
    const metrics = getLast30DaysMetrics([locId])
    const locRevenue = metrics.reduce((s, m) => s + m.revenue, 0)
    const locUtil = avgField(metrics, 'utilizationRate')
    const locRebook = avgField(metrics, 'rebookingRate')
    const locNoShow = avgField(metrics, 'noShowRate')

    // Company-wide average for same location across all brands
    const companyLocMetrics = getLast30DaysMetrics([locId])
    const companyLocRevenue = companyLocMetrics.reduce((s, m) => s + m.revenue, 0)

    return {
      id: locId,
      name: loc.name,
      city: loc.city,
      revenue: locRevenue,
      utilization: locUtil,
      rebookRate: locRebook,
      noShowRate: locNoShow,
      companyLocRevenue,
      revenueDiff:
        companyLocRevenue > 0
          ? ((locRevenue - companyLocRevenue) / companyLocRevenue) * 100
          : 0,
    }
  })

  const kpis = [
    {
      label: 'Brand Revenue',
      value: formatCurrency(brandMetrics.revenue),
      diff:
        companyMetrics.revenue > 0
          ? ((brandMetrics.revenue / brand.locationIds.length - companyMetrics.revenue) /
              companyMetrics.revenue) *
            100
          : 0,
      compLabel: 'vs company avg/location',
    },
    {
      label: 'Utilization',
      value: `${brandMetrics.utilization.toFixed(1)}%`,
      diff: brandMetrics.utilization - companyMetrics.utilization,
      compLabel: 'vs company avg',
    },
    {
      label: 'Rebook Rate',
      value: `${brandMetrics.rebookRate.toFixed(1)}%`,
      diff: brandMetrics.rebookRate - companyMetrics.rebookRate,
      compLabel: 'vs company avg',
    },
    {
      label: 'No-Show Rate',
      value: `${brandMetrics.noShowRate.toFixed(1)}%`,
      diff: -(brandMetrics.noShowRate - companyMetrics.noShowRate),
      compLabel: 'vs company avg',
      invertColor: true,
    },
  ]

  return (
    <div className="space-y-5">
      {/* Brand aggregate KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const isPositive = kpi.diff >= 0
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-4 rounded-lg border border-border bg-primary/[0.06]"
            >
              <p className="text-xs text-muted-foreground mb-2">{kpi.label}</p>
              <p className="text-xl font-mono font-semibold text-foreground">
                {kpi.value}
              </p>
              <div
                className={cn(
                  'flex items-center gap-1 mt-2 text-xs',
                  isPositive ? 'text-primary' : 'text-destructive'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="font-medium">
                  {isPositive ? '+' : ''}
                  {kpi.diff.toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-0.5">
                  {kpi.compLabel}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Location comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-premium p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Location Comparison within {brand.name}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">
                  Location
                </th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">
                  Revenue
                </th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">
                  Utilization
                </th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">
                  Rebook %
                </th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 pl-4">
                  No-Show %
                </th>
              </tr>
            </thead>
            <tbody>
              {locationRows.map((loc) => (
                <tr
                  key={loc.id}
                  className="border-b border-border last:border-b-0 hover:bg-primary/[0.06] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-foreground">
                      {loc.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{loc.city}</p>
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">
                    {formatCurrency(loc.revenue)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">
                    {loc.utilization.toFixed(1)}%
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">
                    {loc.rebookRate.toFixed(1)}%
                  </td>
                  <td className="text-right py-3 pl-4 font-mono text-sm text-foreground">
                    {loc.noShowRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

function BrandRankingsTable({ allMetrics }: { allMetrics: BrandMetrics[] }) {
  // Build 7-day sparkline data per brand
  const sparklines = useMemo(() => {
    const now = new Date()
    const result: Record<string, number[]> = {}
    for (const bm of allMetrics) {
      const points: number[] = []
      for (let d = 6; d >= 0; d--) {
        const dayRevenue = dailyMetrics
          .filter((m) => {
            if (!bm.brand.locationIds.includes(m.locationId)) return false
            const diff = (now.getTime() - new Date(m.date).getTime()) / 86400000
            return Math.floor(diff) === d
          })
          .reduce((s, m) => s + m.revenue, 0)
        points.push(dayRevenue)
      }
      result[bm.brand.id] = points
    }
    return result
  }, [allMetrics])

  const ranked = [...allMetrics].sort((a, b) => b.revenue - a.revenue)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="card-premium p-6"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Brand Rankings
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">
                Rank
              </th>
              <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">
                Brand
              </th>
              <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">
                Revenue
              </th>
              <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">
                Utilization
              </th>
              <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">
                Rebook %
              </th>
              <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">
                No-Show %
              </th>
              <th className="text-right text-xs text-muted-foreground font-medium pb-3 pl-4">
                7-Day Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((bm, i) => {
              const sparkData = (sparklines[bm.brand.id] || []).map(
                (v, idx) => ({ day: idx, value: v })
              )
              return (
                <tr
                  key={bm.brand.id}
                  className="border-b border-border last:border-b-0 hover:bg-primary/[0.06] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      {i === 0 && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-sm font-mono text-muted-foreground">
                        #{i + 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: bm.brand.color }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {bm.brand.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">
                    {formatCurrency(bm.revenue)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">
                    {bm.utilization.toFixed(1)}%
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">
                    {bm.rebookRate.toFixed(1)}%
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">
                    {bm.noShowRate.toFixed(1)}%
                  </td>
                  <td className="py-3 pl-4">
                    <div className="w-24 h-8 ml-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={bm.brand.color}
                            strokeWidth={1.5}
                            dot={false}
                            animationDuration={800}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function RollUpSummary({ allMetrics }: { allMetrics: BrandMetrics[] }) {
  const companyRevenue = allMetrics.reduce((s, bm) => s + bm.revenue, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-premium p-6"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        Roll-Up Hierarchy
      </h3>
      <p className="text-xs text-muted-foreground mb-5">
        Company &rarr; Brand &rarr; Location data aggregation
      </p>

      {/* Company level */}
      <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Company Total
          </span>
        </div>
        <p className="text-2xl font-mono font-semibold text-foreground">
          {formatCurrency(companyRevenue)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {allMetrics.length} brands &middot;{' '}
          {locations.length} locations
        </p>
      </div>

      {/* Brand level */}
      <div className="space-y-3 ml-6 border-l-2 border-border pl-5">
        {allMetrics.map((bm) => (
          <div key={bm.brand.id}>
            <div className="p-3 rounded-lg border border-border bg-primary/[0.04]">
              <div className="flex items-center gap-2 mb-1.5">
                <Building2
                  className="w-3.5 h-3.5"
                  style={{ color: bm.brand.color }}
                />
                <span className="text-sm font-medium text-foreground">
                  {bm.brand.name}
                </span>
                <span className="text-xs text-muted-foreground ml-auto font-mono">
                  {formatCurrency(bm.revenue)}
                </span>
              </div>

              {/* Location level */}
              <div className="space-y-1 ml-5 mt-2 border-l border-border/50 pl-3">
                {bm.brand.locationIds.map((locId) => {
                  const loc = locations.find((l) => l.id === locId)!
                  const locMetrics = getLast30DaysMetrics([locId])
                  const locRevenue = locMetrics.reduce(
                    (s, m) => s + m.revenue,
                    0
                  )
                  return (
                    <div
                      key={locId}
                      className="flex items-center gap-2 py-1"
                    >
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {loc.name}
                      </span>
                      <span className="text-xs font-mono text-foreground ml-auto">
                        {formatCurrency(locRevenue)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function BrandOverview() {
  const { brands, selectedBrand, setBrand } = useBrandStore()

  const allMetrics = useMemo(
    () => brands.map(computeBrandMetrics),
    [brands]
  )

  const activeBrand = brands.find((b) => b.id === selectedBrand)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-semibold text-foreground">
          Multi-Brand Intelligence
        </h1>
        <p className="text-muted-foreground mt-0.5">
          Cross-brand visibility, benchmarking, and drill-down analytics
        </p>
      </motion.div>

      {/* Brand Selector */}
      <BrandSelector
        brands={brands}
        selected={selectedBrand}
        onSelect={setBrand}
      />

      {selectedBrand === 'all' ? (
        <>
          {/* All-brands view */}
          <BrandKPICards allMetrics={allMetrics} onSelectBrand={setBrand} />
          <CrossBrandChart allMetrics={allMetrics} />
          <BrandRankingsTable allMetrics={allMetrics} />
          <RollUpSummary allMetrics={allMetrics} />
        </>
      ) : activeBrand ? (
        <>
          {/* Single brand drill-down */}
          <BrandDrillDown brand={activeBrand} allMetrics={allMetrics} />
          <BrandRankingsTable allMetrics={allMetrics} />
          <RollUpSummary allMetrics={allMetrics} />
        </>
      ) : null}
    </div>
  )
}
