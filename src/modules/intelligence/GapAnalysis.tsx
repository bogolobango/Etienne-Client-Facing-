import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Download, Loader2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { useLocationStore } from '@/stores/useLocationStore'
import { buildAnalystContext } from '@/lib/build-analyst-context'
import { computeContext } from '@/lib/ai-context'
import { INDUSTRY_BENCHMARKS } from '@/data/benchmarks'

function ReportRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead>{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
        th: ({ children }) => (
          <th className="text-left p-3 border-b border-border text-muted-foreground font-medium bg-primary/[0.03]">{children}</th>
        ),
        td: ({ children }) => (
          <td className="p-3 border-b border-border/50 text-foreground">{children}</td>
        ),
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-foreground mt-6 mb-3 pb-2 border-b border-primary/20">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold text-foreground mt-5 mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h3>
        ),
        strong: ({ children }) => (
          <strong className="text-foreground font-semibold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-muted-foreground">{children}</em>
        ),
        p: ({ children }) => (
          <p className="text-sm text-foreground/90 leading-relaxed mb-3">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-1.5 mb-3 ml-1 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm text-foreground/90 ml-4">{children}</li>
        ),
        hr: () => <hr className="my-6 border-border" />,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary pl-4 my-3 text-muted-foreground italic">{children}</blockquote>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-') || (typeof children === 'string' && children.includes('\n'))
          if (isBlock) {
            return (
              <pre className="bg-primary/[0.06] rounded-lg p-4 overflow-x-auto my-3">
                <code className="text-sm font-mono text-foreground/80 whitespace-pre">{children}</code>
              </pre>
            )
          }
          return <code className="text-xs bg-muted/50 text-primary px-1.5 py-0.5 rounded font-mono">{children}</code>
        },
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function buildLocalReport(selectedLocation: string): string {
  const ctx = computeContext(selectedLocation)
  const sorted = [...ctx.byLocation].sort((a, b) => b.revenue - a.revenue)
  const worst = sorted[sorted.length - 1]
  const best = sorted[0]
  const noShowLoss = ctx.totalRevenue * (ctx.avgNoShow / 100)
  const utilGap = ctx.totalRevenue * ((INDUSTRY_BENCHMARKS.utilizationRate.topPerformer - ctx.avgUtil) / 100) * 0.5
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)

  return `# Cross-Location Intelligence Report

## Prepared for: GlowUp Aesthetics
## Date: ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
## Prepared by: Etienne Agency

---

## Executive Summary

We analyzed 30 days of operational data across your ${ctx.byLocation.length} locations. **Key finding: ${worst.name} is underperforming by an estimated $${Math.round((best.revenue - worst.revenue) * 0.4).toLocaleString()}/month** relative to your top performer (${best.name}). Total revenue gaps identified across all locations: **$${Math.round(noShowLoss + utilGap).toLocaleString()}/month**.

## Location Performance Comparison

| Metric | ${ctx.byLocation.map(l => l.name).join(' | ')} | Variance |
|--------|${ctx.byLocation.map(() => '------').join('|')}|----------|
| Revenue/month | ${ctx.byLocation.map(l => `$${l.revenue.toLocaleString()}`).join(' | ')} | $${(best.revenue - worst.revenue).toLocaleString()} |
| No-show rate | ${ctx.byLocation.map(l => `${l.noShowRate.toFixed(1)}%`).join(' | ')} | ${(Math.max(...ctx.byLocation.map(l => l.noShowRate)) - Math.min(...ctx.byLocation.map(l => l.noShowRate))).toFixed(1)}% |
| Utilization % | ${ctx.byLocation.map(l => `${l.utilization.toFixed(1)}%`).join(' | ')} | ${(Math.max(...ctx.byLocation.map(l => l.utilization)) - Math.min(...ctx.byLocation.map(l => l.utilization))).toFixed(1)}% |
| Rebook rate | ${ctx.byLocation.map(l => `${l.rebookingRate.toFixed(1)}%`).join(' | ')} | ${(Math.max(...ctx.byLocation.map(l => l.rebookingRate)) - Math.min(...ctx.byLocation.map(l => l.rebookingRate))).toFixed(1)}% |
| New clients | ${ctx.byLocation.map(l => String(l.newClients)).join(' | ')} | ${Math.max(...ctx.byLocation.map(l => l.newClients)) - Math.min(...ctx.byLocation.map(l => l.newClients))} |

## Revenue Gaps Identified

### 1. No-Show Revenue Leakage
**Affected**: ${[...ctx.byLocation].sort((a, b) => b.noShowRate - a.noShowRate).slice(0, 2).map(l => l.name).join(', ')}
**Impact**: ~$${Math.round(noShowLoss).toLocaleString()}/month

Your network-wide no-show rate is ${ctx.avgNoShow.toFixed(1)}%. ${[...ctx.byLocation].sort((a, b) => b.noShowRate - a.noShowRate)[0].name} is the worst at ${[...ctx.byLocation].sort((a, b) => b.noShowRate - a.noShowRate)[0].noShowRate.toFixed(1)}%.

**Recommendation**: Deploy tiered deposit requirements for new clients at high-no-show locations. Implement 48h + 24h + 2h reminder sequences. Expected recovery: 30-40% of no-show losses.

### 2. Utilization Gap
**Affected**: ${[...ctx.byLocation].sort((a, b) => a.utilization - b.utilization).slice(0, 2).map(l => l.name).join(', ')}
**Impact**: ~$${Math.round(utilGap).toLocaleString()}/month

Your average utilization is ${ctx.avgUtil.toFixed(1)}% vs the top-performer benchmark of ${INDUSTRY_BENCHMARKS.utilizationRate.topPerformer}%. Closing this gap represents the largest single revenue opportunity.

**Recommendation**: Launch targeted midweek promotions at underutilized locations. Cross-promote between geographically adjacent centers. Expected uplift: 5-8% utilization improvement within 60 days.

### 3. Rebooking Rate Variance
**Affected**: ${[...ctx.byLocation].sort((a, b) => a.rebookingRate - b.rebookingRate).slice(0, 2).map(l => l.name).join(', ')}
**Impact**: ~$${Math.round(ctx.totalRevenue * 0.06).toLocaleString()}/month

Your rebook rate (${ctx.avgRebook.toFixed(1)}%) varies significantly across locations. ${best.name} leads at ${best.rebookingRate.toFixed(1)}% while ${worst.name} lags at ${worst.rebookingRate.toFixed(1)}%.

**Recommendation**: Standardize the rebooking protocol from ${best.name} across all locations. Enable checkout rebooking prompts. Train providers on consultation-to-rebook conversion.

## Industry Benchmarks

Your performance vs. industry averages (AmSpa 2024/2025, Zenoti Benchmark Report):

| Metric | GlowUp Avg | Industry Avg | Top Performers | Status |
|--------|-----------|-------------|----------------|--------|
| No-show rate | ${ctx.avgNoShow.toFixed(1)}% | ${INDUSTRY_BENCHMARKS.noShowRate.avg}% | ${INDUSTRY_BENCHMARKS.noShowRate.topPerformer}% | ${ctx.avgNoShow <= INDUSTRY_BENCHMARKS.noShowRate.avg ? '**Above avg**' : 'Below avg'} |
| Utilization | ${ctx.avgUtil.toFixed(1)}% | ${INDUSTRY_BENCHMARKS.utilizationRate.avg}% | ${INDUSTRY_BENCHMARKS.utilizationRate.topPerformer}% | ${ctx.avgUtil >= INDUSTRY_BENCHMARKS.utilizationRate.avg ? '**Above avg**' : 'Below avg'} |
| Rebook rate | ${ctx.avgRebook.toFixed(1)}% | ${INDUSTRY_BENCHMARKS.rebookingRate.avg}% | ${INDUSTRY_BENCHMARKS.rebookingRate.topPerformer}% | ${ctx.avgRebook >= INDUSTRY_BENCHMARKS.rebookingRate.avg ? '**Above avg**' : 'Below avg'} |

## 90-Day Action Plan

1. **Week 1-2**: Deploy no-show deposits at ${[...ctx.byLocation].sort((a, b) => b.noShowRate - a.noShowRate)[0].name} (+$${Math.round(noShowLoss * 0.15).toLocaleString()}/mo)
2. **Week 2-3**: Standardize rebooking protocol from ${best.name} (+$${Math.round(ctx.totalRevenue * 0.02).toLocaleString()}/mo)
3. **Week 3-4**: Launch midweek utilization campaigns (+$${Math.round(utilGap * 0.15).toLocaleString()}/mo)
4. **Month 2**: Implement tiered reminder sequences across all locations
5. **Month 2-3**: Cross-location marketing for adjacent centers
6. **Month 3**: Review and optimize — target ${INDUSTRY_BENCHMARKS.utilizationRate.topPerformer}% utilization benchmark

**Estimated total impact at 90 days: $${Math.round((noShowLoss * 0.3 + utilGap * 0.25 + ctx.totalRevenue * 0.02)).toLocaleString()}/month**

## Methodology

Data sourced from Zenoti via API integration. Analysis period: ${thirtyDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Metrics computed by Etienne Intelligence Platform. Industry benchmarks from AmSpa 2024 Medical Spa State of the Industry Report, Zenoti 2025 Benchmark Report, and Phorest (5,000+ locations).

---

*Prepared by Etienne Agency — Cross-location operational intelligence for multi-location med spas and healthcare practices.*`
}

export function GapAnalysis() {
  const { selectedLocation } = useLocationStore()
  const [report, setReport] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [useAI, setUseAI] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  const generateReport = useCallback(async () => {
    setIsGenerating(true)
    setReport('')

    try {
      const { metrics, locations } = buildAnalystContext(selectedLocation)
      const benchmarks = JSON.stringify(INDUSTRY_BENCHMARKS, null, 2)

      const abortController = new AbortController()
      abortRef.current = abortController

      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: 'GlowUp Aesthetics',
          metrics,
          locations,
          benchmarks,
        }),
        signal: abortController.signal,
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setReport(accumulated)
      }

      setUseAI(true)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setIsGenerating(false)
        return
      }

      console.warn('Claude API unavailable for report generation, using local template:', error)
      setUseAI(false)
      const localReport = buildLocalReport(selectedLocation)
      setReport(localReport)
    }

    setIsGenerating(false)
  }, [selectedLocation])

  const handleDownload = useCallback(() => {
    if (!report) return
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gap-analysis-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [report])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/intelligence" className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Gap Analysis Report</h1>
          </div>
          <p className="text-muted-foreground mt-0.5">Cross-location intelligence report — $2,500 deliverable</p>
        </div>
        {report && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download .md
          </button>
        )}
      </div>

      {!report && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 text-center"
        >
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Generate Gap Analysis</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Analyze all location data and generate a comprehensive cross-location intelligence report
            with revenue gaps, industry benchmarks, and a 90-day action plan.
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={generateReport}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Report
            </button>
            <p className="text-xs text-muted-foreground">
              Uses Claude AI when available, with local data fallback
            </p>
          </div>
        </motion.div>
      )}

      {isGenerating && !report && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-premium p-8 text-center"
        >
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Generating gap analysis report...</p>
        </motion.div>
      )}

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              {useAI ? 'Generated by Claude AI' : 'Generated from local data'}
            </span>
            {isGenerating && <Loader2 className="w-3 h-3 text-primary animate-spin ml-auto" />}
          </div>
          <div className="prose prose-sm max-w-none">
            <ReportRenderer content={report} />
          </div>
        </motion.div>
      )}

      {report && !isGenerating && (
        <div className="flex gap-3">
          <button
            onClick={generateReport}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
              'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          >
            <Sparkles className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      )}
    </div>
  )
}
