import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useLocationStore } from '@/stores/useLocationStore'
import { dailyMetrics, locations } from '@/data/seed'
import { cn, formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function RevenueScorecard() {
  const { selectedLocation } = useLocationStore()

  const all = dailyMetrics.filter(
    (m) => selectedLocation === 'all' || m.locationId === selectedLocation
  )

  // Split into before/after EIP periods
  const sorted = [...all].sort((a, b) => a.date.localeCompare(b.date))
  const total = sorted.length
  const beforePeriod = sorted.slice(0, Math.floor(total / 3))
  const afterPeriod = sorted.slice(Math.floor(total * 2 / 3))

  const sumRevenue = (arr: typeof all) => arr.reduce((s, m) => s + m.revenue, 0)
  const avgField = (arr: typeof all, key: keyof typeof all[0]) =>
    arr.length ? arr.reduce((s, m) => s + (m[key] as number), 0) / arr.length : 0

  const beforeRevenue = sumRevenue(beforePeriod) / (beforePeriod.length / (selectedLocation === 'all' ? 5 : 1)) * 30
  const afterRevenue = sumRevenue(afterPeriod) / (afterPeriod.length / (selectedLocation === 'all' ? 5 : 1)) * 30

  const beforeNoShow = avgField(beforePeriod, 'noShowRate')
  const afterNoShow = avgField(afterPeriod, 'noShowRate')

  const beforeResponse = avgField(beforePeriod, 'responseTimeAvg')
  const afterResponse = avgField(afterPeriod, 'responseTimeAvg')

  const beforeUtil = avgField(beforePeriod, 'utilizationRate')
  const afterUtil = avgField(afterPeriod, 'utilizationRate')

  // Weekly P&L impact
  const byDate = new Map<string, number>()
  all.forEach((m) => {
    byDate.set(m.date, (byDate.get(m.date) || 0) + m.revenueRecovered)
  })
  const recoveryTrend = Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, recovered]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      recovered,
    }))

  // Location scorecard
  const locationScores = locations.map((loc) => {
    const locAll = dailyMetrics.filter((m) => m.locationId === loc.id)
    const locAfter = locAll.slice(Math.floor(locAll.length * 2 / 3))
    return {
      name: loc.name,
      city: loc.city,
      revenue: locAfter.reduce((s, m) => s + m.revenue, 0),
      noShowRate: avgField(locAfter, 'noShowRate'),
      utilization: avgField(locAfter, 'utilizationRate'),
      recovered: locAfter.reduce((s, m) => s + m.revenueRecovered, 0),
      newClients: locAfter.reduce((s, m) => s + m.newClients, 0),
    }
  })

  const roiComparison = [
    { metric: 'Monthly Revenue', before: beforeRevenue, after: afterRevenue },
    { metric: 'No-Show Rate', before: beforeNoShow, after: afterNoShow, isPercent: true, lowerIsBetter: true },
    { metric: 'Response Time', before: beforeResponse, after: afterResponse, isTime: true, lowerIsBetter: true },
    { metric: 'Utilization', before: beforeUtil, after: afterUtil, isPercent: true },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/intelligence" className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Revenue Scorecard</h1>
          <p className="text-muted-foreground mt-0.5">Before vs. After EIP comparison</p>
        </div>
      </div>

      {/* Before vs After */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">ROI Dashboard: Before EIP vs After EIP</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roiComparison.map((item, i) => {
            const change = item.lowerIsBetter
              ? ((item.before - item.after) / item.before) * 100
              : ((item.after - item.before) / item.before) * 100
            const isPositive = change > 0

            const formatVal = (v: number) => {
              if (item.isPercent) return `${v.toFixed(1)}%`
              if (item.isTime) return v < 60 ? `${Math.round(v)}s` : `${(v / 3600).toFixed(1)}h`
              return formatCurrency(v)
            }

            return (
              <motion.div
                key={item.metric}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-lg border border-border bg-primary/[0.03]"
              >
                <p className="text-xs text-muted-foreground mb-3">{item.metric}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-destructive uppercase tracking-wider mb-1">Before</p>
                    <p className="text-lg font-mono text-muted-foreground">{formatVal(item.before)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-primary uppercase tracking-wider mb-1">After</p>
                    <p className="text-lg font-mono text-foreground">{formatVal(item.after)}</p>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1 mt-2', isPositive ? 'text-primary' : 'text-destructive')}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span className="text-sm font-medium">{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Recovery Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-premium p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue Recovery Trend (90 Days)</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recoveryTrend}>
              <defs>
                <linearGradient id="recoverGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} interval={14} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number = 0) => [formatCurrency(value), 'Recovered']}
              />
              <Area type="monotone" dataKey="recovered" stroke="var(--chart-3)" strokeWidth={2} fill="url(#recoverGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Location Scorecard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-premium p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Location Scorecard</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">Location</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Revenue</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Recovered</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">No-Show %</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Utilization</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 pl-4">New Clients</th>
              </tr>
            </thead>
            <tbody>
              {locationScores.map((loc) => (
                <tr key={loc.name} className="border-b border-border last:border-b-0 hover:bg-primary/[0.03] transition-colors">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-foreground">{loc.name}</p>
                    <p className="text-xs text-muted-foreground">{loc.city}</p>
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">{formatCurrency(loc.revenue)}</td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-primary">{formatCurrency(loc.recovered)}</td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">{loc.noShowRate.toFixed(1)}%</td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">{loc.utilization.toFixed(1)}%</td>
                  <td className="text-right py-3 pl-4 font-mono text-sm text-foreground">{loc.newClients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
