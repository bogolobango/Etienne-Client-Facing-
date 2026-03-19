import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  Play,
  Pause,
  Eye,
  Pencil,
  Plus,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Target,
  BarChart3,
  Users,
  ListChecks,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, formatCurrency } from '@/lib/utils'
import { useLocationStore } from '@/stores/useLocationStore'
import {
  scheduledReports,
  reportHistory,
  currentWeeklyBrief,
} from '@/data/reports-data'
import type { ReportHistory } from '@/data/reports-data'

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const typeBadge: Record<string, { label: string; className: string }> = {
  weekly_brief: { label: 'Weekly', className: 'bg-blue-500/15 text-blue-400' },
  monthly_deep_dive: { label: 'Monthly', className: 'bg-violet-500/15 text-violet-400' },
  quarterly_review: { label: 'Quarterly', className: 'bg-amber-500/15 text-amber-400' },
  custom: { label: 'Custom', className: 'bg-emerald-500/15 text-emerald-400' },
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500',
  paused: 'bg-amber-500',
  draft: 'bg-zinc-500',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function WeeklyBriefPreview() {
  const brief = currentWeeklyBrief
  const completedActions = brief.actionProgress.filter((a) => a.status === 'completed').length
  const totalActions = brief.actionProgress.length

  return (
    <motion.div variants={fadeUp} className="card-premium overflow-hidden">
      {/* Email-style header */}
      <div className="bg-primary/[0.08] border-b border-primary/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Latest Report Preview</p>
            <h3 className="text-sm font-semibold text-foreground">
              Weekly Intelligence Brief &mdash; {formatDateShort(brief.periodStart)}&ndash;{formatDateShort(brief.periodEnd)}, 2026
            </h3>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium bg-primary/[0.06] px-2 py-1 rounded">
          Preview
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Wins */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Wins This Week
          </h4>
          <ul className="space-y-2">
            {brief.wins.map((win, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                {win}
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Concerns
          </h4>
          <ul className="space-y-2">
            {brief.concerns.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Top Opportunities */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5" /> Top Opportunities
          </h4>
          <div className="space-y-2">
            {brief.topOpportunities.map((opp, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{opp.title}</span>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatCurrency(opp.impact)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Progress */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <ListChecks className="w-3.5 h-3.5" /> Action Progress ({completedActions}/{totalActions})
          </h4>
          <div className="mb-3">
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedActions / totalActions) * 100}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            {brief.actionProgress.map((a, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                {a.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {a.status === 'in_progress' && <Clock className="w-4 h-4 text-blue-400 shrink-0" />}
                {a.status === 'not_started' && (
                  <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
                )}
                <span className={cn('text-foreground/90', a.status === 'completed' && 'line-through text-muted-foreground')}>
                  {a.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmark Movement */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" /> Benchmark Movement
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {brief.benchmarkMovement.map((bm, i) => {
              const isLowerBetter = bm.metric === 'No-Show Rate' || bm.metric === 'Response Time (min)'
              const delta = bm.current - bm.previous
              const improved = isLowerBetter ? delta < 0 : delta > 0

              return (
                <div key={i} className="p-3 rounded-lg border border-border bg-primary/[0.03]">
                  <p className="text-xs text-muted-foreground mb-1">{bm.metric}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-foreground">{bm.current}</span>
                    {improved ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={cn('text-xs font-medium', improved ? 'text-emerald-400' : 'text-red-400')}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2 w-full h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${bm.percentile}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{bm.percentile}th percentile</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Location Highlights */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Location Highlights
          </h4>
          <div className="space-y-2">
            {brief.locationHighlights.map((loc, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-primary/[0.03]">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {loc.locationName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{loc.locationName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{loc.highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ScheduledReportsTable() {
  return (
    <motion.div variants={fadeUp} className="card-premium overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Scheduled Reports</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Manage automated report delivery</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Report</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Frequency</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Next Delivery</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Recipients</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduledReports.map((rpt) => {
              const badge = typeBadge[rpt.type] ?? typeBadge.custom
              return (
                <tr key={rpt.id} className="border-b border-border/50 hover:bg-primary/[0.03] transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground">{rpt.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', badge.className)}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground capitalize">{rpt.frequency.replace('_', ' ')}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{formatDate(rpt.nextDelivery)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', statusColors[rpt.status])} />
                      <span className="text-foreground capitalize">{rpt.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {rpt.recipients.slice(0, 2).map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] bg-primary/[0.08] text-muted-foreground rounded-full px-2 py-0.5"
                        >
                          <Users className="w-3 h-3" />
                          {r.split('@')[0]}
                        </span>
                      ))}
                      {rpt.recipients.length > 2 && (
                        <span className="text-[11px] text-muted-foreground">+{rpt.recipients.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors">
                        {rpt.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function ReportHistoryTimeline() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <motion.div variants={fadeUp} className="card-premium p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-1">Report History</h3>
      <p className="text-xs text-muted-foreground mb-5">Previously delivered intelligence reports</p>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-4">
          {reportHistory.map((entry: ReportHistory) => {
            const isExpanded = expandedId === entry.id
            const changePositive = entry.metrics.revenueChange > 0

            return (
              <div key={entry.id} className="relative pl-10">
                {/* Dot on timeline */}
                <div className="absolute left-2 top-3 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                <div
                  className={cn(
                    'rounded-lg border border-border p-4 transition-colors',
                    isExpanded ? 'bg-primary/[0.05]' : 'hover:bg-primary/[0.03]'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{formatDate(entry.deliveredAt)}</span>
                        <span className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded-full',
                          entry.type.includes('Weekly') ? 'bg-blue-500/15 text-blue-400' :
                          entry.type.includes('Monthly') ? 'bg-violet-500/15 text-violet-400' :
                          'bg-amber-500/15 text-amber-400'
                        )}>
                          {entry.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateShort(entry.periodStart)} &ndash; {formatDateShort(entry.periodEnd)}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {entry.highlights.slice(0, isExpanded ? undefined : 2).map((h, i) => (
                          <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                            <span className="text-primary mt-1.5 shrink-0 w-1 h-1 rounded-full bg-primary" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(entry.metrics.revenue)}</p>
                      <p className={cn('text-xs font-medium', changePositive ? 'text-emerald-400' : 'text-red-400')}>
                        {changePositive ? '+' : ''}{entry.metrics.revenueChange}%
                      </p>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                    >
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Top Opportunity</p>
                        <p className="text-sm text-foreground mt-0.5">{entry.metrics.topOpportunity}</p>
                        <p className="text-xs text-primary font-medium">{formatCurrency(entry.metrics.topOpportunityValue)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Actions</p>
                        <p className="text-sm text-foreground mt-0.5">
                          {entry.metrics.actionsCompleted}/{entry.metrics.actionsTotal} completed
                        </p>
                        <div className="mt-1 w-full h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(entry.metrics.actionsCompleted / entry.metrics.actionsTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Period Revenue</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{formatCurrency(entry.metrics.revenue)}</p>
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="mt-3 text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? (
                      <>Collapse <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>View Full Report <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

function ReportBuilderCTA() {
  const sections = [
    { id: 'revenue_summary', label: 'Revenue Summary', icon: DollarSign, checked: true },
    { id: 'gap_analysis', label: 'Gap Analysis', icon: Target, checked: true },
    { id: 'benchmarks', label: 'Benchmark Comparison', icon: BarChart3, checked: true },
    { id: 'provider_rankings', label: 'Provider Rankings', icon: Users, checked: false },
    { id: 'action_plan', label: 'Action Plan', icon: ListChecks, checked: false },
  ]

  return (
    <motion.div variants={fadeUp} className="card-premium overflow-hidden">
      <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Create Custom Report</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Build a tailored intelligence report by selecting the sections most relevant to your team.
          </p>
          <div className="space-y-2">
            {sections.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                    s.checked
                      ? 'bg-primary border-primary'
                      : 'border-border'
                  )}
                >
                  {s.checked && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                </div>
                <s.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{s.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="lg:w-64 flex flex-col items-center gap-3">
          <div className="w-full h-40 rounded-lg border border-dashed border-primary/30 bg-primary/[0.03] flex flex-col items-center justify-center text-center p-4">
            <FileText className="w-8 h-8 text-primary/40 mb-2" />
            <p className="text-xs text-muted-foreground">Report preview will appear here</p>
          </div>
          <button className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Create Report
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function AutomatedReports() {
  const { selectedLocation: _selectedLocation } = useLocationStore()

  return (
    <motion.div
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link
          to="/intelligence"
          className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Intelligence Reports</h1>
          <p className="text-muted-foreground mt-0.5">Automated insights delivered to your inbox</p>
        </div>
      </motion.div>

      {/* 1 — Weekly Brief Preview (Hero) */}
      <WeeklyBriefPreview />

      {/* 2 — Scheduled Reports Table */}
      <ScheduledReportsTable />

      {/* 3 — Report History Timeline */}
      <ReportHistoryTimeline />

      {/* 4 — Report Builder CTA */}
      <ReportBuilderCTA />
    </motion.div>
  )
}
