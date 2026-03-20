import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  UserPlus,
  DollarSign,
  MapPin,
  Sparkles,
  ShieldCheck,
  Play,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  History,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Link } from 'react-router-dom'
import { useLocationStore } from '@/stores/useLocationStore'
import { useEIPData } from '@/contexts/EIPDataContext'
import { cn, formatCurrency } from '@/lib/utils'
import {
  scenarioTemplates,
  calculateScenario,
  type ScenarioTemplate,
  type ScenarioResult,
} from '@/data/simulator'

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------

const iconMap: Record<string, LucideIcon> = {
  Clock,
  UserPlus,
  DollarSign,
  MapPin,
  Sparkles,
  ShieldCheck,
}

// ---------------------------------------------------------------------------
// History entry
// ---------------------------------------------------------------------------

interface HistoryEntry {
  id: string
  templateName: string
  locationName: string
  netImpact: number
  runAt: Date
}

// ---------------------------------------------------------------------------
// Animated number
// ---------------------------------------------------------------------------

function AnimatedValue({
  value,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </motion.span>
  )
}

// ---------------------------------------------------------------------------
// Custom tooltip for chart
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-medium text-foreground">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WhatIfSimulator() {
  const { locations } = useEIPData()
  const { selectedLocation } = useLocationStore()

  const [activeTemplate, setActiveTemplate] = useState<ScenarioTemplate | null>(null)
  const [params, setParams] = useState<Record<string, number | string>>({})
  const [simLocation, setSimLocation] = useState<string>(
    selectedLocation === 'all' ? 'soho' : selectedLocation,
  )
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  // Select a template
  const handleSelect = useCallback((template: ScenarioTemplate) => {
    setActiveTemplate(template)
    setResult(null)
    const defaults: Record<string, number | string> = {}
    for (const p of template.parameters) {
      defaults[p.id] = p.defaultValue
    }
    setParams(defaults)
  }, [])

  // Update a parameter
  const handleParamChange = useCallback((id: string, value: number | string) => {
    setParams((prev) => ({ ...prev, [id]: value }))
  }, [])

  // Run simulation
  const handleRun = useCallback(() => {
    if (!activeTemplate) return
    setIsRunning(true)

    // Simulate a brief computation delay for realism
    setTimeout(() => {
      const locationId = params.location ? String(params.location) : simLocation
      const res = calculateScenario(activeTemplate.id, params, locationId)
      setResult(res)
      setIsRunning(false)

      const locName =
        locations.find((l) => l.id === locationId)?.name ?? 'All Locations'

      setHistory((prev) => [
        {
          id: `${Date.now()}`,
          templateName: activeTemplate.name,
          locationName: locName,
          netImpact: res.netImpact,
          runAt: new Date(),
        },
        ...prev,
      ])
    }, 800)
  }, [activeTemplate, params, simLocation, locations])

  // Reset
  const handleReset = useCallback(() => {
    setActiveTemplate(null)
    setResult(null)
    setParams({})
  }, [])

  // Build comparison chart data
  const comparisonData = result
    ? [
        {
          metric: 'Revenue',
          Current: result.currentState.monthlyRevenue,
          Projected: result.projectedState.monthlyRevenue,
        },
        {
          metric: 'Net Profit',
          Current: result.currentState.netProfit,
          Projected: result.projectedState.netProfit,
        },
        {
          metric: 'Staff Cost',
          Current: result.currentState.staffCost,
          Projected: result.projectedState.staffCost,
        },
      ]
    : []

  // Sensitivity analysis
  const sensitivity = result
    ? [
        { label: 'Worst Case', value: Math.round(result.netImpact * 0.8), color: 'text-red-400' },
        { label: 'Expected', value: result.netImpact, color: result.netImpact >= 0 ? 'text-emerald-400' : 'text-red-400' },
        { label: 'Best Case', value: Math.round(result.netImpact * 1.2), color: 'text-emerald-400' },
      ]
    : []

  const maxSensitivity = sensitivity.length
    ? Math.max(...sensitivity.map((s) => Math.abs(s.value)), 1)
    : 1

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex items-center gap-3">
        <Link
          to="/intelligence"
          className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">What-If Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Model business decisions before you make them
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Scenario Selector Grid                                           */}
      {/* ---------------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {!activeTemplate && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {scenarioTemplates.map((template) => {
              const Icon = iconMap[template.icon] ?? Sparkles
              return (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleSelect(template)}
                  className="card-premium p-5 text-left group cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/[0.08] text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------- */}
      {/* Active Scenario Panel                                            */}
      {/* ---------------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {activeTemplate && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-premium p-4 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = iconMap[activeTemplate.icon] ?? Sparkles
                    return (
                      <div className="p-2.5 rounded-xl bg-primary/[0.08] text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                    )
                  })()}
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {activeTemplate.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {activeTemplate.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Change scenario
                </button>
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location selector (when template doesn't have its own) */}
                {!activeTemplate.parameters.some((p) => p.id === 'location') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Location
                    </label>
                    <select
                      value={simLocation}
                      onChange={(e) => setSimLocation(e.target.value)}
                      className="w-full rounded-lg border border-border bg-primary/5 text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTemplate.parameters.map((param) => (
                  <div key={param.id} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      {param.label}
                      {param.unit && (
                        <span className="ml-1 text-muted-foreground/60">({param.unit})</span>
                      )}
                    </label>

                    {param.type === 'select' && param.options ? (
                      <select
                        value={String(params[param.id] ?? param.defaultValue)}
                        onChange={(e) => handleParamChange(param.id, e.target.value)}
                        className="w-full rounded-lg border border-border bg-primary/5 text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
                      >
                        {param.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : param.type === 'text' ? (
                      <input
                        type="text"
                        value={String(params[param.id] ?? param.defaultValue)}
                        onChange={(e) => handleParamChange(param.id, e.target.value)}
                        className="w-full rounded-lg border border-border bg-primary/5 text-foreground text-base sm:text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
                      />
                    ) : (
                      <input
                        type="number"
                        value={Number(params[param.id] ?? param.defaultValue)}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        onChange={(e) =>
                          handleParamChange(param.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-border bg-primary/5 text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Run button */}
              <button
                onClick={handleRun}
                disabled={isRunning}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isRunning
                    ? 'bg-primary/20 text-primary/60 cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
                )}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Results Dashboard                                               */}
            {/* -------------------------------------------------------------- */}
            <AnimatePresence>
              {result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5 mt-5"
                >
                  {/* Net Impact Hero */}
                  <div className="card-premium p-4 sm:p-6 text-center">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Projected Monthly Net Impact
                    </p>
                    <div
                      className={cn(
                        'text-4xl md:text-5xl font-bold',
                        result.netImpact >= 0 ? 'text-emerald-400' : 'text-red-400',
                      )}
                    >
                      <AnimatedValue
                        value={result.netImpact}
                        prefix={result.netImpact >= 0 ? '+$' : '-$'}
                      />
                      <span className="text-lg font-normal text-muted-foreground ml-1">
                        /mo
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
                          result.confidence === 'high'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : result.confidence === 'medium'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-red-500/10 text-red-400',
                        )}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)}{' '}
                        Confidence
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/[0.08] text-primary">
                        <Clock className="w-3 h-3" />
                        {result.timeToImpact}
                      </span>
                    </div>
                  </div>

                  {/* Side-by-Side Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current */}
                    <div className="card-premium p-5 space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Current State
                      </h3>
                      <MetricRow label="Monthly Revenue" value={formatCurrency(result.currentState.monthlyRevenue)} />
                      <MetricRow label="Utilization" value={`${result.currentState.utilization}%`} />
                      <MetricRow label="Appointments" value={result.currentState.appointments.toLocaleString()} />
                      <MetricRow label="Staff Cost" value={formatCurrency(result.currentState.staffCost)} />
                      <MetricRow label="Net Profit" value={formatCurrency(result.currentState.netProfit)} highlight />
                    </div>

                    {/* Projected */}
                    <div className="card-premium p-5 space-y-3 border-primary/20">
                      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                        Projected State
                      </h3>
                      <MetricRow
                        label="Monthly Revenue"
                        value={formatCurrency(result.projectedState.monthlyRevenue)}
                        delta={result.projectedState.monthlyRevenue - result.currentState.monthlyRevenue}
                      />
                      <MetricRow
                        label="Utilization"
                        value={`${result.projectedState.utilization}%`}
                        delta={result.projectedState.utilization - result.currentState.utilization}
                        isCurrency={false}
                        suffix="%"
                      />
                      <MetricRow
                        label="Appointments"
                        value={result.projectedState.appointments.toLocaleString()}
                        delta={result.projectedState.appointments - result.currentState.appointments}
                        isCurrency={false}
                      />
                      <MetricRow
                        label="Staff Cost"
                        value={formatCurrency(result.projectedState.staffCost)}
                        delta={result.projectedState.staffCost - result.currentState.staffCost}
                        invertColor
                      />
                      <MetricRow
                        label="Net Profit"
                        value={formatCurrency(result.projectedState.netProfit)}
                        delta={result.projectedState.netProfit - result.currentState.netProfit}
                        highlight
                      />
                    </div>
                  </div>

                  {/* Sensitivity Analysis */}
                  <div className="card-premium p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Sensitivity Analysis
                    </h3>
                    <div className="space-y-3">
                      {sensitivity.map((s) => (
                        <div key={s.label} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-24 shrink-0">
                            {s.label}
                          </span>
                          <div className="flex-1 h-6 bg-primary/5 rounded-full overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.max(4, (Math.abs(s.value) / maxSensitivity) * 100)}%`,
                              }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={cn(
                                'h-full rounded-full',
                                s.value >= 0
                                  ? 'bg-emerald-500/30'
                                  : 'bg-red-500/30',
                              )}
                            />
                          </div>
                          <span className={cn('text-sm font-semibold w-28 text-right', s.color)}>
                            {s.value >= 0 ? '+' : '-'}${Math.abs(s.value).toLocaleString()}/mo
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparison Bar Chart */}
                  <div className="card-premium p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Current vs Projected
                    </h3>
                    <div className="h-40 sm:h-56 md:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={comparisonData}
                          margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                        >
                          <XAxis
                            dataKey="metric"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="Current" radius={[4, 4, 0, 0]} maxBarSize={48}>
                            {comparisonData.map((_, i) => (
                              <Cell
                                key={`cur-${i}`}
                                fill="hsl(var(--muted-foreground))"
                                fillOpacity={0.3}
                              />
                            ))}
                          </Bar>
                          <Bar dataKey="Projected" radius={[4, 4, 0, 0]} maxBarSize={48}>
                            {comparisonData.map((_, i) => (
                              <Cell
                                key={`proj-${i}`}
                                fill="hsl(var(--primary))"
                                fillOpacity={0.7}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Assumptions & Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card-premium p-5 space-y-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Assumptions
                      </h3>
                      <ul className="space-y-2">
                        {result.assumptions.map((a, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="card-premium p-5 space-y-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Risks
                      </h3>
                      <ul className="space-y-2">
                        {result.risks.map((r, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-amber-400/40 mt-1.5 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------- */}
      {/* Scenario History                                                  */}
      {/* ---------------------------------------------------------------- */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-premium p-5 space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            Scenario History
          </h3>
          <div className="divide-y divide-border">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {entry.templateName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.locationName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      entry.netImpact >= 0 ? 'text-emerald-400' : 'text-red-400',
                    )}
                  >
                    {entry.netImpact >= 0 ? '+' : '-'}$
                    {Math.abs(entry.netImpact).toLocaleString()}/mo
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.runAt.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MetricRow sub-component
// ---------------------------------------------------------------------------

function MetricRow({
  label,
  value,
  delta,
  highlight,
  invertColor,
  isCurrency = true,
  suffix = '',
}: {
  label: string
  value: string
  delta?: number
  highlight?: boolean
  invertColor?: boolean
  isCurrency?: boolean
  suffix?: string
}) {
  const showDelta = delta !== undefined && delta !== 0
  const isPositive = invertColor ? delta! < 0 : delta! > 0

  return (
    <div
      className={cn(
        'flex items-center justify-between py-1.5',
        highlight && 'pt-3 border-t border-border',
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-medium',
            highlight ? 'text-foreground font-semibold' : 'text-foreground',
          )}
        >
          {value}
        </span>
        {showDelta && (
          <span
            className={cn(
              'text-xs font-medium flex items-center gap-0.5',
              isPositive ? 'text-emerald-400' : 'text-red-400',
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isCurrency
              ? `${delta! >= 0 ? '+' : ''}${formatCurrency(delta!)}`
              : `${delta! >= 0 ? '+' : ''}${delta!.toFixed(1)}${suffix}`}
          </span>
        )}
      </div>
    </div>
  )
}
