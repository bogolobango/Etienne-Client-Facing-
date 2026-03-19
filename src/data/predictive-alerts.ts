// ---------------------------------------------------------------------------
// Predictive Alerts — AI-detected trends, anomalies, and forecasts
// ---------------------------------------------------------------------------

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function daysAgo(n: number): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function daysFromNow(n: number): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PredictiveAlert {
  id: string
  type: 'trend_decline' | 'anomaly' | 'forecast' | 'correlation' | 'threshold'
  severity: 'critical' | 'warning' | 'info'
  title: string
  narrative: string
  locationId: string
  metric: string
  currentValue: number
  projectedValue: number
  projectedDate: string
  correlatedMetric?: string
  correlatedExplanation?: string
  estimatedImpact: number
  suggestedAction: string
  detectedAt: string
  status: 'active' | 'acknowledged' | 'resolved'
  trendData: { date: string; actual?: number; projected?: number }[]
}

// ---------------------------------------------------------------------------
// Helpers to generate trend data
// ---------------------------------------------------------------------------

function generateTrendData(
  baseValue: number,
  declinePct: number,
  volatility: number,
  projectedEndValue: number,
): { date: string; actual?: number; projected?: number }[] {
  const data: { date: string; actual?: number; projected?: number }[] = []
  const actualDays = 14
  const projectedDays = 14

  for (let i = actualDays - 1; i >= 0; i--) {
    const progress = (actualDays - 1 - i) / (actualDays - 1)
    const decline = baseValue * (1 - declinePct * progress)
    const noise = decline * volatility * (Math.sin(i * 2.7 + 1.3) * 0.5 + Math.cos(i * 1.9) * 0.5)
    data.push({ date: daysAgo(i), actual: Math.round((decline + noise) * 100) / 100 })
  }

  const lastActual = data[data.length - 1].actual ?? 0
  for (let i = 1; i <= projectedDays; i++) {
    const progress = i / projectedDays
    const projected = lastActual + (projectedEndValue - lastActual) * progress
    const noise = projected * volatility * 0.3 * Math.sin(i * 1.5)
    data.push({ date: daysFromNow(i), projected: Math.round((projected + noise) * 100) / 100 })
  }

  return data
}

function generateSpikeData(
  baseValue: number,
  spikeValue: number,
  spikeDayAgo: number,
): { date: string; actual?: number; projected?: number }[] {
  const data: { date: string; actual?: number; projected?: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const noise = baseValue * 0.08 * Math.sin(i * 2.1 + 0.7)
    const val = i === spikeDayAgo ? spikeValue : baseValue + noise
    data.push({ date: daysAgo(i), actual: Math.round(val * 100) / 100 })
  }
  for (let i = 1; i <= 14; i++) {
    const noise = baseValue * 0.06 * Math.sin(i * 1.8)
    data.push({ date: daysFromNow(i), projected: Math.round((baseValue + noise) * 100) / 100 })
  }
  return data
}

// ---------------------------------------------------------------------------
// Alert Data
// ---------------------------------------------------------------------------

export const predictiveAlerts: PredictiveAlert[] = [
  // 1 — Critical: White Plains utilization decline
  {
    id: 'pa-001',
    type: 'correlation',
    severity: 'critical',
    title: 'White Plains Wednesday utilization in steep decline',
    narrative:
      'White Plains Wednesday utilization dropped from 78% to 61% over the past 3 weeks, a 22% relative decline. This correlates strongly with Dr. Martinez reducing Wednesday hours from full-day to half-day starting February 26. At current trajectory, Wednesday utilization will fall below 50% within 2 weeks, representing $4,200/week in lost chair-time revenue.',
    locationId: 'white-plains',
    metric: 'Utilization Rate',
    currentValue: 61,
    projectedValue: 48,
    projectedDate: daysFromNow(14),
    correlatedMetric: 'Provider Hours',
    correlatedExplanation:
      'Dr. Martinez reduced Wednesday availability from 8 hours to 4 hours starting 3 weeks ago. No replacement provider was scheduled.',
    estimatedImpact: 16800,
    suggestedAction:
      'Schedule a second provider for Wednesday shifts or extend Dr. Martinez back to full-day. Consider redistributing Wednesday demand to Tuesday/Thursday slots.',
    detectedAt: daysAgo(2),
    status: 'active',
    trendData: generateTrendData(78, 0.22, 0.04, 48),
  },

  // 2 — Critical: Stamford no-show rate trending up
  {
    id: 'pa-002',
    type: 'trend_decline',
    severity: 'critical',
    title: 'Stamford no-show rate trending up 3% per week',
    narrative:
      'Stamford no-show rate has increased from 15% to 22% over the last 4 weeks, adding roughly 3 percentage points per week. If unchecked, the rate is projected to reach 28% by mid-April — well above the industry benchmark of 18%. This is costing an estimated $3,100/week in empty appointment slots.',
    locationId: 'stamford',
    metric: 'No-Show Rate',
    currentValue: 22,
    projectedValue: 28,
    projectedDate: daysFromNow(14),
    estimatedImpact: 12400,
    suggestedAction:
      'Implement 48-hour and 2-hour confirmation reminders for Stamford. Review deposit policy for high-value services. Cross-reference no-show clients with booking patterns to identify repeat offenders.',
    detectedAt: daysAgo(3),
    status: 'active',
    trendData: generateTrendData(15, -0.47, 0.06, 28),
  },

  // 3 — Warning: Williamsburg rebook rate dropping
  {
    id: 'pa-003',
    type: 'correlation',
    severity: 'critical',
    title: 'Williamsburg rebook rate declining — new staff correlation',
    narrative:
      'Williamsburg rebook rate has dropped from 47% to 39% over the past 3 weeks. 90-day forecast projects it falling to 32% if the trend continues. Cross-referencing operational data shows a new front desk staff member (Taylor R.) started 3 weeks ago. Clients checked out by Taylor have a 24% rebook rate vs. 52% for the previous staff member.',
    locationId: 'williamsburg',
    metric: 'Rebook Rate',
    currentValue: 39,
    projectedValue: 32,
    projectedDate: daysFromNow(14),
    correlatedMetric: 'Front Desk Staff',
    correlatedExplanation:
      'New front desk hire (Taylor R.) started 3 weeks ago. Rebook rate for clients handled by Taylor is 24% vs. 52% for the previous employee. This suggests a training gap in the checkout/rebooking process.',
    estimatedImpact: 9800,
    suggestedAction:
      'Schedule rebooking training for Taylor R. immediately. Implement a checkout script that prompts rebooking before payment. Monitor rebook rate by staff member weekly.',
    detectedAt: daysAgo(1),
    status: 'active',
    trendData: generateTrendData(47, 0.17, 0.05, 32),
  },

  // 4 — Info: SoHo revenue anomaly (positive spike)
  {
    id: 'pa-004',
    type: 'anomaly',
    severity: 'info',
    title: 'SoHo Thursday revenue spiked 40% — Body Contouring cluster',
    narrative:
      'SoHo Thursday revenue spiked to $14,200 last week, 40% above the $10,100 Thursday average. Root cause: 3 high-value Body Contouring bookings ($1,200 each) landed on the same day, likely driven by a social media post that went viral on Wednesday. This is a positive anomaly worth capitalizing on.',
    locationId: 'soho',
    metric: 'Revenue',
    currentValue: 14200,
    projectedValue: 10100,
    projectedDate: daysFromNow(7),
    correlatedMetric: 'Social Media Engagement',
    correlatedExplanation:
      'An Instagram Reel showcasing Body Contouring results posted Wednesday received 12K views. All 3 bookings mentioned seeing the post.',
    estimatedImpact: 4100,
    suggestedAction:
      'Replicate the social media strategy — schedule regular Body Contouring before/after content. Consider a Thursday Body Contouring package deal to build on the momentum.',
    detectedAt: daysAgo(4),
    status: 'acknowledged',
    trendData: generateSpikeData(10100, 14200, 4),
  },

  // 5 — Warning: Hoboken revenue declining
  {
    id: 'pa-005',
    type: 'trend_decline',
    severity: 'warning',
    title: 'Hoboken weekday revenue declining 8% week-over-week',
    narrative:
      'Hoboken weekday (Mon-Fri) revenue has declined from $8,400/day to $7,100/day over the past 3 weeks, an 8% week-over-week decrease. Weekend revenue remains stable. The projected monthly impact is $9,100 in lost revenue if the trend continues through April.',
    locationId: 'hoboken',
    metric: 'Revenue',
    currentValue: 7100,
    projectedValue: 5800,
    projectedDate: daysFromNow(14),
    estimatedImpact: 9100,
    suggestedAction:
      'Analyze weekday booking patterns — are fewer appointments being made or are lower-value services being booked? Consider a weekday promotion targeting high-value services like Body Contouring and Dermal Filler.',
    detectedAt: daysAgo(2),
    status: 'active',
    trendData: generateTrendData(8400, 0.15, 0.05, 5800),
  },

  // 6 — Warning: SoHo utilization below threshold
  {
    id: 'pa-006',
    type: 'threshold',
    severity: 'warning',
    title: 'SoHo Room 5 utilization below 40% threshold',
    narrative:
      'SoHo Room 5 utilization has averaged 37% over the past 2 weeks, falling below the 40% minimum threshold. The room is primarily used for Chemical Peels which have dropped 25% in bookings. With 6 rooms at SoHo, this underutilization represents wasted overhead of approximately $2,800/month.',
    locationId: 'soho',
    metric: 'Utilization Rate',
    currentValue: 37,
    projectedValue: 33,
    projectedDate: daysFromNow(14),
    estimatedImpact: 2800,
    suggestedAction:
      'Cross-train Room 5 for Hydrafacial services which have a waitlist at SoHo. Alternatively, run a Chemical Peel promotion to rebuild demand.',
    detectedAt: daysAgo(5),
    status: 'active',
    trendData: generateTrendData(45, 0.18, 0.06, 33),
  },

  // 7 — Info: Cross-location Botox demand forecast
  {
    id: 'pa-007',
    type: 'forecast',
    severity: 'info',
    title: 'Botox demand projected to spike 35% in April (seasonal)',
    narrative:
      'Based on historical patterns and current booking velocity, Botox appointments across all locations are projected to increase 35% in April (pre-summer rush). Current provider capacity can absorb approximately 20% additional volume. Without adding slots, an estimated $18,500 in Botox revenue may be lost to availability constraints.',
    locationId: 'soho',
    metric: 'Bookings',
    currentValue: 142,
    projectedValue: 192,
    projectedDate: daysFromNow(21),
    estimatedImpact: 18500,
    suggestedAction:
      'Open additional Botox slots across all locations for April. Prioritize SoHo and Williamsburg which historically see the largest seasonal increases. Consider extending evening hours on Tuesdays and Thursdays.',
    detectedAt: daysAgo(1),
    status: 'active',
    trendData: generateTrendData(142, -0.15, 0.04, 192),
  },

  // 8 — Warning: Stamford average ticket declining
  {
    id: 'pa-008',
    type: 'trend_decline',
    severity: 'warning',
    title: 'Stamford average ticket value dropped 18% in 2 weeks',
    narrative:
      'Average ticket value at Stamford has declined from $385 to $315 over the past 2 weeks. The service mix has shifted toward lower-value Hydrafacials (+40% bookings) while Injectable bookings dropped 22%. This shift reduces per-appointment revenue by $70 on average.',
    locationId: 'stamford',
    metric: 'Avg Ticket Value',
    currentValue: 315,
    projectedValue: 280,
    projectedDate: daysFromNow(14),
    estimatedImpact: 7200,
    suggestedAction:
      'Train Stamford providers on Injectable upsell scripts during Hydrafacial consultations. Implement a Hydrafacial + Botox bundle package to capture cross-sell revenue.',
    detectedAt: daysAgo(3),
    status: 'acknowledged',
    trendData: generateTrendData(385, 0.18, 0.04, 280),
  },

  // 9 — Critical: Hoboken response time degrading
  {
    id: 'pa-009',
    type: 'threshold',
    severity: 'critical',
    title: 'Hoboken inquiry response time exceeding 4-hour threshold',
    narrative:
      'Average response time to new inquiries at Hoboken has climbed from 1.8 hours to 4.3 hours over the past 10 days, breaching the 4-hour SLA threshold. Industry data shows a 60% drop in conversion when response time exceeds 4 hours. An estimated 8-12 leads per week are at risk of being lost.',
    locationId: 'hoboken',
    metric: 'Response Time',
    currentValue: 4.3,
    projectedValue: 5.8,
    projectedDate: daysFromNow(7),
    estimatedImpact: 11200,
    suggestedAction:
      'Audit Hoboken front desk staffing during peak inquiry hours (10am-2pm). Consider routing overflow inquiries to a centralized response team. Set up escalation alerts when response time exceeds 2 hours.',
    detectedAt: daysAgo(1),
    status: 'active',
    trendData: generateTrendData(1.8, -1.39, 0.08, 5.8),
  },

  // 10 — Info: White Plains new client acquisition up
  {
    id: 'pa-010',
    type: 'anomaly',
    severity: 'info',
    title: 'White Plains new client acquisition up 28% — Google Ads correlation',
    narrative:
      'White Plains has acquired 34 new clients in the past 2 weeks, a 28% increase over the prior period. This coincides with a Google Ads campaign launched 18 days ago targeting "medspa White Plains." The cost per acquisition is approximately $45, well below the $120 industry average.',
    locationId: 'white-plains',
    metric: 'New Clients',
    currentValue: 34,
    projectedValue: 40,
    projectedDate: daysFromNow(14),
    correlatedMetric: 'Google Ads Spend',
    correlatedExplanation:
      'Google Ads campaign targeting "medspa White Plains" launched 18 days ago with $1,500 spend. Attribution data shows 22 of 34 new clients came through Google search.',
    estimatedImpact: 5100,
    suggestedAction:
      'Increase Google Ads budget for White Plains. Replicate the campaign targeting for Stamford and Hoboken markets. Ensure new clients are being rebooked at first visit.',
    detectedAt: daysAgo(2),
    status: 'active',
    trendData: generateSpikeData(26, 34, 2),
  },

  // 11 — Warning: SoHo cancellation rate spike
  {
    id: 'pa-011',
    type: 'trend_decline',
    severity: 'warning',
    title: 'SoHo same-day cancellations up 45% this week',
    narrative:
      'SoHo has seen 18 same-day cancellations this week, up from an average of 12. The majority (11 of 18) were Injectable appointments. Cross-referencing shows 8 of these clients had previously rescheduled at least once. This pattern suggests booking hesitancy rather than true scheduling conflicts.',
    locationId: 'soho',
    metric: 'Cancellation Rate',
    currentValue: 18,
    projectedValue: 22,
    projectedDate: daysFromNow(7),
    estimatedImpact: 6400,
    suggestedAction:
      'Implement a same-day cancellation deposit for Injectable appointments ($50 non-refundable). Send personalized confirmation messages 24 hours before with provider-specific messaging to reduce cancellation anxiety.',
    detectedAt: daysAgo(1),
    status: 'active',
    trendData: generateTrendData(12, -0.5, 0.08, 22),
  },

  // 12 — Info: Cross-location membership opportunity
  {
    id: 'pa-012',
    type: 'forecast',
    severity: 'info',
    title: 'Membership conversion opportunity — 67 eligible clients identified',
    narrative:
      'Analysis of visit frequency data across all locations has identified 67 clients who visit 3+ times per month but are not on a membership plan. Converting even 30% of these clients to the $199/month membership would generate $4,000/month in recurring revenue while improving retention.',
    locationId: 'soho',
    metric: 'Membership Revenue',
    currentValue: 67,
    projectedValue: 20,
    projectedDate: daysFromNow(30),
    estimatedImpact: 4000,
    suggestedAction:
      'Generate a targeted outreach list for these 67 clients. Have providers mention the membership benefit at their next visit. Offer a first-month-free promotion to accelerate conversion.',
    detectedAt: daysAgo(4),
    status: 'active',
    trendData: generateTrendData(52, -0.29, 0.03, 67),
  },

  // 13 — Warning: Williamsburg product retail declining
  {
    id: 'pa-013',
    type: 'trend_decline',
    severity: 'warning',
    title: 'Williamsburg retail product revenue down 32% in 3 weeks',
    narrative:
      'Retail product revenue at Williamsburg has dropped from $2,100/week to $1,430/week over the past 3 weeks, a 32% decline. This coincides with a display reorganization that moved skincare products from the checkout counter to a back shelf. Impulse purchase behavior has been significantly disrupted.',
    locationId: 'williamsburg',
    metric: 'Retail Revenue',
    currentValue: 1430,
    projectedValue: 1100,
    projectedDate: daysFromNow(14),
    correlatedMetric: 'Store Layout',
    correlatedExplanation:
      'Product display was moved from checkout counter to back shelf 3 weeks ago during a renovation. Checkout counter product exposure time dropped from ~3 minutes to ~0 minutes per client.',
    estimatedImpact: 2800,
    suggestedAction:
      'Restore a curated product display at the checkout counter immediately. Feature top-selling items (SkinCeuticals CE Ferulic, EltaMD sunscreen) at eye level. Train front desk to mention one product recommendation during checkout.',
    detectedAt: daysAgo(3),
    status: 'active',
    trendData: generateTrendData(2100, 0.32, 0.06, 1100),
  },

  // 14 — Info: Hoboken Hydrafacial demand surge
  {
    id: 'pa-014',
    type: 'forecast',
    severity: 'info',
    title: 'Hoboken Hydrafacial bookings trending to waitlist capacity',
    narrative:
      'Hoboken Hydrafacial bookings have increased 22% over the past 2 weeks, with the waitlist growing to 14 clients. At current growth rate, demand will exceed room capacity by the end of March. This is a positive signal — Hydrafacial is the highest-margin facial service.',
    locationId: 'hoboken',
    metric: 'Bookings',
    currentValue: 48,
    projectedValue: 62,
    projectedDate: daysFromNow(14),
    estimatedImpact: 3500,
    suggestedAction:
      'Add a second Hydrafacial room at Hoboken or extend provider hours. Cross-promote the Williamsburg location for overflow clients. Consider a Hoboken Hydrafacial membership tier.',
    detectedAt: daysAgo(2),
    status: 'acknowledged',
    trendData: generateTrendData(39, -0.23, 0.04, 62),
  },
]

// ---------------------------------------------------------------------------
// Aggregate trend data for dashboard mini-charts (30-day history + 30-day forecast)
// ---------------------------------------------------------------------------

function generateDashboardTrend(
  baseValue: number,
  trendPct: number,
  volatility: number,
): { date: string; actual?: number; projected?: number }[] {
  const data: { date: string; actual?: number; projected?: number }[] = []

  for (let i = 29; i >= 0; i--) {
    const progress = (29 - i) / 29
    const val = baseValue * (1 + trendPct * progress)
    const noise = val * volatility * Math.sin(i * 1.7 + 0.5)
    data.push({ date: daysAgo(i), actual: Math.round((val + noise) * 100) / 100 })
  }

  const lastActual = data[data.length - 1].actual ?? 0
  for (let i = 1; i <= 30; i++) {
    const progress = i / 30
    const projected = lastActual * (1 + trendPct * progress)
    const noise = projected * volatility * 0.5 * Math.sin(i * 1.3)
    data.push({ date: daysFromNow(i), projected: Math.round((projected + noise) * 100) / 100 })
  }

  return data
}

export const dashboardTrends = {
  revenue: {
    label: 'Revenue',
    unit: '$',
    data: generateDashboardTrend(9200, 0.06, 0.05),
  },
  utilization: {
    label: 'Utilization',
    unit: '%',
    data: generateDashboardTrend(72, -0.04, 0.03),
  },
  noShowRate: {
    label: 'No-Show Rate',
    unit: '%',
    data: generateDashboardTrend(16, 0.12, 0.06),
  },
  rebookRate: {
    label: 'Rebook Rate',
    unit: '%',
    data: generateDashboardTrend(45, -0.05, 0.04),
  },
}
