import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  CalendarClock,
  ChevronRight,
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { Link } from 'react-router-dom'
import { useLocationStore } from '@/stores/useLocationStore'
import {
  packageSales,
  revenueReconciliation,
  getPackageDef,
  getLocationName,
} from '@/data/packages'
import { cn, formatCurrency } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PackageTruth() {
  const { selectedLocation } = useLocationStore()

  // ----- Filtered data -----
  const filteredSales = useMemo(
    () =>
      packageSales.filter(
        (s) => selectedLocation === 'all' || s.locationId === selectedLocation
      ),
    [selectedLocation]
  )

  const filteredReconciliation = useMemo(
    () =>
      revenueReconciliation.filter(
        (r) => selectedLocation === 'all' || r.locationId === selectedLocation
      ),
    [selectedLocation]
  )

  const activeSales = useMemo(
    () => filteredSales.filter((s) => s.status === 'active'),
    [filteredSales]
  )

  // ----- Aggregate metrics -----
  const totalReported = useMemo(
    () => filteredReconciliation.reduce((s, r) => s + r.reportedRevenue, 0),
    [filteredReconciliation]
  )

  const totalNormalized = useMemo(
    () => filteredReconciliation.reduce((s, r) => s + r.normalizedRevenue, 0),
    [filteredReconciliation]
  )

  const totalDeferred = useMemo(
    () => activeSales.reduce((s, sale) => s + sale.revenueDeferred, 0),
    [activeSales]
  )

  const distortionPercent = useMemo(
    () =>
      totalNormalized > 0
        ? ((totalReported - totalNormalized) / totalNormalized) * 100
        : 0,
    [totalReported, totalNormalized]
  )

  // ----- Revenue comparison chart data (30 days, aggregated by date) -----
  const comparisonChartData = useMemo(() => {
    const byDate = new Map<string, { reported: number; normalized: number }>()
    filteredReconciliation.forEach((r) => {
      const entry = byDate.get(r.period) ?? { reported: 0, normalized: 0 }
      entry.reported += r.reportedRevenue
      entry.normalized += r.normalizedRevenue
      byDate.set(r.period, entry)
    })
    return Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, vals]) => ({
        date: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        reported: vals.reported,
        normalized: vals.normalized,
      }))
  }, [filteredReconciliation])

  // ----- Deferred vs recognized by location -----
  const locationBreakdown = useMemo(() => {
    const locIds = ['soho', 'williamsburg', 'hoboken', 'white-plains', 'stamford']
    return locIds.map((locId) => {
      const locSales = packageSales.filter(
        (s) => s.locationId === locId && s.status === 'active'
      )
      return {
        location: getLocationName(locId),
        recognized: locSales.reduce((s, sale) => s + sale.revenueRecognized, 0),
        deferred: locSales.reduce((s, sale) => s + sale.revenueDeferred, 0),
      }
    })
  }, [])

  // ----- At-risk packages (active, expiring within 30 days, sessions remaining) -----
  const atRiskPackages = useMemo(
    () =>
      activeSales
        .filter(
          (s) =>
            s.sessionsRemaining > 0 && daysUntil(s.expirationDate) <= 30
        )
        .sort(
          (a, b) =>
            daysUntil(a.expirationDate) - daysUntil(b.expirationDate)
        ),
    [activeSales]
  )

  const atRiskRevenue = useMemo(
    () => atRiskPackages.reduce((s, p) => s + p.revenueDeferred, 0),
    [atRiskPackages]
  )

  // ----- Example package for recognition timeline -----
  const timelinePackage = useMemo(() => {
    const example = activeSales.find(
      (s) => s.sessionsUsed > 0 && s.sessionsRemaining > 0
    )
    if (!example) return null
    const def = getPackageDef(example.packageDefId)
    return def ? { sale: example, def } : null
  }, [activeSales])

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex items-center gap-3">
        <Link
          to="/intelligence"
          className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Package Revenue Truth Engine
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Accurate revenue recognition for multi-session packages
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* The Problem Explained */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-xl border border-warning/20 bg-warning/5"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Why Your Revenue Numbers Are Wrong
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your PMS books a $3,000 6-session package as{' '}
              <span className="text-foreground font-medium">
                $3,000 on day 1, $0 on days 2-6
              </span>
              . This inflates revenue on purchase day and hides your true
              service delivery economics. The Truth Engine normalizes package
              revenue across all sessions, revealing the actual per-visit
              value and total deferred service obligations.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ---------------------------------------------------------------- */}
      {/* Revenue Variance Dashboard — 3 metric cards */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Reported vs Normalized Revenue',
            icon: DollarSign,
            primary: totalReported,
            secondary: totalNormalized,
            delta: totalReported - totalNormalized,
            note: `${formatCurrency(totalReported)} reported — ${formatCurrency(totalNormalized)} normalized`,
            color: 'text-primary',
          },
          {
            label: 'Total Deferred Revenue',
            icon: Clock,
            primary: totalDeferred,
            secondary: null,
            delta: null,
            note: 'Service obligation not yet delivered',
            color: 'text-warning',
          },
          {
            label: 'Revenue Distortion',
            icon: TrendingUp,
            primary: null,
            secondary: null,
            delta: null,
            percent: distortionPercent,
            note: 'How much raw numbers mislead',
            color: distortionPercent > 15 ? 'text-destructive' : 'text-warning',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-premium p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <card.icon className={cn('w-4 h-4', card.color)} />
              <p className="text-xs text-muted-foreground font-medium">
                {card.label}
              </p>
            </div>
            {card.primary !== null && card.primary !== undefined ? (
              <>
                <p className="text-2xl font-mono font-semibold text-foreground">
                  {formatCurrency(card.primary)}
                </p>
                {card.delta !== null && card.delta !== undefined && (
                  <p className="text-sm font-mono text-muted-foreground mt-1">
                    {card.delta > 0 ? '+' : ''}
                    {formatCurrency(card.delta)} variance
                  </p>
                )}
              </>
            ) : card.percent !== undefined ? (
              <p
                className={cn(
                  'text-2xl font-mono font-semibold',
                  card.color
                )}
              >
                {card.percent > 0 ? '+' : ''}
                {card.percent.toFixed(1)}%
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground mt-2">{card.note}</p>
          </motion.div>
        ))}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Revenue Comparison Chart */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card-premium p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Reported vs Normalized Revenue (30 Days)
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          The gap between lines reveals package booking distortion
        </p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={comparisonChartData}>
              <defs>
                <linearGradient id="gradReported" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="gradNormalized"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--chart-3)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-3)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'var(--muted-foreground)',
                  fontSize: 11,
                }}
                interval={4}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'var(--muted-foreground)',
                  fontSize: 12,
                }}
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
                formatter={(value: number = 0) => [
                  formatCurrency(value),
                ]}
              />
              <Area
                type="monotone"
                dataKey="reported"
                name="Reported (PMS)"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#gradReported)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="normalized"
                name="Normalized (True)"
                stroke="var(--chart-3)"
                strokeWidth={2}
                fill="url(#gradNormalized)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="line"
                wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ---------------------------------------------------------------- */}
      {/* Active Packages Table */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-premium p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Packages
          </h3>
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            {activeSales.length} active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[
                  'Client',
                  'Package',
                  'Location',
                  'Progress',
                  'Recognized',
                  'Deferred',
                  'Status',
                  'Expires',
                  'Next Session',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => {
                const def = getPackageDef(sale.packageDefId)
                const total = def?.totalSessions ?? 1
                const progress = (sale.sessionsUsed / total) * 100
                const daysLeft = daysUntil(sale.expirationDate)

                return (
                  <tr
                    key={sale.id}
                    className="border-b border-border last:border-b-0 hover:bg-primary/[0.06] transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-foreground">
                        {sale.clientName}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-sm text-foreground whitespace-nowrap">
                      {def?.name ?? sale.packageDefId}
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted-foreground whitespace-nowrap">
                      {getLocationName(sale.locationId)}
                    </td>
                    <td className="py-3 pr-4 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-primary/[0.08] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                          {sale.sessionsUsed}/{total}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm font-mono text-primary whitespace-nowrap">
                      {formatCurrency(sale.revenueRecognized)}
                    </td>
                    <td className="py-3 pr-4 text-sm font-mono text-warning whitespace-nowrap">
                      {formatCurrency(sale.revenueDeferred)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          sale.status === 'active' &&
                            'bg-primary/10 text-primary',
                          sale.status === 'completed' &&
                            'bg-success/10 text-success',
                          sale.status === 'expired' &&
                            'bg-destructive/10 text-destructive'
                        )}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {sale.status === 'active' ? (
                        <span
                          className={cn(
                            'text-xs font-mono',
                            daysLeft <= 14
                              ? 'text-destructive'
                              : daysLeft <= 30
                              ? 'text-warning'
                              : 'text-muted-foreground'
                          )}
                        >
                          {daysLeft}d
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {sale.nextSessionDate ? (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(sale.nextSessionDate)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ---------------------------------------------------------------- */}
      {/* Deferred Revenue by Location */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card-premium p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Deferred vs Recognized Revenue by Location
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          Stacked view of service obligations across locations
        </p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locationBreakdown}>
              <XAxis
                dataKey="location"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'var(--muted-foreground)',
                  fontSize: 11,
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'var(--muted-foreground)',
                  fontSize: 12,
                }}
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
                formatter={(value: number = 0) => [formatCurrency(value)]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="rect"
                wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }}
              />
              <Bar
                dataKey="recognized"
                name="Recognized"
                stackId="revenue"
                fill="var(--chart-3)"
                radius={[0, 0, 0, 0]}
                animationDuration={1200}
              />
              <Bar
                dataKey="deferred"
                name="Deferred"
                stackId="revenue"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ---------------------------------------------------------------- */}
      {/* At-Risk Packages */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="card-premium p-6 border-destructive/20"
      >
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-medium text-foreground">
            At-Risk Packages
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Expiring within 30 days with unused sessions —{' '}
          <span className="text-destructive font-medium font-mono">
            {formatCurrency(atRiskRevenue)}
          </span>{' '}
          revenue at risk of write-off
        </p>

        {atRiskPackages.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No at-risk packages for this location filter.
          </p>
        ) : (
          <div className="space-y-3">
            {atRiskPackages.map((sale) => {
              const def = getPackageDef(sale.packageDefId)
              const daysLeft = daysUntil(sale.expirationDate)

              return (
                <div
                  key={sale.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-destructive/10 bg-destructive/[0.04] hover:bg-destructive/[0.08] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {sale.clientName}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {getLocationName(sale.locationId)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {def?.name} — {sale.sessionsRemaining} session
                      {sale.sessionsRemaining > 1 ? 's' : ''} remaining
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono text-destructive font-medium">
                      {formatCurrency(sale.revenueDeferred)}
                    </p>
                    <p
                      className={cn(
                        'text-xs font-mono',
                        daysLeft <= 14
                          ? 'text-destructive'
                          : 'text-warning'
                      )}
                    >
                      {daysLeft}d remaining
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* ---------------------------------------------------------------- */}
      {/* Revenue Recognition Timeline */}
      {/* ---------------------------------------------------------------- */}
      {timelinePackage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="card-premium p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground">
              Revenue Recognition Timeline
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            How a single package's revenue gets spread across its sessions
          </p>

          {/* Example package info */}
          <div className="p-4 rounded-lg border border-border bg-primary/[0.04] mb-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {timelinePackage.def.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {timelinePackage.sale.clientName} —{' '}
                  {getLocationName(timelinePackage.sale.locationId)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-foreground">
                  {formatCurrency(timelinePackage.def.totalPrice)} total
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(timelinePackage.def.pricePerSession)} per
                  session
                </p>
              </div>
            </div>
          </div>

          {/* PMS view vs Truth view */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PMS View */}
            <div>
              <p className="text-xs font-medium text-destructive uppercase tracking-wider mb-3">
                PMS View (Distorted)
              </p>
              <div className="space-y-2">
                {Array.from(
                  { length: timelinePackage.def.totalSessions },
                  (_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16 shrink-0">
                        Session {i + 1}
                      </span>
                      <div className="flex-1 h-6 rounded bg-primary/[0.06] overflow-hidden relative">
                        {i === 0 && (
                          <div
                            className="h-full rounded bg-destructive/60"
                            style={{ width: '100%' }}
                          />
                        )}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-16 text-right">
                        {i === 0
                          ? formatCurrency(timelinePackage.def.totalPrice)
                          : '$0'}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Truth View */}
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">
                Truth Engine View (Normalized)
              </p>
              <div className="space-y-2">
                {Array.from(
                  { length: timelinePackage.def.totalSessions },
                  (_, i) => {
                    const isUsed = i < timelinePackage.sale.sessionsUsed
                    const isFuture = i >= timelinePackage.sale.sessionsUsed
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-16 shrink-0">
                          Session {i + 1}
                        </span>
                        <div className="flex-1 h-6 rounded bg-primary/[0.06] overflow-hidden relative">
                          <div
                            className={cn(
                              'h-full rounded transition-all',
                              isUsed
                                ? 'bg-primary'
                                : 'bg-primary/30 border border-dashed border-primary/40'
                            )}
                            style={{
                              width: `${
                                (timelinePackage.def.pricePerSession /
                                  timelinePackage.def.totalPrice) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-xs font-mono w-16 text-right',
                            isUsed
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          )}
                        >
                          {formatCurrency(
                            timelinePackage.def.pricePerSession
                          )}
                          {isFuture && (
                            <span className="text-muted-foreground/60">
                              *
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  }
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                * Deferred — recognized upon service delivery
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default PackageTruth
