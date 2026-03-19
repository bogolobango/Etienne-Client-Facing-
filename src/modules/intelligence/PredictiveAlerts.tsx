import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Eye,
  TrendingDown,
  Activity,
  BarChart3,
  Link2,
  Gauge,
  Clock,
  Filter,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Link } from 'react-router-dom'
import { useLocationStore } from '@/stores/useLocationStore'
import { locations } from '@/data/seed'
import { predictiveAlerts, dashboardTrends, type PredictiveAlert } from '@/data/predictive-alerts'
import { cn, formatCurrency } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    label: 'Critical',
    pillBg: 'bg-red-500/10',
    pillText: 'text-red-400',
    pillBorder: 'border-red-500/20',
    cardBorder: 'border-red-500/30',
    cardGlow: 'shadow-[0_0_15px_-3px_rgba(239,68,68,0.15)]',
    dot: 'bg-red-500',
    dotPulse: true,
  },
  warning: {
    icon: AlertCircle,
    label: 'Warning',
    pillBg: 'bg-yellow-500/10',
    pillText: 'text-yellow-400',
    pillBorder: 'border-yellow-500/20',
    cardBorder: 'border-yellow-500/20',
    cardGlow: '',
    dot: 'bg-yellow-500',
    dotPulse: false,
  },
  info: {
    icon: Info,
    label: 'Info',
    pillBg: 'bg-primary/10',
    pillText: 'text-primary',
    pillBorder: 'border-primary/20',
    cardBorder: 'border-primary/20',
    cardGlow: '',
    dot: 'bg-primary',
    dotPulse: false,
  },
}

const typeConfig: Record<PredictiveAlert['type'], { icon: typeof TrendingDown; label: string }> = {
  trend_decline: { icon: TrendingDown, label: 'Trend Decline' },
  anomaly: { icon: Activity, label: 'Anomaly' },
  forecast: { icon: BarChart3, label: 'Forecast' },
  correlation: { icon: Link2, label: 'Correlation' },
  threshold: { icon: Gauge, label: 'Threshold' },
}

function getLocationName(id: string): string {
  return locations.find((l) => l.id === id)?.name ?? id
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// Mini Trend Chart (used in dashboard and expanded cards)
// ---------------------------------------------------------------------------

function MiniTrendChart({
  data,
  unit,
  height = 120,
}: {
  data: { date: string; actual?: number; projected?: number }[]
  unit?: string
  height?: number
}) {
  const formatVal = (v: number) => {
    if (unit === '$') return `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
    if (unit === '%') return `${v.toFixed(1)}%`
    return String(Math.round(v))
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          tickFormatter={(v) => formatDate(v)}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          tickFormatter={formatVal}
          width={45}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--foreground)',
            fontSize: '12px',
          }}
          formatter={(value: number = 0, name: string = '') => [formatVal(value), name === 'actual' ? 'Actual' : 'Projected']}
          labelFormatter={(label) => formatDate(label)}
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: 'var(--primary)' }}
        />
        <Line
          type="monotone"
          dataKey="projected"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={false}
          activeDot={{ r: 3, fill: 'var(--primary)' }}
          opacity={0.6}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Alert Card
// ---------------------------------------------------------------------------

function AlertCard({
  alert,
  isExpanded,
  onToggle,
  onAcknowledge,
  onResolve,
}: {
  alert: PredictiveAlert
  isExpanded: boolean
  onToggle: () => void
  onAcknowledge: (id: string) => void
  onResolve: (id: string) => void
}) {
  const sev = severityConfig[alert.severity]
  const typeInfo = typeConfig[alert.type]
  const SeverityIcon = sev.icon
  const TypeIcon = typeInfo.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={cn(
        'rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-200',
        sev.cardBorder,
        sev.cardGlow,
        isExpanded && 'ring-1 ring-white/5',
      )}
    >
      {/* Collapsed header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left cursor-pointer hover:bg-primary/[0.03] transition-colors rounded-xl"
      >
        {/* Severity dot */}
        <div className="relative shrink-0">
          <div className={cn('w-2.5 h-2.5 rounded-full', sev.dot)} />
          {sev.dotPulse && alert.status === 'active' && (
            <div className={cn('absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping', sev.dot, 'opacity-75')} />
          )}
        </div>

        {/* Icon */}
        <SeverityIcon className={cn('w-4.5 h-4.5 shrink-0', sev.pillText)} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-medium text-foreground truncate">{alert.title}</h3>
            {alert.status !== 'active' && (
              <span className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wider',
                alert.status === 'acknowledged' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-emerald-500/10 text-emerald-400',
              )}>
                {alert.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground">{getLocationName(alert.locationId)}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {typeInfo.label}
            </span>
          </div>
        </div>

        {/* Impact */}
        <div className="text-right shrink-0 mr-2">
          <p className="text-sm font-mono font-medium text-foreground">{formatCurrency(alert.estimatedImpact)}</p>
          <p className="text-[10px] text-muted-foreground">monthly impact</p>
        </div>

        {/* Detected date */}
        <div className="text-right shrink-0 hidden sm:block mr-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(alert.detectedAt)}
          </p>
        </div>

        {/* Expand chevron */}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border/50">
              {/* Narrative */}
              <p className="text-sm text-muted-foreground leading-relaxed">{alert.narrative}</p>

              {/* Trend chart */}
              <div className="rounded-lg border border-border bg-primary/[0.02] p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {alert.metric} — 14-day history + 14-day projection
                </p>
                <MiniTrendChart data={alert.trendData} height={160} />
              </div>

              {/* Correlated explanation */}
              {alert.correlatedMetric && alert.correlatedExplanation && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 className="w-3.5 h-3.5 text-primary" />
                    <p className="text-xs font-medium text-primary">
                      Correlated Factor: {alert.correlatedMetric}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.correlatedExplanation}</p>
                </div>
              )}

              {/* Suggested action */}
              <div className="rounded-lg border border-border bg-primary/[0.03] p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Action</p>
                <p className="text-sm text-foreground">{alert.suggestedAction}</p>
              </div>

              {/* Metric summary */}
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Current: </span>
                  <span className="font-mono text-foreground">{alert.currentValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Projected: </span>
                  <span className="font-mono text-foreground">{alert.projectedValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">By: </span>
                  <span className="font-mono text-foreground">{formatDate(alert.projectedDate)}</span>
                </div>
              </div>

              {/* Actions */}
              {alert.status === 'active' && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onResolve(alert.id) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Timeline Entry
// ---------------------------------------------------------------------------

function TimelineEntry({ alert }: { alert: PredictiveAlert }) {
  const sev = severityConfig[alert.severity]
  return (
    <div className="flex gap-3 items-start">
      <div className="relative mt-1">
        <div className={cn('w-2 h-2 rounded-full', sev.dot)} />
        {/* Vertical line connector */}
        <div className="absolute top-2 left-[3px] w-px h-full bg-border" />
      </div>
      <div className="pb-4">
        <p className="text-xs text-muted-foreground">{formatDate(alert.detectedAt)}</p>
        <p className="text-sm text-foreground mt-0.5">{alert.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {getLocationName(alert.locationId)} · {formatCurrency(alert.estimatedImpact)} impact
        </p>
        {alert.status !== 'active' && (
          <span className={cn(
            'inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wider',
            alert.status === 'acknowledged' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-emerald-500/10 text-emerald-400',
          )}>
            {alert.status}
          </span>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PredictiveAlerts() {
  const { selectedLocation } = useLocationStore()

  // Local state for alert statuses
  const [alertStatuses, setAlertStatuses] = useState<Record<string, PredictiveAlert['status']>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<PredictiveAlert['severity'] | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<PredictiveAlert['type'] | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<PredictiveAlert['status'] | 'all'>('all')

  // Merge local status overrides with source data
  const alerts = useMemo(() => {
    return predictiveAlerts.map((a) => ({
      ...a,
      status: alertStatuses[a.id] ?? a.status,
    }))
  }, [alertStatuses])

  // Apply filters
  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (selectedLocation !== 'all' && a.locationId !== selectedLocation) return false
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false
      if (typeFilter !== 'all' && a.type !== typeFilter) return false
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      return true
    })
  }, [alerts, selectedLocation, severityFilter, typeFilter, statusFilter])

  // Counts by severity (unfiltered except location)
  const locationAlerts = alerts.filter(
    (a) => selectedLocation === 'all' || a.locationId === selectedLocation,
  )
  const criticalCount = locationAlerts.filter((a) => a.severity === 'critical').length
  const warningCount = locationAlerts.filter((a) => a.severity === 'warning').length
  const infoCount = locationAlerts.filter((a) => a.severity === 'info').length

  // Timeline: sorted by detectedAt, most recent first
  const timeline = [...locationAlerts].sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime(),
  )

  // Sort filtered: critical first, then by impact
  const sorted = [...filtered].sort((a, b) => {
    const sevOrder = { critical: 0, warning: 1, info: 2 }
    if (sevOrder[a.severity] !== sevOrder[b.severity]) return sevOrder[a.severity] - sevOrder[b.severity]
    return b.estimatedImpact - a.estimatedImpact
  })

  const handleAcknowledge = (id: string) => {
    setAlertStatuses((prev) => ({ ...prev, [id]: 'acknowledged' }))
  }

  const handleResolve = (id: string) => {
    setAlertStatuses((prev) => ({ ...prev, [id]: 'resolved' }))
  }

  const totalImpact = locationAlerts
    .filter((a) => a.status === 'active')
    .reduce((s, a) => s + a.estimatedImpact, 0)

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
          <h1 className="text-2xl font-semibold text-foreground">Predictive Alerts</h1>
          <p className="text-muted-foreground mt-0.5">
            AI-detected trends, anomalies, and forecasts before they impact revenue
          </p>
        </div>
      </div>

      {/* Alert Summary Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer transition-all',
            severityFilter === 'critical'
              ? 'bg-red-500/20 text-red-400 border-red-500/40'
              : 'bg-red-500/10 text-red-400 border-red-500/20 hover:border-red-500/40',
          )}
          onClick={() => setSeverityFilter(severityFilter === 'critical' ? 'all' : 'critical')}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Critical: {criticalCount}
        </div>
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer transition-all',
            severityFilter === 'warning'
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:border-yellow-500/40',
          )}
          onClick={() => setSeverityFilter(severityFilter === 'warning' ? 'all' : 'warning')}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Warning: {warningCount}
        </div>
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer transition-all',
            severityFilter === 'info'
              ? 'bg-primary/20 text-primary border-primary/40'
              : 'bg-primary/10 text-primary border-primary/20 hover:border-primary/40',
          )}
          onClick={() => setSeverityFilter(severityFilter === 'info' ? 'all' : 'info')}
        >
          <Info className="w-3.5 h-3.5" />
          Info: {infoCount}
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          Total active impact: <span className="font-mono text-foreground font-medium">{formatCurrency(totalImpact)}</span>/mo
        </div>
      </motion.div>

      {/* Trend Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {Object.entries(dashboardTrends).map(([key, trend], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="card-premium p-4"
          >
            <p className="text-xs font-medium text-muted-foreground mb-1">{trend.label}</p>
            <p className="text-lg font-mono font-semibold text-foreground mb-2">
              {trend.unit === '$'
                ? `$${(trend.data.find((d) => d.actual)?.actual ?? 0).toLocaleString()}`
                : `${(trend.data.filter((d) => d.actual).pop()?.actual ?? 0).toFixed(1)}%`}
            </p>
            <MiniTrendChart data={trend.data} unit={trend.unit} height={80} />
            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-px bg-primary inline-block" /> Actual
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-px bg-primary/50 inline-block border-t border-dashed border-primary" /> Projected
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-2"
      >
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mr-1">Filters:</span>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as PredictiveAlert['type'] | 'all')}
          className="text-xs bg-primary/[0.06] border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-primary/40 cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="trend_decline">Trend Decline</option>
          <option value="anomaly">Anomaly</option>
          <option value="forecast">Forecast</option>
          <option value="correlation">Correlation</option>
          <option value="threshold">Threshold</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PredictiveAlert['status'] | 'all')}
          className="text-xs bg-primary/[0.06] border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-primary/40 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>

        {(severityFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setSeverityFilter('all')
              setTypeFilter('all')
              setStatusFilter('all')
            }}
            className="text-xs text-primary hover:underline cursor-pointer ml-1"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {sorted.length} alert{sorted.length !== 1 ? 's' : ''}
        </span>
      </motion.div>

      {/* Main content: Alert Cards + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Cards */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence mode="popLayout">
            {sorted.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isExpanded={expandedId === alert.id}
                onToggle={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
              />
            ))}
          </AnimatePresence>

          {sorted.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-premium p-12 text-center"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No alerts match your current filters.</p>
            </motion.div>
          )}
        </div>

        {/* Alert Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-5"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Alert Timeline</h3>
          <div className="space-y-0">
            {timeline.map((alert, i) => (
              <div key={alert.id} className={cn(i === timeline.length - 1 && '[&_.absolute]:hidden')}>
                <TimelineEntry alert={alert} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
