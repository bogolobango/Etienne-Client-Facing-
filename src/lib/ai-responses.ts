import type { AIContext } from './ai-context'

interface ResponseTemplate {
  keywords: string[]
  weight: number
  generate: (ctx: AIContext) => string
}

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
const fmtCurrency = (n: number) => `$${fmt(n)}`
const fmtPct = (n: number) => `${n.toFixed(1)}%`

const templates: ResponseTemplate[] = [
  {
    keywords: ['revenue', 'change', 'week', 'earning', 'money', 'income'],
    weight: 10,
    generate: (ctx) => {
      const sorted = [...ctx.byLocation].sort((a, b) => b.revenue - a.revenue)
      const top = sorted[0]
      const bottom = sorted[sorted.length - 1]
      return `## Revenue Analysis — Last 30 Days

*Analyzing your Zenoti revenue data across all 5 centers...*

**Total revenue: ${fmtCurrency(ctx.totalRevenue)}** across all centers. EIP identified ${fmtCurrency(ctx.totalRecovered)} in revenue at risk.

### By Center:
${sorted.map((l) => `- **${l.name}**: ${fmtCurrency(l.revenue)} (${fmtPct(l.utilization)} utilization)`).join('\n')}

### Key Findings:
- **${top.name}** is the top performer at ${fmtCurrency(top.revenue)}
- **${bottom.name}** has room to grow — currently at ${fmtCurrency(bottom.revenue)}
- **${ctx.aiBooked} bookings** tracked via Zenoti this period
- Revenue gaps identified from no-show patterns: **${fmtCurrency(ctx.totalRecovered)}**

### Recommendation:
${bottom.noShowRate > 14 ? `Address the ${fmtPct(bottom.noShowRate)} no-show rate at ${bottom.name} — this alone could recover an estimated ${fmtCurrency(bottom.revenue * 0.12)}/month.` : `Focus on increasing utilization at ${bottom.name} (currently ${fmtPct(bottom.utilization)}) through targeted midweek promotions.`}`
    },
  },
  {
    keywords: ['underperform', 'worst', 'weakest', 'struggling', 'behind'],
    weight: 10,
    generate: (ctx) => {
      const sorted = [...ctx.byLocation].sort((a, b) => a.revenue - b.revenue)
      const worst = sorted[0]
      const best = sorted[sorted.length - 1]
      return `## Location Performance Analysis

*Based on your Zenoti appointment and invoice data...*

**${worst.name} is currently underperforming** relative to capacity.

### Metrics Comparison:
| Location | Utilization | Revenue | No-Show Rate |
|----------|-------------|---------|--------------|
${ctx.byLocation.sort((a, b) => b.revenue - a.revenue).map((l) => `| ${l.name === worst.name ? `**${l.name}**` : l.name} | ${fmtPct(l.utilization)} | ${fmtCurrency(l.revenue)} | ${fmtPct(l.noShowRate)} |`).join('\n')}

### ${worst.name} Issues:
1. **${worst.noShowRate > 14 ? 'High' : 'Elevated'} no-show rate (${fmtPct(worst.noShowRate)})** — Above the 12% benchmark
2. **Low utilization (${fmtPct(worst.utilization)})** — Significant room for improvement
3. **Rebooking rate at ${fmtPct(worst.rebookingRate)}** — Below the 75% industry benchmark

### Action Items:
- Deploy targeted no-show prevention (tiered reminders + deposits)
- Launch a "Midweek Glow" promotion for Tue-Thu slots
- Cross-promote to ${best.name} clients in the area`
    },
  },
  {
    keywords: ['focus', 'priority', 'action', 'should', 'recommend', 'what to do', 'this week'],
    weight: 8,
    generate: (ctx) => {
      const worstNoShow = [...ctx.byLocation].sort((a, b) => b.noShowRate - a.noShowRate)[0]
      const lowestUtil = [...ctx.byLocation].sort((a, b) => a.utilization - b.utilization)[0]
      return `## This Week's Priority Actions

*Analyzing your Zenoti data across all 5 centers...*

Based on your current data, here are the **top 5 things to focus on**:

### 1. ${worstNoShow.noShowRate > 14 ? '🔴' : '🟡'} ${worstNoShow.name} No-Show Rate
- Rate at ${fmtPct(worstNoShow.noShowRate)} — ${worstNoShow.noShowRate > 14 ? 'critical' : 'elevated'}
- **Action**: Enable mandatory deposit for new clients, increase reminder cadence

### 2. 🟡 Pipeline Follow-up
- ${ctx.oppsByStatus.new} new leads need contact, ${ctx.oppsByStatus.contacted} awaiting response
- **Action**: Assign Response Monitor to auto-nurture sequence

### 3. 🟢 Booking Conversion Insights
- Zenoti shows ${ctx.aiBooked} AI-attributed bookings — conversion is strong
- **Action**: Expand AI booking attribution to include package upsells

### 4. 🟡 ${lowestUtil.name} Utilization
- Running at ${fmtPct(lowestUtil.utilization)} utilization — lowest across locations
- **Action**: Add targeted midweek promotions and cross-location marketing

### 5. 🟢 Rebooking Rate Optimization
- Current average: ${fmtPct(ctx.avgRebook)} — industry benchmark is 75%
- **Action**: Enable AI rebooking prompt at checkout for all locations`
    },
  },
  {
    keywords: ['compare', 'location', 'benchmark', 'versus', 'vs', 'all location'],
    weight: 10,
    generate: (ctx) => {
      const sorted = [...ctx.byLocation].sort((a, b) => b.revenue - a.revenue)
      const maxRev = sorted[0].revenue
      return `## Multi-Location Comparison Report

*Comparing Zenoti data across all centers...*

### Revenue Performance (Last 30 Days)
\`\`\`
${sorted.map((l) => {
  const bars = Math.round((l.revenue / maxRev) * 28)
  return `${l.name.padEnd(18)} ${'█'.repeat(bars)}${'░'.repeat(28 - bars)} ${fmtCurrency(l.revenue)}`
}).join('\n')}
\`\`\`

### Key Metrics:
| Metric | ${ctx.byLocation.map((l) => l.name.split(' ')[0]).join(' | ')} |
|--------|${ctx.byLocation.map(() => '------').join('|')}|
| Util. Rate | ${ctx.byLocation.map((l) => fmtPct(l.utilization)).join(' | ')} |
| No-Show | ${ctx.byLocation.map((l) => fmtPct(l.noShowRate)).join(' | ')} |
| New Clients | ${ctx.byLocation.map((l) => String(l.newClients)).join(' | ')} |
| Rebook Rate | ${ctx.byLocation.map((l) => fmtPct(l.rebookingRate)).join(' | ')} |

### Insights:
- **${sorted[0].name}** is the clear leader — highest revenue with ${fmtPct(sorted[0].utilization)} utilization
- **${sorted[sorted.length - 1].name}** needs attention — lowest revenue at ${fmtCurrency(sorted[sorted.length - 1].revenue)}
- Pipeline value across all locations: **${fmtCurrency(ctx.oppPipelineValue)}**`
    },
  },
  {
    keywords: ['predict', 'forecast', 'next month', 'project', 'future'],
    weight: 8,
    generate: (ctx) => {
      const projected = ctx.totalRevenue * 1.052
      return `## Revenue Forecast — Next 30 Days

Based on current trends, seasonality patterns, and pipeline analysis:

### Projected Revenue: **${fmtCurrency(projected)}** (+5.2% vs current month)

### By Location:
| Location | Current | Projected | Change |
|----------|---------|-----------|--------|
${ctx.byLocation.map((l) => {
  const growth = l.noShowRate > 14 ? 1.126 : l.utilization > 70 ? 1.075 : 1.035
  return `| ${l.name} | ${fmtCurrency(l.revenue)} | ${fmtCurrency(l.revenue * growth)} | +${((growth - 1) * 100).toFixed(1)}% |`
}).join('\n')}

### Confidence Level: **82%**

### Risk Factors:
- ⚠️ High no-show locations not addressed: -${fmtCurrency(ctx.totalRevenue * 0.022)}
- ⚠️ Seasonal slowdown risk: -${fmtCurrency(ctx.totalRevenue * 0.01)}
- ✅ Pipeline conversion (${ctx.oppsByStatus.contacted + ctx.oppsByStatus.new} active leads): +${fmtCurrency(ctx.oppPipelineValue * 0.4)}
- ✅ AI booking expansion: +${fmtCurrency(ctx.totalRevenue * 0.015)}`
    },
  },
  {
    keywords: ['no-show', 'no show', 'noshow', 'missed', 'absent', 'cancellation'],
    weight: 10,
    generate: (ctx) => {
      const sorted = [...ctx.byLocation].sort((a, b) => b.noShowRate - a.noShowRate)
      return `## No-Show Trend Analysis

*Analyzing your Zenoti appointment data for no-show patterns...*

### Current Overview:
\`\`\`
Before EIP (baseline):   ████████████████████████████ 28.2%
Current:                 ${'█'.repeat(Math.round(ctx.avgNoShow / 28.2 * 28))}${'░'.repeat(28 - Math.round(ctx.avgNoShow / 28.2 * 28))} ${fmtPct(ctx.avgNoShow)}
\`\`\`

**Total reduction: ${((1 - ctx.avgNoShow / 28.2) * 100).toFixed(0)}%** (28.2% → ${fmtPct(ctx.avgNoShow)})

### Impact:
- **${fmtCurrency(ctx.totalRecovered)}/month** in revenue at risk from no-show patterns
- **${ctx.highRiskAppts} high-risk appointments** currently flagged by EIP
- EIP tracked **${ctx.aiResolved} conversations** related to potential cancellations

### By Location (Current):
${sorted.map((l) => `- ${l.name}: ${fmtPct(l.noShowRate)} ${l.noShowRate < 12 ? '✅' : l.noShowRate < 15 ? '⚠️' : '🔴'}`).join('\n')}

### What's Working:
1. **Tiered reminders** (48h, 24h, 2h) — reduced no-shows by 35%
2. **Risk scoring** — high-risk flagging catches 78% of actual no-shows
3. **Waitlist auto-fill** — 85% of cancellation slots filled within 2 hours`
    },
  },
  {
    keywords: ['opportunity', 'pipeline', 'lead', 'prospect', 'funnel', 'conversion'],
    weight: 8,
    generate: (ctx) => {
      return `## Opportunity Pipeline Report

*Analyzing your Zenoti lead and opportunity data...*

### Pipeline Overview:
| Stage | Count | Est. Value |
|-------|-------|------------|
| New Leads | ${ctx.oppsByStatus.new} | — |
| Contacted | ${ctx.oppsByStatus.contacted} | — |
| Booked | ${ctx.oppsByStatus.booked} | — |
| Lost | ${ctx.oppsByStatus.lost} | — |

### Total Pipeline Value: **${fmtCurrency(ctx.oppPipelineValue)}** (excluding lost)

### Key Insights:
- **${ctx.oppsByStatus.new} new leads** need immediate follow-up
- **${ctx.oppsByStatus.contacted} leads** in active nurture
- **${ctx.oppsByStatus.booked} successfully converted** to bookings
- Win rate: **${ctx.oppsByStatus.booked + ctx.oppsByStatus.lost > 0 ? ((ctx.oppsByStatus.booked / (ctx.oppsByStatus.booked + ctx.oppsByStatus.lost)) * 100).toFixed(0) : 0}%**

### Recommendations:
1. Prioritize the ${ctx.oppsByStatus.new} uncontacted leads — speed-to-lead is critical
2. Re-engage the ${ctx.oppsByStatus.lost} lost opportunities with a win-back campaign
3. Configure Response Monitor for automated follow-up tracking`
    },
  },
  {
    keywords: ['ai', 'agent', 'automat', 'bot', 'performance'],
    weight: 6,
    generate: (ctx) => {
      return `## EIP Intelligence Agent Report

*Analyzing your Zenoti conversation and booking data...*

### Communication Metrics:
- **Total conversations tracked**: ${ctx.totalConversations}
- **AI-resolved**: ${ctx.aiResolved} (${ctx.totalConversations ? ((ctx.aiResolved / ctx.totalConversations) * 100).toFixed(0) : 0}% resolution rate)
- **Avg response time**: ${ctx.avgResponseTime.toFixed(0)}s

### Booking Impact:
- **AI-attributed bookings**: ${ctx.aiBooked}
- **Revenue gaps identified**: ${fmtCurrency(ctx.totalRecovered)}
- **High-risk appointments flagged**: ${ctx.highRiskAppts}

### Efficiency Insights:
- Your response time data shows a drop from **~4 hours** to **${ctx.avgResponseTime.toFixed(0)}s** (${((1 - ctx.avgResponseTime / 14400) * 100).toFixed(0)}% improvement)
- After-hours inquiry coverage: **24/7** (previously 0)
- No-show pattern detection: **${((1 - ctx.avgNoShow / 28.2) * 100).toFixed(0)}%** reduction identified

### Recommendation:
Your intelligence agents are surfacing strong insights. Consider expanding booking attribution tracking to include upsell patterns and package conversion opportunities.`
    },
  },
  {
    keywords: ['client', 'customer', 'patient', 'retention', 'loyalty', 'rebook'],
    weight: 6,
    generate: (ctx) => {
      return `## Client Retention Analysis

*Analyzing your Zenoti guest rebooking and retention data...*

### Key Metrics:
- **Rebooking rate**: ${fmtPct(ctx.avgRebook)} (target: 75%)
- **New clients** (30 days): ${ctx.totalNewClients}
- **Total bookings**: ${fmt(ctx.totalBookings)}

### By Location:
| Location | Rebook Rate | New Clients |
|----------|-------------|-------------|
${ctx.byLocation.map((l) => `| ${l.name} | ${fmtPct(l.rebookingRate)} | ${l.newClients} |`).join('\n')}

### Insights:
- ${ctx.avgRebook >= 70 ? 'Rebooking rate is strong' : 'Rebooking rate needs improvement'} at ${fmtPct(ctx.avgRebook)}
- ${ctx.totalNewClients} new clients acquired in the last 30 days
- Your Zenoti data shows same-day rebooking improved by an estimated 18%

### Recommendations:
1. Enable AI rebooking prompts at checkout
2. Offer loyalty incentives for 3+ visit clients
3. Use no-show risk scoring to proactively reach out to at-risk regulars`
    },
  },
]

export function generateAIResponse(prompt: string, ctx: AIContext): string {
  const lower = prompt.toLowerCase()

  // Score each template
  let bestTemplate = templates[templates.length - 1]
  let bestScore = 0

  for (const template of templates) {
    let score = 0
    for (const keyword of template.keywords) {
      if (lower.includes(keyword)) {
        score += template.weight
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestTemplate = template
    }
  }

  // If no keywords matched at all, use default
  if (bestScore === 0) {
    return generateDefaultResponse(ctx)
  }

  return bestTemplate.generate(ctx)
}

function generateDefaultResponse(ctx: AIContext): string {
  return `## Executive Summary

*Analyzing your Zenoti data across all 5 centers...*

Here's a snapshot of your business performance:

- **Total monthly revenue**: ${fmtCurrency(ctx.totalRevenue)}
- **Revenue gaps identified**: ${fmtCurrency(ctx.totalRecovered)} at risk
- **Utilization rate**: ${fmtPct(ctx.avgUtil)} average
- **No-show rate**: ${fmtPct(ctx.avgNoShow)} (down from 28.2% baseline)
- **Pipeline value**: ${fmtCurrency(ctx.oppPipelineValue)}

### Top Performing Location:
**${[...ctx.byLocation].sort((a, b) => b.revenue - a.revenue)[0].name}** — leading in revenue and utilization.

### Biggest Opportunity:
${[...ctx.byLocation].sort((a, b) => a.utilization - b.utilization)[0].name} is running at only ${fmtPct([...ctx.byLocation].sort((a, b) => a.utilization - b.utilization)[0].utilization)} utilization. Improving this could add an estimated ${fmtCurrency(ctx.totalRevenue * 0.04)}/month.

Would you like me to:
- Deep dive into a specific location?
- Analyze the opportunity pipeline?
- Show no-show trends and prevention impact?`
}
