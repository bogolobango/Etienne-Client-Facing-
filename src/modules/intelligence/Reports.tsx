import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { useLocationStore } from '@/stores/useLocationStore'
import { dailyMetrics, locations } from '@/data/seed'
import { cn, formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function Reports() {
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

  const now = new Date()
  const weekStart = new Date(now.getTime() - 7 * 86400000)
  const dateRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/intelligence" className="p-2 rounded-lg hover:bg-[#7B61FF]/[0.05] text-[#94A3B8] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-[#F1F5F9]">Weekly Report</h1>
          <p className="text-[#94A3B8] mt-0.5">{dateRange}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA]/10 text-[#00D4AA] rounded-lg hover:bg-[#00D4AA]/20 transition-colors text-sm">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-sm font-medium text-[#94A3B8]">Executive Summary</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6]">AI Generated</span>
        </div>

        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-[#94A3B8] leading-relaxed">
            This week saw <strong className="text-[#F1F5F9]">{formatCurrency(weekRevenue)}</strong> in total revenue
            across {selectedLocation === 'all' ? 'all 5 locations' : locations.find(l => l.id === selectedLocation)?.name},
            representing a <span className={revenueChange >= 0 ? 'text-[#00D4AA]' : 'text-[#FF6B6B]'}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
            </span> change week-over-week. AI systems recovered <strong className="text-[#00D4AA]">{formatCurrency(weekRecovered)}</strong> through
            missed call follow-ups, no-show prevention, and upsell capture. The average no-show rate sits at{' '}
            <strong className="text-[#F1F5F9]">{avgNoShow.toFixed(1)}%</strong> with utilization at{' '}
            <strong className="text-[#F1F5F9]">{avgUtil.toFixed(1)}%</strong>.
          </p>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <p className="text-xs text-[#64748B] mb-1">{metric.label}</p>
            <p className="text-xl font-mono font-semibold text-[#F1F5F9]">{metric.value}</p>
            <div className={cn('flex items-center gap-1 mt-1', metric.change >= 0 ? 'text-[#00D4AA]' : 'text-[#FF6B6B]')}>
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
        className="card-premium p-6"
      >
        <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Location Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#7B61FF]/[0.08]">
                <th className="text-left text-xs text-[#64748B] font-medium pb-3 pr-4">Location</th>
                <th className="text-right text-xs text-[#64748B] font-medium pb-3 px-4">Revenue</th>
                <th className="text-right text-xs text-[#64748B] font-medium pb-3 px-4">Bookings</th>
                <th className="text-right text-xs text-[#64748B] font-medium pb-3 px-4">No-Show %</th>
                <th className="text-right text-xs text-[#64748B] font-medium pb-3 pl-4">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {locSummaries.map((loc) => (
                <tr key={loc.name} className="border-b border-[#7B61FF]/[0.08] last:border-b-0">
                  <td className="py-3 pr-4 text-sm font-medium text-[#F1F5F9]">{loc.name}</td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-[#F1F5F9]">{formatCurrency(loc.revenue)}</td>
                  <td className="text-right py-3 px-4 font-mono text-sm text-[#94A3B8]">{loc.bookings}</td>
                  <td className={cn('text-right py-3 px-4 font-mono text-sm', loc.noShowRate > 15 ? 'text-[#FF6B6B]' : 'text-[#94A3B8]')}>
                    {loc.noShowRate.toFixed(1)}%
                  </td>
                  <td className={cn('text-right py-3 pl-4 font-mono text-sm', loc.utilization >= 70 ? 'text-[#00D4AA]' : 'text-[#94A3B8]')}>
                    {loc.utilization.toFixed(1)}%
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
        className="card-premium p-6"
      >
        <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Past Reports</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((weeksAgo) => {
            const start = new Date(now.getTime() - (weeksAgo + 1) * 7 * 86400000)
            const end = new Date(now.getTime() - weeksAgo * 7 * 86400000)
            return (
              <div key={weeksAgo} className="flex items-center justify-between p-3 rounded-lg border border-[#7B61FF]/[0.08] bg-[#7B61FF]/[0.03] hover:border-[#7B61FF]/[0.2] transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#64748B]" />
                  <span className="text-sm text-[#F1F5F9]">
                    {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <Download className="w-4 h-4 text-[#64748B]" />
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
