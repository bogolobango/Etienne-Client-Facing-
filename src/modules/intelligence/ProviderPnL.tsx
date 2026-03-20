import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpDown,
  DollarSign,
  Clock,
  RefreshCw,
  AlertTriangle,
  Trophy,
  Sparkles,
  Zap,
  Users,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Link } from 'react-router-dom'
import { useLocationStore } from '@/stores/useLocationStore'
import { useEIPData } from '@/contexts/EIPDataContext'
import {
  providerMetrics,
  getProvidersByLocation,
  getAggregatedProviderMetrics,
} from '@/data/providers'
import type { Provider } from '@/data/providers'
import { cn, formatCurrency } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SortKey =
  | 'name'
  | 'location'
  | 'revenue'
  | 'revPerHour'
  | 'utilization'
  | 'rebook'
  | 'noShow'
  | 'appointments'

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
// Helpers
// ---------------------------------------------------------------------------
function locationName(locationId: string, locations: { id: string; name: string }[]): string {
  return locations.find((l) => l.id === locationId)?.name ?? locationId
}

function strengthTag(row: ProviderRow, allRows: ProviderRow[]): { label: string; icon: typeof Trophy } {
  const maxRevHour = Math.max(...allRows.map((r) => r.revPerHour))
  const maxRebook = Math.max(...allRows.map((r) => r.rebook))
  const maxRevenue = Math.max(...allRows.map((r) => r.revenue))
  const maxUtil = Math.max(...allRows.map((r) => r.utilization))

  if (row.revenue === maxRevenue) return { label: 'Revenue Leader', icon: Trophy }
  if (row.revPerHour === maxRevHour) return { label: 'Efficiency Star', icon: Zap }
  if (row.rebook === maxRebook) return { label: 'High Rebooker', icon: RefreshCw }
  if (row.utilization === maxUtil) return { label: 'Utilization Champ', icon: Sparkles }
  if (row.noShowRate <= 5) return { label: 'Reliable Scheduler', icon: Clock }
  return { label: 'Consistent Performer', icon: Users }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ProviderPnL() {
  const { locations } = useEIPData()
  const { selectedLocation } = useLocationStore()
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [sortAsc, setSortAsc] = useState(false)

  // Build rows
  const rows: ProviderRow[] = useMemo(() => {
    const filtered = getProvidersByLocation(selectedLocation as string)
    return filtered.map((p) => {
      const agg = getAggregatedProviderMetrics(p.id)
      return {
        provider: p,
        locationName: locationName(p.locationId, locations),
        revenue: agg.totalRevenue,
        revPerHour: agg.avgRevenuePerHour,
        utilization: agg.avgUtilization,
        rebook: agg.avgRebookingRate,
        noShowRate: agg.noShowRate,
        appointments: agg.totalAppointments,
      }
    })
  }, [selectedLocation, locations])

  // Sort
  const sortedRows = useMemo(() => {
    const copy = [...rows]
    const dir = sortAsc ? 1 : -1
    copy.sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return dir * a.provider.name.localeCompare(b.provider.name)
        case 'location':
          return dir * a.locationName.localeCompare(b.locationName)
        case 'revenue':
          return dir * (a.revenue - b.revenue)
        case 'revPerHour':
          return dir * (a.revPerHour - b.revPerHour)
        case 'utilization':
          return dir * (a.utilization - b.utilization)
        case 'rebook':
          return dir * (a.rebook - b.rebook)
        case 'noShow':
          return dir * (a.noShowRate - b.noShowRate)
        case 'appointments':
          return dir * (a.appointments - b.appointments)
        default:
          return 0
      }
    })
    return copy
  }, [rows, sortKey, sortAsc])

  // Column top performers for highlighting
  const topPerformers = useMemo(() => {
    if (!rows.length) return {} as Record<string, string>
    const maxRev = Math.max(...rows.map((r) => r.revenue))
    const maxRevHour = Math.max(...rows.map((r) => r.revPerHour))
    const maxUtil = Math.max(...rows.map((r) => r.utilization))
    const maxRebook = Math.max(...rows.map((r) => r.rebook))
    const minNoShow = Math.min(...rows.map((r) => r.noShowRate))
    const maxAppts = Math.max(...rows.map((r) => r.appointments))
    return {
      revenue: rows.find((r) => r.revenue === maxRev)?.provider.id,
      revPerHour: rows.find((r) => r.revPerHour === maxRevHour)?.provider.id,
      utilization: rows.find((r) => r.utilization === maxUtil)?.provider.id,
      rebook: rows.find((r) => r.rebook === maxRebook)?.provider.id,
      noShow: rows.find((r) => r.noShowRate === minNoShow)?.provider.id,
      appointments: rows.find((r) => r.appointments === maxAppts)?.provider.id,
    }
  }, [rows])

  // Summary cards
  const summary = useMemo(() => {
    if (!rows.length)
      return { highRevHour: null, lowUtil: null, bestRebook: null, totalRevenue: 0 }

    const highRevHour = [...rows].sort((a, b) => b.revPerHour - a.revPerHour)[0]
    const lowUtil = [...rows].sort((a, b) => a.utilization - b.utilization)[0]
    const bestRebook = [...rows].sort((a, b) => b.rebook - a.rebook)[0]
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)

    return { highRevHour, lowUtil, bestRebook, totalRevenue }
  }, [rows])

  // Cross-location insights
  const insights = useMemo(() => {
    if (rows.length < 2) return []
    const sorted = [...rows]
    const byRebook = [...sorted].sort((a, b) => b.rebook - a.rebook)
    const byRevHour = [...sorted].sort((a, b) => b.revPerHour - a.revPerHour)
    const byUtil = [...sorted].sort((a, b) => b.utilization - a.utilization)

    const result: { text: string; value: number }[] = []

    // Insight 1: rebook rate gap
    if (byRebook.length >= 2) {
      const top = byRebook[0]
      const bottom = byRebook[byRebook.length - 1]
      if (top.rebook > bottom.rebook) {
        const gap = (top.rebook - bottom.rebook) / 100
        const addedRev = Math.round(bottom.revenue * gap * 0.6)
        result.push({
          text: `If ${bottom.provider.name} matched ${top.provider.name}'s rebook rate (${top.rebook.toFixed(1)}%), estimated additional revenue: ${formatCurrency(addedRev)}/mo`,
          value: addedRev,
        })
      }
    }

    // Insight 2: rev/hour gap
    if (byRevHour.length >= 2) {
      const top = byRevHour[0]
      const low = byRevHour[byRevHour.length - 1]
      if (top.revPerHour > low.revPerHour) {
        const gapPct = (top.revPerHour - low.revPerHour) / top.revPerHour
        const addedRev = Math.round(low.revenue * gapPct * 0.4)
        result.push({
          text: `If ${low.provider.name} achieved ${top.provider.name}'s rev/hour ($${top.revPerHour}), estimated additional revenue: ${formatCurrency(addedRev)}/mo`,
          value: addedRev,
        })
      }
    }

    // Insight 3: utilization gap
    if (byUtil.length >= 2) {
      const top = byUtil[0]
      const low = byUtil[byUtil.length - 1]
      if (top.utilization > low.utilization) {
        const gapPct = (top.utilization - low.utilization) / 100
        const addedRev = Math.round(low.revenue * gapPct * 0.5)
        result.push({
          text: `If ${low.provider.name} reached ${top.provider.name}'s utilization (${top.utilization.toFixed(1)}%), estimated additional revenue: ${formatCurrency(addedRev)}/mo`,
          value: addedRev,
        })
      }
    }

    return result.slice(0, 3)
  }, [rows])

  // Daily revenue for detail cards (last 14 days)
  function dailyRevenue(providerId: string) {
    const metrics = providerMetrics
      .filter((m) => m.providerId === providerId)
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-14)
    return metrics.map((m) => ({
      date: new Date(m.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: m.revenue,
    }))
  }

  // Sort handler
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const renderSortHeader = (label: string, field: SortKey) => (
    <th
      key={field}
      onClick={() => handleSort(field)}
      className="text-right text-xs text-muted-foreground font-medium pb-3 px-3 cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn('w-3 h-3', sortKey === field ? 'text-primary' : 'text-muted-foreground/40')} />
      </span>
    </th>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/intelligence"
          className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Provider Performance</h1>
          <p className="text-muted-foreground mt-0.5">
            Revenue and efficiency metrics by individual provider
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0, ease: 'easeOut' }}
          className="card-premium p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Highest Rev/Hour</p>
          </div>
          <p className="text-2xl font-mono font-semibold text-foreground">
            ${summary.highRevHour?.revPerHour ?? 0}
          </p>
          <p className="text-xs text-primary mt-1 truncate">
            {summary.highRevHour?.provider.name ?? '—'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          className="card-premium p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-xs text-muted-foreground">Lowest Utilization</p>
          </div>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {summary.lowUtil?.utilization.toFixed(1) ?? 0}%
          </p>
          <p className="text-xs text-destructive mt-1 truncate">
            {summary.lowUtil?.provider.name ?? '—'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
          className="card-premium p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Best Rebook Rate</p>
          </div>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {summary.bestRebook?.rebook.toFixed(1) ?? 0}%
          </p>
          <p className="text-xs text-primary mt-1 truncate">
            {summary.bestRebook?.provider.name ?? '—'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: 'easeOut' }}
          className="card-premium p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Total Provider Revenue</p>
          </div>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">30-day total</p>
        </motion.div>
      </div>

      {/* Provider Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-premium p-4 sm:p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Provider Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th
                  onClick={() => handleSort('name')}
                  className="text-left text-xs text-muted-foreground font-medium pb-3 pr-3 cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1">
                    Provider
                    <ArrowUpDown className={cn('w-3 h-3', sortKey === 'name' ? 'text-primary' : 'text-muted-foreground/40')} />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('location')}
                  className="text-left text-xs text-muted-foreground font-medium pb-3 px-3 cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1">
                    Location
                    <ArrowUpDown className={cn('w-3 h-3', sortKey === 'location' ? 'text-primary' : 'text-muted-foreground/40')} />
                  </span>
                </th>
                {renderSortHeader('Revenue', 'revenue')}
                {renderSortHeader('Rev/Hour', 'revPerHour')}
                {renderSortHeader('Utilization', 'utilization')}
                {renderSortHeader('Rebook %', 'rebook')}
                {renderSortHeader('No-Show %', 'noShow')}
                {renderSortHeader('Appts', 'appointments')}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={row.provider.id}
                  className="border-b border-border last:border-b-0 hover:bg-primary/[0.06] transition-colors"
                >
                  <td className="py-3 pr-3">
                    <p className="text-sm font-medium text-foreground">{row.provider.name}</p>
                    <p className="text-xs text-muted-foreground">{row.provider.title}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-sm text-foreground">{row.locationName}</p>
                  </td>
                  <td
                    className={cn(
                      'text-right py-3 px-3 font-mono text-sm',
                      topPerformers.revenue === row.provider.id ? 'text-primary font-semibold' : 'text-foreground'
                    )}
                  >
                    {formatCurrency(row.revenue)}
                  </td>
                  <td
                    className={cn(
                      'text-right py-3 px-3 font-mono text-sm',
                      topPerformers.revPerHour === row.provider.id ? 'text-primary font-semibold' : 'text-foreground'
                    )}
                  >
                    ${row.revPerHour}
                  </td>
                  <td
                    className={cn(
                      'text-right py-3 px-3 font-mono text-sm',
                      topPerformers.utilization === row.provider.id ? 'text-primary font-semibold' : 'text-foreground'
                    )}
                  >
                    {row.utilization.toFixed(1)}%
                  </td>
                  <td
                    className={cn(
                      'text-right py-3 px-3 font-mono text-sm',
                      topPerformers.rebook === row.provider.id ? 'text-primary font-semibold' : 'text-foreground'
                    )}
                  >
                    {row.rebook.toFixed(1)}%
                  </td>
                  <td
                    className={cn(
                      'text-right py-3 px-3 font-mono text-sm',
                      topPerformers.noShow === row.provider.id ? 'text-primary font-semibold' : 'text-foreground'
                    )}
                  >
                    {row.noShowRate.toFixed(1)}%
                  </td>
                  <td
                    className={cn(
                      'text-right py-3 px-3 font-mono text-sm',
                      topPerformers.appointments === row.provider.id ? 'text-primary font-semibold' : 'text-foreground'
                    )}
                  >
                    {row.appointments}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Provider Detail Cards — horizontal scroll */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Provider Detail</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
          {sortedRows.map((row, idx) => {
            const daily = dailyRevenue(row.provider.id)
            const tag = strengthTag(row, rows)
            const TagIcon = tag.icon
            return (
              <motion.div
                key={row.provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.04 }}
                className="card-premium p-4 min-w-[240px] sm:min-w-[280px] max-w-[300px] sm:max-w-[320px] shrink-0"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.provider.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.provider.title} &middot; {row.locationName}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/[0.08] px-2 py-1 rounded-full whitespace-nowrap">
                    <TagIcon className="w-3 h-3" />
                    {tag.label}
                  </span>
                </div>

                {/* Mini bar chart */}
                <div className="h-[100px] mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={daily}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--foreground)',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number = 0) => [formatCurrency(value), 'Revenue']}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="var(--primary)"
                        radius={[2, 2, 0, 0]}
                        opacity={0.7}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rev/Hr</p>
                    <p className="text-sm font-mono font-semibold text-foreground">${row.revPerHour}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Util</p>
                    <p className="text-sm font-mono font-semibold text-foreground">{row.utilization.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rebook</p>
                    <p className="text-sm font-mono font-semibold text-foreground">{row.rebook.toFixed(1)}%</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Cross-Location Insight Panel */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-4 sm:p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Cross-Location Intelligence
          </h3>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5"
              >
                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
