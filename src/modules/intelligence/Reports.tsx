import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { useLocationStore } from '@/stores/useLocationStore'
import { useEIPData } from '@/contexts/EIPDataContext'
import { INDUSTRY_BENCHMARKS } from '@/data/benchmarks'
import { cn, formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function Reports() {
  const { dailyMetrics, locations } = useEIPData()
  const { selectedLocation } = useLocationStore()

  const last7 = dailyMetrics.filter((m) => {
    const d = new Date(m.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) / 86400000 <= 7 &&
      (selectedLocation === 'all' || m.locationId === selectedLocation)
  })

  const prev7 = dailyMetrics.filter((m) => {
    const d = new Date(m.date)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / 86400000
    return diff > 7 && diff <= 14 &&
      (selectedLocation === 'all' || m.locationId === selectedLocation)
  })

  const weekRevenue = last7.reduce((s, m) => s + m.revenue, 0)
  const prevWeekRevenue = prev7.reduce((s, m) => s + m.revenue, 0)
  const weekRecovered = last7.reduce((s, m) => s + m.revenueRecovered, 0)
  const weekBookings = last7.reduce((s, m) => s + m.bookings, 0)
  const weekNoShows = last7.reduce((s, m) => s + m.noShows, 0)
  const weekNewClients = last7.reduce((s, m) => s + m.newClients, 0)

  const avgNoShow = last7.length ? last7.reduce((s, m) => s + m.noShowRate, 0) / last7.length : 0
  const avgUtil = last7.length ? last7.reduce((s, m) => s + m.utilizationRate, 0) / last7.length : 0

  const revenueChange = prevWeekRevenue ? ((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100 : 0

  const now = new Date()

  // 30-day metrics for Executive Insight
  const last30 = dailyMetrics.filter((m) => {
    const d = new Date(m.date)
    return (now.getTime() - d.getTime()) / 86400000 <= 30 &&
      (selectedLocation === 'all' || m.locationId === selectedLocation)
  })
  const totalRevenue30 = last30.reduce((s, m) => s + m.revenue, 0)
  const avgNoShow30 = last30.length ? last30.reduce((s, m) => s + m.noShowRate, 0) / last30.length : 0
  const avgUtil30 = last30.length ? last30.reduce((s, m) => s + m.utilizationRate, 0) / last30.length : 0
  const avgRebook30 = last30.length ? last30.reduce((s, m) => s + m.rebookingRate, 0) / last30.length : 0
  const utilizationOpportunity = Math.round((0.82 - avgUtil30 / 100) * totalRevenue30)

  const locSummaries = locations.map((loc) => {
    const locWeek = last7.filter((m) => m.locationId === loc.id)
    return {
      name: loc.name,
      revenue: locWeek.reduce((s, m) => s + m.revenue, 0),
      bookings: locWeek.reduce((s, m) => s + m.bookings, 0),
      noShowRate: locWeek.length ? locWeek.reduce((s, m) => s + m.noShowRate, 0) / locWeek.length : 0,
      utilization: locWeek.length ? locWeek.reduce((s, m) => s + m.utilizationRate, 0) / locWeek.length : 0,
    }
  })

  const weekStart = new Date(now.getTime() - 7 * 86400000)
  const dateRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/intelligence" className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">Weekly Report</h1>
          <p className="text-muted-foreground mt-0.5">{dateRange}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">Executive Summary</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">AI Generated</span>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            This week saw <strong className="text-foreground">{formatCurrency(weekRevenue)}</strong> in total revenue
            across {selectedLocation === 'all' ? `all ${locations.length} locations` : locations.find(l => l.id === selectedLocation)?.name},
            representing a <span className={revenueChange >= 0 ? 'text-primary' : 'text-destructive'}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
            </span> change week-over-week. EIP identified <strong className="text-primary">{formatCurrency(weekRecovered)}</strong> in revenue gaps through
            response gap analysis, no-show pattern detection, and utilization insights. The average no-show rate sits at{' '}
            <strong className="text-foreground">{avgNoShow.toFixed(1)}%</strong> with utilization at{' '}
            <strong className="text-foreground">{avgUtil.toFixed(1)}%</strong>.
          </p>
          <p className="text-primary leading-relaxed mt-3 border-t border-border pt-3">
            <strong>Executive Insight:</strong> {selectedLocation === 'all' ? 'GlowUp Aesthetics' : locations.find(l => l.id === selectedLocation)?.name} is performing{' '}
            {avgNoShow30 < INDUSTRY_BENCHMARKS.noShowRate.avg ? 'above' : 'below'} industry average on no-show rate ({avgNoShow30.toFixed(1)}% vs. {INDUSTRY_BENCHMARKS.noShowRate.avg}% avg)
            and rebook rate ({avgRebook30.toFixed(1)}% vs. {INDUSTRY_BENCHMARKS.rebookingRate.avg}% avg), while
            utilization ({avgUtil30.toFixed(1)}%) has room to reach the {INDUSTRY_BENCHMARKS.utilizationRate.topPerformer}% top-performer benchmark
            — an estimated <strong>{formatCurrency(utilizationOpportunity)}</strong>/month opportunity.
          </p>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Revenue', value: formatCurrency(weekRevenue), change: revenueChange },
          { label: 'AI Recovered', value: formatCurrency(weekRecovered), change: 15.2 },
          { label: 'Bookings', value: weekBookings.toString(), change: 8.5 },
          { label: 'No-Shows', value: weekNoShows.toString(), change: -12.0 },
          { label: 'New Clients', value: weekNewClients.toString(), change: 22.0 },
          { label: 'Utilization', value: `${avgUtil.toFixed(0)}%`, change: 5.8 },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 card-premium"
          >
            <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
            <p className="text-xl font-mono font-semibold text-foreground">{metric.value}</p>
            <div className={cn('flex items-center gap-1 mt-1', metric.change >= 0 ? 'text-primary' : 'text-destructive')}>
              {metric.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-xs font-medium">{metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Location Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-premium p-4 sm:p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Location Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4">Location</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Revenue</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Bookings</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">No-Show %</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">vs. Industry</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 px-4">Utilization</th>
                <th className="text-right text-xs text-muted-foreground font-medium pb-3 pl-4">vs. Industry</th>
              </tr>
            </thead>
            <tbody>
              {locSummaries.map((loc) => (
                <tr key={loc.name} className="border-b border-border last:border-b-0">
                  <td className="py-3 pr-4 text-sm font-medium text-foreground">{loc.name}</td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-foreground">{formatCurrency(loc.revenue)}</td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-muted-foreground">{loc.bookings}</td>
                  <td className={cn('text-right py-3 px-4 font-mono text-sm', loc.noShowRate > 15 ? 'text-destructive' : 'text-muted-foreground')}>
                    {loc.noShowRate.toFixed(1)}%
                  </td>
                  <td className={cn('text-right py-3 px-4 font-mono text-xs', loc.noShowRate < INDUSTRY_BENCHMARKS.noShowRate.avg ? 'text-primary' : 'text-destructive')}>
                    {loc.noShowRate < INDUSTRY_BENCHMARKS.noShowRate.avg
                      ? `${(INDUSTRY_BENCHMARKS.noShowRate.avg - loc.noShowRate).toFixed(1)}% below avg`
                      : `+${(loc.noShowRate - INDUSTRY_BENCHMARKS.noShowRate.avg).toFixed(1)}% above avg`}
                  </td>
                  <td className={cn('text-right py-3 px-4 font-mono text-sm', loc.utilization >= 70 ? 'text-primary' : 'text-muted-foreground')}>
                    {loc.utilization.toFixed(1)}%
                  </td>
                  <td className={cn('text-right py-3 pl-4 font-mono text-xs', loc.utilization >= INDUSTRY_BENCHMARKS.utilizationRate.avg ? 'text-primary' : 'text-destructive')}>
                    {loc.utilization >= INDUSTRY_BENCHMARKS.utilizationRate.avg
                      ? `+${(loc.utilization - INDUSTRY_BENCHMARKS.utilizationRate.avg).toFixed(1)}% above avg`
                      : `${(INDUSTRY_BENCHMARKS.utilizationRate.avg - loc.utilization).toFixed(1)}% below avg`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Past Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card-premium p-4 sm:p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Past Reports</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((weeksAgo) => {
            const start = new Date(now.getTime() - (weeksAgo + 1) * 7 * 86400000)
            const end = new Date(now.getTime() - weeksAgo * 7 * 86400000)
            return (
              <div key={weeksAgo} className="flex items-center justify-between p-3 rounded-lg border border-border bg-primary/[0.06] hover:border-primary/20 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <Download className="w-4 h-4 text-muted-foreground" />
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
