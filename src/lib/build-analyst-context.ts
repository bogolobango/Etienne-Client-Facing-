import { computeContext, type ComputeContextData } from './ai-context'
import { INDUSTRY_BENCHMARKS } from '@/data/benchmarks'
import type { AnalyticsResult } from '@/lib/analytics/types'

/**
 * Build the context string sent to the AI Analyst API.
 *
 * When `analytics` is provided (pre-computed via useAnalytics), the context
 * includes leakage computations, at-risk clients, anomalies, provider
 * economics, and benchmark comparisons — dramatically improving response
 * quality. When omitted, falls back to basic metric aggregates.
 */
export function buildAnalystContext(
  selectedLocation: string,
  data?: ComputeContextData,
  analytics?: AnalyticsResult
) {
  const ctx = computeContext(selectedLocation, data)

  // ── 1. Top-line aggregates (~500 tokens) ──────────────────────────
  const topLine = {
    totalRevenue: ctx.totalRevenue,
    totalNormalizedRevenue: ctx.totalNormalizedRevenue,
    revenueDisaggregation: {
      serviceRevenue: ctx.revenueByType.service,
      packageRevenue: ctx.revenueByType.package,
      productRevenue: ctx.revenueByType.product,
      membershipRevenue: ctx.revenueByType.membership,
      giftcardRevenue: ctx.revenueByType.giftcard,
      packageDistortion: ctx.totalRevenue - ctx.totalNormalizedRevenue,
    },
    totalPackageBookings: ctx.totalPackageBookings,
    avgUtilization: ctx.avgUtil,
    avgNoShowRate: ctx.avgNoShow,
    avgRebookRate: ctx.avgRebook,
    totalBookings: ctx.totalBookings,
    totalNewClients: ctx.totalNewClients,
    industryBenchmarks: {
      noShowRate: `${INDUSTRY_BENCHMARKS.noShowRate.avg}% avg, ${INDUSTRY_BENCHMARKS.noShowRate.topPerformer}% top performer`,
      utilization: `${INDUSTRY_BENCHMARKS.utilizationRate.avg}% avg, ${INDUSTRY_BENCHMARKS.utilizationRate.topPerformer}% top performer`,
      rebookRate: `${INDUSTRY_BENCHMARKS.rebookingRate.avg}% avg, ${INDUSTRY_BENCHMARKS.rebookingRate.topPerformer}% top performer`,
      avgTicket: `$${INDUSTRY_BENCHMARKS.avgTicket.avg} avg, $${INDUSTRY_BENCHMARKS.avgTicket.topPerformer} top performer`,
    },
  }

  const metrics = JSON.stringify(topLine, null, 2)

  // ── 2. Per-location summary ──────────────────────────────────────
  const locations = ctx.byLocation
    .map(
      (c) =>
        `${c.name}: Revenue $${c.revenue.toLocaleString()}, No-shows ${c.noShowRate.toFixed(1)}%, Utilization ${c.utilization.toFixed(1)}%, Rebook ${c.rebookingRate.toFixed(1)}%, New Clients ${c.newClients}`
    )
    .join(' | ')

  // ── 3. Basic alerts ──────────────────────────────────────────────
  const basicAlerts = [
    ctx.avgNoShow > 15 ? `High no-show rate across network: ${ctx.avgNoShow.toFixed(1)}%` : null,
    ctx.avgUtil < 65 ? `Low utilization across network: ${ctx.avgUtil.toFixed(1)}%` : null,
    ...ctx.byLocation
      .filter((l) => l.noShowRate > 18)
      .map((l) => `${l.name} has critical no-show rate: ${l.noShowRate.toFixed(1)}%`),
    ...ctx.byLocation
      .filter((l) => l.utilization < 60)
      .map((l) => `${l.name} has low utilization: ${l.utilization.toFixed(1)}%`),
  ].filter(Boolean)

  // ── 4. Analytics-enriched context (when available) ───────────────
  let analyticsContext = ''

  if (analytics) {
    const sections: string[] = []

    // Leakage categories WITH computation strings (~600 tokens)
    if (analytics.leakage) {
      const leakageLines = analytics.leakage.categories.map(
        (c) => `- ${c.name} (${c.confidence} confidence): ${formatDollar(c.amount)} — ${c.computation}`
      )
      sections.push(
        `REVENUE LEAKAGE (Total: ${formatDollar(analytics.leakage.totalLeakage)}):\n${leakageLines.join('\n')}`
      )
    }

    // Top 5 at-risk clients (~300 tokens)
    if (analytics.cohorts?.atRiskClients?.length) {
      const atRisk = analytics.cohorts.atRiskClients.slice(0, 5)
      const lines = atRisk.map(
        (c) =>
          `- ${c.name}: CLV ${formatDollar(c.clv)}, last visit ${c.daysSinceLastVisit} days ago (avg interval: ${Math.round(c.avgInterval)} days), location: ${c.preferredLocation}`
      )
      sections.push(
        `AT-RISK CLIENTS (${analytics.cohorts.atRiskClients.length} total, showing top 5 by CLV):\n${lines.join('\n')}\nRetention rate: ${analytics.cohorts.retentionRate.toFixed(1)}%, Cross-location clients: ${analytics.cohorts.crossLocationClients}`
      )
    }

    // Top 3 anomalies (~300 tokens)
    if (analytics.anomalies?.anomalies?.length) {
      const topAnomalies = analytics.anomalies.anomalies
        .sort((a, b) => {
          const sev = { critical: 3, warning: 2, info: 1 }
          return (sev[b.severity] ?? 0) - (sev[a.severity] ?? 0)
        })
        .slice(0, 3)
      const lines = topAnomalies.map(
        (a) => `- [${a.severity.toUpperCase()}] ${a.locationName}: ${a.description}`
      )
      sections.push(`ANOMALIES DETECTED:\n${lines.join('\n')}`)
    }

    // Trend changes
    if (analytics.anomalies?.trends?.length) {
      const sigTrends = analytics.anomalies.trends
        .filter((t) => Math.abs(t.changePct) > 15)
        .slice(0, 5)
      if (sigTrends.length) {
        const lines = sigTrends.map(
          (t) => `- ${t.locationName} ${t.metric}: ${t.direction === 'up' ? '+' : ''}${t.changePct.toFixed(1)}% (${t.previous7Day.toFixed(1)} → ${t.current7Day.toFixed(1)})`
        )
        sections.push(`SIGNIFICANT TRENDS (7-day vs prior 7-day):\n${lines.join('\n')}`)
      }
    }

    // Revenue attribution summary (~400 tokens)
    if (analytics.revenueAttribution) {
      const ra = analytics.revenueAttribution
      const topServices = ra.byService.slice(0, 3).map((s) => `${s.service}: ${formatDollar(s.revenue)} (${s.pct.toFixed(1)}%)`).join(', ')
      const topProviders = ra.byProvider.slice(0, 3).map((p) => `${p.provider}: ${formatDollar(p.revenue)} (${p.pct.toFixed(1)}%)`).join(', ')
      sections.push(
        `REVENUE ATTRIBUTION:\nTop services: ${topServices}\nTop providers: ${topProviders}\nNew client revenue: ${formatDollar(ra.newClientRevenue)} | Returning: ${formatDollar(ra.returningClientRevenue)}\nPackage distortion (reported vs normalized): ${formatDollar(ra.packageDistortion)}`
      )
    }

    // Provider top/bottom by margin (~200 tokens)
    if (analytics.providerEconomics?.providers?.length) {
      const sorted = [...analytics.providerEconomics.providers].sort((a, b) => b.margin - a.margin)
      const top = sorted.slice(0, 2)
      const bottom = sorted.slice(-2)
      const fmt = (p: typeof sorted[0]) =>
        `${p.providerName} (${p.title}): margin ${formatDollar(p.margin)} (${p.marginPct.toFixed(0)}%), rev/hr ${formatDollar(p.revenuePerHour)}`
      sections.push(
        `PROVIDER ECONOMICS (ranked by margin, not revenue):\nTop: ${top.map(fmt).join(' | ')}\nBottom: ${bottom.map(fmt).join(' | ')}\nNetwork avg margin: ${analytics.providerEconomics.networkAvgMarginPct.toFixed(0)}%, avg rev/hr: ${formatDollar(analytics.providerEconomics.networkAvgRevPerHour)}`
      )
    }

    // Benchmark comparison (~300 tokens)
    if (analytics.benchmarks) {
      const b = analytics.benchmarks
      sections.push(
        `BENCHMARK COMPARISON (segment: ${b.segment}):\nNo-show: median ${b.noShowRate.median}%, top quartile ${b.noShowRate.top25}%\nUtilization: median ${b.utilizationRate.median}%, top quartile ${b.utilizationRate.top25}%\nRebook: median ${b.rebookingRate.median}%, top quartile ${b.rebookingRate.top25}%\nAvg ticket: median $${b.avgTicket.median}, top quartile $${b.avgTicket.top25}\nSource: ${b.source}`
      )
    }

    // Package distortion (~200 tokens)
    if (analytics.packages) {
      const pkg = analytics.packages
      sections.push(
        `PACKAGE ANALYTICS:\nTotal deferred revenue: ${formatDollar(pkg.totalDeferred)}\nOverall completion rate: ${pkg.overallCompletionRate.toFixed(0)}%\nAt-risk packages (stalled): ${pkg.atRiskPackages}`
      )
    }

    analyticsContext = '\n\n' + sections.join('\n\n')
  }

  const alerts = JSON.stringify(
    [
      ...basicAlerts,
      ...(analytics?.anomalies?.anomalies?.slice(0, 3).map((a) => a.description) ?? []),
    ],
    null,
    2
  )

  return { metrics: metrics + analyticsContext, locations, alerts }
}

function formatDollar(n: number): string {
  return '$' + Math.round(n).toLocaleString()
}
