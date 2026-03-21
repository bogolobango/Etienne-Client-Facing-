import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useLocationStore } from '@/stores/useLocationStore'
import { useEIPData } from '@/contexts/EIPDataContext'
import { INDUSTRY_BENCHMARKS } from '@/data/benchmarks'
import { computeLeakage } from '@/lib/analytics/leakage-model'
import {
  getProvidersByLocation,
  getAggregatedProviderMetrics,
} from '@/data/providers'
import type { Provider } from '@/data/providers'
import { cn, formatCurrency } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SortKey = 'name' | 'location' | 'revenue' | 'revPerHour' | 'utilization' | 'rebook' | 'noShow'

interface ProviderRow {
  provider: Provider
  locationName: string
  revenue: number
  revPerHour: number
  utilization: number
  rebook: number
  noShowRate: number
  appointments: number
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
const TABS = [
  { id: 'locations', label: 'Locations' },
  { id: 'providers', label: 'Providers' },
  { id: 'leakage', label: 'Revenue Leakage' },
] as const

type TabId = typeof TABS[number]['id']

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Performance() {
  const { dailyMetrics, locations, appointments, clients, services } = useEIPData()
  const { selectedLocation } = useLocationStore()
  const [activeTab, setActiveTab] = useState<TabId>('locations')
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [sortAsc, setSortAsc] = useState(false)

  // ---------------------------------------------------------------------------
  // Location data
  // ---------------------------------------------------------------------------
  const locationScores = useMemo(() => {
    return locations.map((loc) => {
      const locMetrics = dailyMetrics.filter((m) => {
        const d = new Date(m.date)
        const now = new Date()
        return m.locationId === loc.id && (now.getTime() - d.getTime()) / 86400000 <= 30
      })
      const revenue = locMetrics.reduce((s, m) => s + m.revenue, 0)
      const utilization = locMetrics.length
        ? locMetrics.reduce((s, m) => s + m.utilizationRate, 0) / locMetrics.length
        : 0
      const noShowRate = locMetrics.length
        ? locMetrics.reduce((s, m) => s + m.noShowRate, 0) / locMetrics.length
        : 0
      const rebookRate = locMetrics.length
        ? locMetrics.reduce((s, m) => s + m.rebookingRate, 0) / locMetrics.length
        : 0
      const recovered = locMetrics.reduce((s, m) => s + m.revenueRecovered, 0)
      const newClients = locMetrics.reduce((s, m) => s + m.newClients, 0)

      return {
        id: loc.id,
        name: loc.name,
        city: loc.city,
        revenue,
        utilization,
        noShowRate,
        rebookRate,
        recovered,
        newClients,
      }
    })
  }, [locations, dailyMetrics])

  const networkAvg = useMemo(() => {
    if (!locationScores.length) return { revenue: 0, utilization: 0, noShowRate: 0, rebookRate: 0 }
    return {
      revenue: locationScores.reduce((s, l) => s + l.revenue, 0) / locationScores.length,
      utilization: locationScores.reduce((s, l) => s + l.utilization, 0) / locationScores.length,
      noShowRate: locationScores.reduce((s, l) => s + l.noShowRate, 0) / locationScores.length,
      rebookRate: locationScores.reduce((s, l) => s + l.rebookRate, 0) / locationScores.length,
    }
  }, [locationScores])

  // Chart data for location comparison
  const locationChartData = useMemo(() => {
    return locationScores.map((l) => ({
      name: l.name,
      revenue: l.revenue,
      recovered: l.recovered,
    }))
  }, [locationScores])

  // ---------------------------------------------------------------------------
  // Provider data
  // ---------------------------------------------------------------------------
  const providerRows: ProviderRow[] = useMemo(() => {
    const filtered = getProvidersByLocation(selectedLocation as string)
    return filtered.map((p) => {
      const agg = getAggregatedProviderMetrics(p.id)
      return {
        provider: p,
        locationName: locations.find((l) => l.id === p.locationId)?.name ?? p.locationId,
        revenue: agg.totalRevenue,
        revPerHour: agg.avgRevenuePerHour,
        utilization: agg.avgUtilization,
        rebook: agg.avgRebookingRate,
        noShowRate: agg.noShowRate,
        appointments: agg.totalAppointments,
      }
    })
  }, [selectedLocation, locations])

  const sortedProviders = useMemo(() => {
    const copy = [...providerRows]
    const dir = sortAsc ? 1 : -1
    copy.sort((a, b) => {
      switch (sortKey) {
        case 'name': return dir * a.provider.name.localeCompare(b.provider.name)
        case 'location': return dir * a.locationName.localeCompare(b.locationName)
        case 'revenue': return dir * (a.revenue - b.revenue)
        case 'revPerHour': return dir * (a.revPerHour - b.revPerHour)
        case 'utilization': return dir * (a.utilization - b.utilization)
        case 'rebook': return dir * (a.rebook - b.rebook)
        case 'noShow': return dir * (a.noShowRate - b.noShowRate)
        default: return 0
      }
    })
    return copy
  }, [providerRows, sortKey, sortAsc])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  const renderSortHeader = (label: string, field: SortKey, align: 'left' | 'right' = 'right') => (
    <th
      key={field}
      onClick={() => handleSort(field)}
      className={cn(
        'text-xs text-muted-foreground font-medium pb-3 px-3 cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap',
        align === 'left' ? 'text-left' : 'text-right'
      )}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn('w-3 h-3', sortKey === field ? 'text-primary' : 'text-muted-foreground/40')} />
      </span>
    </th>
  )

  // ---------------------------------------------------------------------------
  // Revenue leakage data
  // ---------------------------------------------------------------------------
  const leakageData = useMemo(() => {
    const leakage = computeLeakage(appointments, clients, dailyMetrics, locations, services, selectedLocation)

    const colors = [
      'bg-destructive/60', 'bg-destructive/40', 'bg-warning/50',
      'bg-warning/30', 'bg-orange-500/40', 'bg-amber-500/30',
    ]

    const filtered = dailyMetrics.filter((m) => {
      const d = new Date(m.date)
      const now = new Date()
      return (now.getTime() - d.getTime()) / 86400000 <= 30 &&
        (selectedLocation === 'all' || m.locationId === selectedLocation)
    })
    const totalRecovered = filtered.reduce((s, m) => s + m.revenueRecovered, 0)

    return {
      items: [
        { label: 'Total Capacity Revenue', value: leakage.theoreticalRevenue, isTotal: true, color: 'bg-primary/20', computation: '' },
        ...leakage.categories.map((cat, i) => ({
          label: cat.name,
          value: -cat.amount,
          isTotal: false,
          color: colors[i % colors.length],
          computation: cat.computation,
        })),
        { label: 'Actual Revenue', value: leakage.actualRevenue, isTotal: true, color: 'bg-primary', computation: '' },
      ],
      maxVal: leakage.theoreticalRevenue,
      totalRecovered,
    }
  }, [appointments, clients, dailyMetrics, locations, services, selectedLocation])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Performance</h1>
        <p className="text-muted-foreground mt-1">
          Cross-location benchmarking and provider analytics
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-lg bg-secondary border border-border w-fit overflow-x-auto max-w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-primary/20 text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <>
          {/* Location Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-4 sm:p-6"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue by Location</h3>
            <div className="h-[220px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationChartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number = 0) => [formatCurrency(value)]}
                  />
                  <Bar dataKey="revenue" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name="Revenue" animationDuration={1200} />
                  <Bar dataKey="recovered" fill="var(--chart-4)" radius={[4, 4, 0, 0]} name="Recovered" animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Location Scorecard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium p-4 sm:p-6"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Location Scorecard</h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">Location</th>
                    <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Revenue</th>
                    <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">vs Avg</th>
                    <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Util.</th>
                    <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">No-Show</th>
                    <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Rebook</th>
                    <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Recovered</th>
                    <th className="text-right text-xs text-muted-foreground font-medium pb-3 pl-4">New</th>
                  </tr>
                </thead>
                <tbody>
                  {locationScores.map((loc) => {
                    const revDiff = networkAvg.revenue > 0
                      ? ((loc.revenue - networkAvg.revenue) / networkAvg.revenue) * 100
                      : 0
                    const isAbove = revDiff >= 0

                    return (
                      <tr key={loc.id} className="border-b border-border last:border-b-0 hover:bg-primary/[0.06] transition-colors">
                        <td className="py-3 pr-4">
                          <p className="text-sm font-medium text-foreground">{loc.name}</p>
                          <p className="text-xs text-muted-foreground">{loc.city}</p>
                        </td>
                        <td className="text-right py-3 px-4 font-mono text-sm text-foreground">{formatCurrency(loc.revenue)}</td>
                        <td className="text-right py-3 px-4">
                          <div className={cn('flex items-center justify-end gap-1 text-sm font-mono', isAbove ? 'text-primary' : 'text-destructive')}>
                            {isAbove ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{isAbove ? '+' : ''}{revDiff.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className={cn(
                          'text-right py-3 px-4 font-mono text-sm',
                          loc.utilization >= INDUSTRY_BENCHMARKS.utilizationRate.avg ? 'text-primary' : 'text-foreground'
                        )}>
                          {loc.utilization.toFixed(1)}%
                        </td>
                        <td className={cn(
                          'text-right py-3 px-4 font-mono text-sm',
                          loc.noShowRate > INDUSTRY_BENCHMARKS.noShowRate.avg ? 'text-destructive' : 'text-foreground'
                        )}>
                          {loc.noShowRate.toFixed(1)}%
                        </td>
                        <td className="text-right py-3 px-4 font-mono text-sm text-foreground">{loc.rebookRate.toFixed(1)}%</td>
                        <td className="text-right py-3 px-4 font-mono text-sm text-primary">{formatCurrency(loc.recovered)}</td>
                        <td className="text-right py-3 pl-4 font-mono text-sm text-foreground">{loc.newClients}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              Industry benchmarks: Utilization {INDUSTRY_BENCHMARKS.utilizationRate.avg}% avg / {INDUSTRY_BENCHMARKS.utilizationRate.topPerformer}% top · No-Show {INDUSTRY_BENCHMARKS.noShowRate.avg}% avg / {INDUSTRY_BENCHMARKS.noShowRate.topPerformer}% top · Rebook {INDUSTRY_BENCHMARKS.rebookingRate.avg}% avg
            </p>
          </motion.div>
        </>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-4 sm:p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Provider Performance</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-border">
                  {renderSortHeader('Provider', 'name', 'left')}
                  {renderSortHeader('Location', 'location', 'left')}
                  {renderSortHeader('Revenue', 'revenue')}
                  {renderSortHeader('Rev/Hr', 'revPerHour')}
                  {renderSortHeader('Util.', 'utilization')}
                  {renderSortHeader('Rebook', 'rebook')}
                  {renderSortHeader('No-Show', 'noShow')}
                </tr>
              </thead>
              <tbody>
                {sortedProviders.map((row) => (
                  <tr key={row.provider.id} className="border-b border-border last:border-b-0 hover:bg-primary/[0.06] transition-colors">
                    <td className="py-3 pr-3">
                      <p className="text-sm font-medium text-foreground">{row.provider.name}</p>
                      <p className="text-xs text-muted-foreground">{row.provider.title}</p>
                    </td>
                    <td className="py-3 px-3 text-sm text-foreground">{row.locationName}</td>
                    <td className="text-right py-3 px-3 font-mono text-sm text-foreground">{formatCurrency(row.revenue)}</td>
                    <td className="text-right py-3 px-3 font-mono text-sm text-foreground">${row.revPerHour}</td>
                    <td className="text-right py-3 px-3 font-mono text-sm text-foreground">{row.utilization.toFixed(1)}%</td>
                    <td className="text-right py-3 px-3 font-mono text-sm text-foreground">{row.rebook.toFixed(1)}%</td>
                    <td className="text-right py-3 px-3 font-mono text-sm text-foreground">{row.noShowRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Revenue Leakage Tab */}
      {activeTab === 'leakage' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-4 sm:p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Revenue Leakage Analysis</h3>
          <p className="text-xs text-muted-foreground mb-5">Where revenue is being lost vs. theoretical capacity — computed from actual appointment data</p>
          <div className="space-y-2.5">
            {leakageData.items.map((item) => (
              <div key={item.label} className="group">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-28 sm:w-40 shrink-0 text-right">
                    <p className={cn('text-xs', item.isTotal ? 'font-medium text-foreground' : 'text-muted-foreground')}>{item.label}</p>
                  </div>
                  <div className="flex-1 h-7 bg-primary/[0.06] rounded overflow-hidden relative">
                    <div
                      className={cn('h-full rounded transition-all', item.color)}
                      style={{ width: `${leakageData.maxVal > 0 ? (Math.abs(item.value) / leakageData.maxVal) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-20 sm:w-24 shrink-0 text-right">
                    <span className={cn('text-sm font-mono', item.isTotal ? 'text-foreground font-semibold' : 'text-destructive')}>
                      {item.value < 0 ? '-' : ''}{formatCurrency(Math.abs(item.value))}
                    </span>
                  </div>
                </div>
                {item.computation && (
                  <p className="ml-[calc(10rem+0.75rem)] text-[10px] text-muted-foreground/70 mt-0.5 italic">{item.computation}</p>
                )}
              </div>
            ))}
            <p className="text-xs text-primary mt-4 pt-3 border-t border-border">
              EIP has recovered <strong className="font-mono">{formatCurrency(leakageData.totalRecovered)}</strong> of the leakage gap this month.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
