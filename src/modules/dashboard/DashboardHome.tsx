import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { MetricCard } from '@/components/MetricCard'
import { MetricSkeleton } from '@/components/MetricSkeleton'
import { useLocationStore } from '@/stores/useLocationStore'
import { INDUSTRY_BENCHMARKS } from '@/data/benchmarks'
import { useEIPData } from '@/contexts/EIPDataContext'
import { cn, formatCurrency } from '@/lib/utils'
import type { DailyMetrics } from '@/types'

function getFilteredMetrics(locationId: string, dailyMetrics: DailyMetrics[]) {
  const filtered = locationId === 'all'
    ? dailyMetrics
    : dailyMetrics.filter((m) => m.locationId === locationId)

  const last30 = filtered.filter((m) => {
    const d = new Date(m.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) / 86400000 <= 30
  })

  const prev30 = filtered.filter((m) => {
    const d = new Date(m.date)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / 86400000
    return diff > 30 && diff <= 60
  })

  const sum = (arr: typeof last30, key: keyof typeof last30[0]) =>
    arr.reduce((s, m) => s + (m[key] as number), 0)
  const avg = (arr: typeof last30, key: keyof typeof last30[0]) =>
    arr.length ? sum(arr, key) / arr.length : 0

  const currentRevenue = sum(last30, 'revenue')
  const prevRevenue = sum(prev30, 'revenue')
  const revenueTrend = prevRevenue ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0

  const currentNoShow = avg(last30, 'noShowRate')
  const prevNoShow = avg(prev30, 'noShowRate')
  const noShowTrend = prevNoShow ? ((currentNoShow - prevNoShow) / prevNoShow) * 100 : 0

  const currentUtil = avg(last30, 'utilizationRate')
  const prevUtil = avg(prev30, 'utilizationRate')
  const utilTrend = prevUtil ? ((currentUtil - prevUtil) / prevUtil) * 100 : 0

  // Revenue per provider hour (revenue / providers / work hours)
  const revPerProviderHour = last30.length
    ? currentRevenue / (last30.length > 0 ? 30 * 8 : 1)
    : 0

  return {
    revenue: Math.round(currentRevenue),
    revenueTrend,
    noShowRate: currentNoShow,
    noShowTrend,
    utilization: currentUtil,
    utilTrend,
    revPerProviderHour: Math.round(revPerProviderHour),
    totalBookings: sum(last30, 'bookings'),
    newClients: sum(last30, 'newClients'),
    revenueRecovered: sum(last30, 'revenueRecovered'),
  }
}

function getRevenueChartData(locationId: string, dailyMetrics: DailyMetrics[]) {
  const filtered = locationId === 'all'
    ? dailyMetrics
    : dailyMetrics.filter((m) => m.locationId === locationId)

  const byDate = new Map<string, number>()
  filtered.forEach((m) => {
    byDate.set(m.date, (byDate.get(m.date) || 0) + m.revenue)
  })

  return Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
    }))
}

export function DashboardHome() {
  const { locations, dailyMetrics, alerts } = useEIPData()
  const { selectedLocation } = useLocationStore()
  const [loading, setLoading] = useState(true)
  const metrics = getFilteredMetrics(selectedLocation, dailyMetrics)
  const chartData = getRevenueChartData(selectedLocation, dailyMetrics)
  const activeAlerts = alerts.filter((a) => !a.dismissed).slice(0, 3)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: simulate loading transition on location change
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [selectedLocation])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Executive Overview</h1>
        <p className="text-muted-foreground mt-1">
          {selectedLocation === 'all' ? 'All Centers' : locations.find(l => l.id === selectedLocation)?.name} — Last 30 Days
        </p>
      </div>

      {/* Hero Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <MetricCard
            label="Total Revenue"
            value={metrics.revenue}
            format="currency"
            trend={metrics.revenueTrend}
            trendLabel="vs prev period"
            delay={0}
            dataSource="Zenoti"
          />
          <MetricCard
            label="Utilization Rate"
            value={metrics.utilization}
            format="percent"
            trend={metrics.utilTrend}
            trendLabel="vs prev period"
            delay={1}
            benchmarkLabel={`Industry avg: ${INDUSTRY_BENCHMARKS.utilizationRate.avg}% · Top: ${INDUSTRY_BENCHMARKS.utilizationRate.topPerformer}%`}
            dataSource="Zenoti"
          />
          <MetricCard
            label="No-Show Rate"
            value={metrics.noShowRate}
            format="percent"
            trend={metrics.noShowTrend}
            trendLabel="vs prev period"
            delay={2}
            benchmarkLabel={`Industry avg: ${INDUSTRY_BENCHMARKS.noShowRate.avg}% · Top: ${INDUSTRY_BENCHMARKS.noShowRate.topPerformer}%`}
            dataSource="Zenoti"
          />
          <MetricCard
            label="Revenue Recovered"
            value={metrics.revenueRecovered}
            format="currency"
            trend={42.5}
            trendLabel="identified by EIP"
            delay={3}
            dataSource="Zenoti"
          />
        </div>
      )}

      {/* Revenue Chart + Top Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card-premium p-4 sm:p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue Trend (30 days)</h3>
          <div className="h-[200px] sm:h-[240px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--foreground)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number = 0) => [formatCurrency(value), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-4 sm:p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Opportunities</h3>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border transition-all duration-200',
                  alert.type === 'critical'
                    ? 'border-destructive/20 bg-destructive/5'
                    : alert.type === 'warning'
                    ? 'border-warning/20 bg-warning/5'
                    : 'border-primary/20 bg-primary/5'
                )}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={cn(
                      'w-4 h-4 mt-0.5 shrink-0',
                      alert.type === 'critical'
                        ? 'text-destructive'
                        : alert.type === 'warning'
                        ? 'text-warning'
                        : 'text-primary'
                    )}
                  />
                  <div>
                    <p className="text-sm text-foreground leading-snug">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Impact: {formatCurrency(alert.impact)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Location Comparison Table */}
      {selectedLocation === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card-premium p-4 sm:p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Cross-Location Comparison</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">Location</th>
                  <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Revenue</th>
                  <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Utilization</th>
                  <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">No-Show %</th>
                  <th className="text-right text-xs text-muted-foreground font-medium pb-3 pl-4">New Clients</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => {
                  const locMetrics = getFilteredMetrics(loc.id, dailyMetrics)
                  const networkAvgRevenue = metrics.revenue / locations.length
                  const revDiff = networkAvgRevenue > 0
                    ? ((locMetrics.revenue - networkAvgRevenue) / networkAvgRevenue) * 100
                    : 0
                  const isAbove = revDiff >= 0

                  return (
                    <tr key={loc.id} className="border-b border-border last:border-b-0 hover:bg-primary/[0.06] transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium text-foreground">{loc.name}</p>
                        <p className="text-xs text-muted-foreground">{loc.city}, {loc.state}</p>
                      </td>
                      <td className="text-right py-3 px-4">
                        <p className="font-mono text-sm text-foreground">{formatCurrency(locMetrics.revenue)}</p>
                        <div className={cn('flex items-center justify-end gap-1 text-xs', isAbove ? 'text-primary' : 'text-destructive')}>
                          {isAbove ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{isAbove ? '+' : ''}{revDiff.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-sm text-foreground">{locMetrics.utilization.toFixed(1)}%</td>
                      <td className="text-right py-3 px-4 font-mono text-sm text-foreground">{locMetrics.noShowRate.toFixed(1)}%</td>
                      <td className="text-right py-3 pl-4 font-mono text-sm text-foreground">{locMetrics.newClients}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
