import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Zap,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CircleDot,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ZAxis,
} from 'recharts'
import { cn, formatCurrency } from '@/lib/utils'
import { useLocationStore } from '@/stores/useLocationStore'
import { locations } from '@/data/seed'
import { revenueOpportunities, type RevenueOpportunity } from '@/data/revenue-opportunities'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type OpportunityType = RevenueOpportunity['type']
type Confidence = RevenueOpportunity['confidence']

const TYPE_LABELS: Record<OpportunityType, string> = {
  no_show_recovery: 'No-Show',
  rebook_gap: 'Rebook',
  utilization_gap: 'Utilization',
  pricing_optimization: 'Pricing',
  service_mix: 'Service Mix',
  cross_sell: 'Cross-Sell',
}

const TYPE_COLORS: Record<OpportunityType, string> = {
  no_show_recovery: '#ef4444',
  rebook_gap: '#f59e0b',
  utilization_gap: '#8b5cf6',
  pricing_optimization: '#10b981',
  service_mix: '#3b82f6',
  cross_sell: '#ec4899',
}

const TYPE_BG: Record<OpportunityType, string> = {
  no_show_recovery: 'bg-red-500/10 text-red-400 border-red-500/20',
  rebook_gap: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  utilization_gap: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  pricing_optimization: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  service_mix: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cross_sell: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
}

const CONFIDENCE_CONFIG: Record<Confidence, { label: string; color: string; icon: typeof ShieldCheck }> = {
  high: { label: 'High', color: 'text-emerald-400', icon: ShieldCheck },
  medium: { label: 'Medium', color: 'text-amber-400', icon: CircleDot },
  low: { label: 'Low', color: 'text-red-400', icon: AlertTriangle },
}

const EFFORT_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Low Effort', color: 'text-emerald-400' },
  medium: { label: 'Med Effort', color: 'text-amber-400' },
  high: { label: 'High Effort', color: 'text-red-400' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  in_review: { label: 'In Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  implementing: { label: 'Implementing', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  implemented: { label: 'Implemented', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  dismissed: { label: 'Dismissed', color: 'bg-muted text-muted-foreground border-border' },
}

const EFFORT_NUMERIC: Record<string, number> = { low: 1, medium: 2, high: 3 }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RevenueEngine() {
  const { selectedLocation } = useLocationStore()

  // Local state for opportunity statuses
  const [statusOverrides, setStatusOverrides] = useState<Record<string, RevenueOpportunity['status']>>({})

  // Filters
  const [typeFilter, setTypeFilter] = useState<OpportunityType | 'all'>('all')
  const [confidenceFilter, setConfidenceFilter] = useState<Confidence | 'all'>('all')

  // Build merged opportunities with local overrides
  const opportunities = useMemo(() => {
    return revenueOpportunities.map((opp) => ({
      ...opp,
      status: statusOverrides[opp.id] ?? opp.status,
    }))
  }, [statusOverrides])

  // Location filter
  const locationFiltered = useMemo(() => {
    if (selectedLocation === 'all') return opportunities
    return opportunities.filter((o) => o.locationId === selectedLocation)
  }, [opportunities, selectedLocation])

  // Active (not dismissed, not implemented)
  const activeOpps = useMemo(() => locationFiltered.filter((o) => o.status !== 'dismissed' && o.status !== 'implemented'), [locationFiltered])

  // Apply type and confidence filters
  const filteredOpps = useMemo(() => {
    let result = activeOpps
    if (typeFilter !== 'all') result = result.filter((o) => o.type === typeFilter)
    if (confidenceFilter !== 'all') result = result.filter((o) => o.confidence === confidenceFilter)
    return result.sort((a, b) => b.estimatedImpact - a.estimatedImpact)
  }, [activeOpps, typeFilter, confidenceFilter])

  // Implemented opportunities
  const implementedOpps = useMemo(() => locationFiltered.filter((o) => o.status === 'implemented'), [locationFiltered])

  // Totals
  const totalRecoverable = activeOpps.reduce((s, o) => s + o.estimatedImpact, 0)

  // Breakdown by type for pie chart
  const typeBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    for (const o of activeOpps) {
      map[o.type] = (map[o.type] || 0) + o.estimatedImpact
    }
    return Object.entries(map).map(([type, value]) => ({
      name: TYPE_LABELS[type as OpportunityType],
      value,
      type: type as OpportunityType,
    }))
  }, [activeOpps])

  // Scatter data for impact vs effort
  const scatterData = useMemo(() => {
    return activeOpps.map((o) => ({
      x: EFFORT_NUMERIC[o.effort],
      y: o.estimatedImpact,
      z: 200,
      id: o.id,
      title: o.title,
      confidence: o.confidence,
      type: o.type,
    }))
  }, [activeOpps])

  // Handlers
  const handleStatusChange = (id: string, status: RevenueOpportunity['status']) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-foreground">Revenue Intelligence Engine</h1>
        <p className="text-muted-foreground mt-1">AI-identified opportunities ranked by estimated impact</p>
      </motion.div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-premium p-6"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Left: Big number */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Identified Revenue Opportunities
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{formatCurrency(totalRecoverable)}</span>
              <span className="text-lg text-muted-foreground">/mo</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Across {activeOpps.length} active opportunities
              {selectedLocation !== 'all' && (
                <> at <span className="text-foreground font-medium">{locations.find((l) => l.id === selectedLocation)?.name}</span></>
              )}
            </p>
          </div>

          {/* Right: Donut chart */}
          <div className="w-full lg:w-[280px] h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {typeBreakdown.map((entry) => (
                    <Cell key={entry.type} fill={TYPE_COLORS[entry.type]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="card-premium p-3 text-sm">
                        <p className="text-foreground font-medium">{d.name}</p>
                        <p className="text-muted-foreground">{formatCurrency(d.value)}/mo</p>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
          {typeBreakdown.map((entry) => (
            <div key={entry.type} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS[entry.type] }} />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="text-foreground font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Type filters */}
        <div className="flex flex-wrap gap-2">
          <FilterButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
            All Types
          </FilterButton>
          {(Object.entries(TYPE_LABELS) as [OpportunityType, string][]).map(([type, label]) => (
            <FilterButton key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)}>
              {label}
            </FilterButton>
          ))}
        </div>

        {/* Confidence filters */}
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <FilterButton active={confidenceFilter === 'all'} onClick={() => setConfidenceFilter('all')}>
            All Confidence
          </FilterButton>
          {(['high', 'medium', 'low'] as Confidence[]).map((c) => (
            <FilterButton key={c} active={confidenceFilter === c} onClick={() => setConfidenceFilter(c)}>
              {CONFIDENCE_CONFIG[c].label}
            </FilterButton>
          ))}
        </div>
      </motion.div>

      {/* Opportunity Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredOpps.map((opp, i) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              index={i}
              onImplement={() => handleStatusChange(opp.id, 'implemented')}
              onDismiss={() => handleStatusChange(opp.id, 'dismissed')}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredOpps.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-premium p-12 text-center"
        >
          <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No opportunities match the current filters.</p>
        </motion.div>
      )}

      {/* Impact vs Effort Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-premium p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Impact vs Effort Matrix</h2>
            <p className="text-sm text-muted-foreground">Prioritize high-impact, low-effort opportunities first</p>
          </div>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0.5, 3.5]}
                ticks={[1, 2, 3]}
                tickFormatter={(v) => ['', 'Low', 'Medium', 'High'][v] || ''}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: 'Effort', position: 'bottom', offset: 10, fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                label={{ value: 'Monthly Impact', angle: -90, position: 'insideLeft', offset: -5, fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <ZAxis dataKey="z" range={[120, 120]} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="card-premium p-3 text-sm max-w-[240px]">
                      <p className="text-foreground font-medium leading-tight">{d.title}</p>
                      <p className="text-muted-foreground mt-1">{formatCurrency(d.y)}/mo</p>
                      <p className="text-muted-foreground">Confidence: {d.confidence}</p>
                    </div>
                  )
                }}
              />
              {/* Render scatter points grouped by confidence for color coding */}
              <Scatter
                data={scatterData.filter((d) => d.confidence === 'high')}
                fill="#10b981"
                fillOpacity={0.8}
              />
              <Scatter
                data={scatterData.filter((d) => d.confidence === 'medium')}
                fill="#f59e0b"
                fillOpacity={0.8}
              />
              <Scatter
                data={scatterData.filter((d) => d.confidence === 'low')}
                fill="#ef4444"
                fillOpacity={0.8}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter legend */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Confidence:</span>
          {[
            { label: 'High', color: '#10b981' },
            { label: 'Medium', color: '#f59e0b' },
            { label: 'Low', color: '#ef4444' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Implemented Tracker */}
      {implementedOpps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-premium p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Implemented Opportunities</h2>
              <p className="text-sm text-muted-foreground">Tracking actual impact vs estimated projections</p>
            </div>
          </div>

          <div className="space-y-4">
            {implementedOpps.map((opp) => {
              const accuracy = opp.actualImpact ? Math.round((opp.actualImpact / opp.estimatedImpact) * 100) : null
              return (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', TYPE_BG[opp.type])}>
                          {TYPE_LABELS[opp.type]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {locations.find((l) => l.id === opp.locationId)?.name}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{opp.title}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-0.5">Estimated</p>
                        <p className="text-foreground font-medium">{formatCurrency(opp.estimatedImpact)}/mo</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-0.5">Actual</p>
                        <p className="text-emerald-400 font-medium">
                          {opp.actualImpact ? `${formatCurrency(opp.actualImpact)}/mo` : 'Pending'}
                        </p>
                      </div>
                      {accuracy !== null && (
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-0.5">Accuracy</p>
                          <p className={cn('font-medium', accuracy >= 90 ? 'text-emerald-400' : accuracy >= 70 ? 'text-amber-400' : 'text-red-400')}>
                            {accuracy}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
        active
          ? 'bg-primary/10 text-primary border-primary/30'
          : 'bg-primary/[0.03] text-muted-foreground border-border hover:border-primary/20 hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

function OpportunityCard({
  opportunity: opp,
  index,
  onImplement,
  onDismiss,
}: {
  opportunity: RevenueOpportunity
  index: number
  onImplement: () => void
  onDismiss: () => void
}) {
  const confidenceCfg = CONFIDENCE_CONFIG[opp.confidence]
  const effortCfg = EFFORT_CONFIG[opp.effort]
  const statusCfg = STATUS_CONFIG[opp.status]
  const ConfidenceIcon = confidenceCfg.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="card-premium p-5 flex flex-col gap-4"
    >
      {/* Top row: badges + impact */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', TYPE_BG[opp.type])}>
            {TYPE_LABELS[opp.type]}
          </span>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', statusCfg.color)}>
            {statusCfg.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {locations.find((l) => l.id === opp.locationId)?.name}
          </span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-foreground">{formatCurrency(opp.estimatedImpact)}</p>
          <p className="text-xs text-muted-foreground">/month</p>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground leading-tight">{opp.title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">{opp.description}</p>

      {/* Data points */}
      <div className="flex flex-wrap gap-1.5">
        {opp.dataPoints.map((dp, i) => (
          <span
            key={i}
            className="text-xs px-2 py-1 rounded-md bg-primary/[0.06] text-foreground border border-primary/10"
          >
            {dp}
          </span>
        ))}
      </div>

      {/* Suggested action */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-foreground leading-relaxed">{opp.suggestedAction}</p>
      </div>

      {/* Bottom row: confidence, effort, actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <ConfidenceIcon className={cn('w-3.5 h-3.5', confidenceCfg.color)} />
            <span className={confidenceCfg.color}>{confidenceCfg.label} confidence</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className={cn('w-3.5 h-3.5', effortCfg.color)} />
            <span className={effortCfg.color}>{effortCfg.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/20 rounded-lg transition-all duration-200"
          >
            Dismiss
          </button>
          <button
            onClick={onImplement}
            className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition-all duration-200"
          >
            Implement
          </button>
        </div>
      </div>
    </motion.div>
  )
}
