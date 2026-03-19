// ---------------------------------------------------------------------------
// Automated Client Reporting — seed data
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScheduledReport {
  id: string
  name: string
  type: 'weekly_brief' | 'monthly_deep_dive' | 'quarterly_review' | 'custom'
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'one_time'
  nextDelivery: string
  lastDelivered?: string
  recipients: string[]
  status: 'active' | 'paused' | 'draft'
  sections: string[]
}

export interface ReportHistory {
  id: string
  reportId: string
  deliveredAt: string
  type: string
  periodStart: string
  periodEnd: string
  highlights: string[]
  metrics: {
    revenue: number
    revenueChange: number
    topOpportunity: string
    topOpportunityValue: number
    actionsCompleted: number
    actionsTotal: number
  }
}

export interface WeeklyBriefData {
  periodStart: string
  periodEnd: string
  wins: string[]
  concerns: string[]
  topOpportunities: { title: string; impact: number }[]
  actionProgress: { action: string; status: 'completed' | 'in_progress' | 'not_started' }[]
  benchmarkMovement: { metric: string; previous: number; current: number; percentile: number }[]
  locationHighlights: { locationId: string; locationName: string; highlight: string }[]
}

// ---------------------------------------------------------------------------
// Date helpers (match seed.ts pattern — relative to today)
// ---------------------------------------------------------------------------

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function daysFromNow(n: number): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function daysAgo(n: number): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function daysAgoISO(n: number, hour = 8, minute = 0): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - n)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// ---------------------------------------------------------------------------
// Scheduled Reports
// ---------------------------------------------------------------------------

export const scheduledReports: ScheduledReport[] = [
  {
    id: 'rpt-weekly',
    name: 'Weekly Intelligence Brief',
    type: 'weekly_brief',
    frequency: 'weekly',
    nextDelivery: daysFromNow(1),
    lastDelivered: daysAgo(6),
    recipients: ['ryan@treatmedspa.com', 'ops@treatmedspa.com'],
    status: 'active',
    sections: ['revenue_summary', 'opportunities', 'benchmarks', 'action_items'],
  },
  {
    id: 'rpt-monthly',
    name: 'Monthly Deep Dive',
    type: 'monthly_deep_dive',
    frequency: 'monthly',
    nextDelivery: daysFromNow(12),
    lastDelivered: daysAgo(18),
    recipients: ['ryan@treatmedspa.com', 'finance@treatmedspa.com', 'ops@treatmedspa.com'],
    status: 'active',
    sections: ['revenue_summary', 'opportunities', 'benchmarks', 'provider_rankings', 'action_items'],
  },
  {
    id: 'rpt-quarterly',
    name: 'Quarterly Executive Review',
    type: 'quarterly_review',
    frequency: 'quarterly',
    nextDelivery: daysFromNow(45),
    lastDelivered: daysAgo(45),
    recipients: ['ryan@treatmedspa.com', 'board@treatmedspa.com'],
    status: 'active',
    sections: ['revenue_summary', 'opportunities', 'benchmarks', 'provider_rankings', 'gap_analysis', 'action_items'],
  },
  {
    id: 'rpt-custom-promo',
    name: 'Spring Promo Campaign Tracker',
    type: 'custom',
    frequency: 'weekly',
    nextDelivery: daysFromNow(3),
    recipients: ['marketing@treatmedspa.com', 'ops@treatmedspa.com'],
    status: 'draft',
    sections: ['revenue_summary', 'benchmarks'],
  },
]

// ---------------------------------------------------------------------------
// Report History (last ~2 months, 10 entries)
// ---------------------------------------------------------------------------

export const reportHistory: ReportHistory[] = [
  {
    id: 'hist-01',
    reportId: 'rpt-weekly',
    deliveredAt: daysAgoISO(6, 8, 0),
    type: 'Weekly Intelligence Brief',
    periodStart: daysAgo(13),
    periodEnd: daysAgo(7),
    highlights: [
      'SoHo Flagship exceeded revenue target by 14%',
      'Cross-location no-show rate dropped to 11.2%',
      'Identified $18,400 in rebooking gaps across Hoboken & White Plains',
    ],
    metrics: { revenue: 187_400, revenueChange: 8.3, topOpportunity: 'Botox rebooking at Hoboken', topOpportunityValue: 9_200, actionsCompleted: 7, actionsTotal: 9 },
  },
  {
    id: 'hist-02',
    reportId: 'rpt-weekly',
    deliveredAt: daysAgoISO(13, 8, 0),
    type: 'Weekly Intelligence Brief',
    periodStart: daysAgo(20),
    periodEnd: daysAgo(14),
    highlights: [
      'Williamsburg utilization hit 81%, best in network',
      'Response time improved to 1.8 min average',
      'Three new high-value rebooking opportunities surfaced',
    ],
    metrics: { revenue: 173_100, revenueChange: 5.1, topOpportunity: 'Hydrafacial upsell at SoHo', topOpportunityValue: 7_600, actionsCompleted: 6, actionsTotal: 8 },
  },
  {
    id: 'hist-03',
    reportId: 'rpt-monthly',
    deliveredAt: daysAgoISO(18, 9, 0),
    type: 'Monthly Deep Dive',
    periodStart: daysAgo(48),
    periodEnd: daysAgo(18),
    highlights: [
      'Total monthly revenue: $742K (+11% vs prior month)',
      'Provider utilization rose from 68% to 76%',
      'Stamford flagged as under-performing — action plan delivered',
    ],
    metrics: { revenue: 742_000, revenueChange: 11.0, topOpportunity: 'Body Contouring expansion', topOpportunityValue: 34_500, actionsCompleted: 14, actionsTotal: 18 },
  },
  {
    id: 'hist-04',
    reportId: 'rpt-weekly',
    deliveredAt: daysAgoISO(20, 8, 0),
    type: 'Weekly Intelligence Brief',
    periodStart: daysAgo(27),
    periodEnd: daysAgo(21),
    highlights: [
      'White Plains new client volume up 22%',
      'Chemical Peel add-on attach rate increased to 31%',
    ],
    metrics: { revenue: 164_800, revenueChange: 2.7, topOpportunity: 'Filler package at Williamsburg', topOpportunityValue: 6_100, actionsCompleted: 5, actionsTotal: 7 },
  },
  {
    id: 'hist-05',
    reportId: 'rpt-weekly',
    deliveredAt: daysAgoISO(27, 8, 0),
    type: 'Weekly Intelligence Brief',
    periodStart: daysAgo(34),
    periodEnd: daysAgo(28),
    highlights: [
      'Network-wide revenue stabilized after seasonal dip',
      'SoHo rebooking rate climbed to 58%',
    ],
    metrics: { revenue: 160_500, revenueChange: -0.8, topOpportunity: 'Laser Hair promo at Stamford', topOpportunityValue: 5_400, actionsCompleted: 4, actionsTotal: 6 },
  },
  {
    id: 'hist-06',
    reportId: 'rpt-weekly',
    deliveredAt: daysAgoISO(34, 8, 0),
    type: 'Weekly Intelligence Brief',
    periodStart: daysAgo(41),
    periodEnd: daysAgo(35),
    highlights: [
      'Hoboken launched new Body Contouring slots — 60% filled week one',
      'No-show rate spiked at White Plains (19.4%) — corrective actions assigned',
    ],
    metrics: { revenue: 161_800, revenueChange: 3.2, topOpportunity: 'Body Contouring at Hoboken', topOpportunityValue: 8_900, actionsCompleted: 5, actionsTotal: 8 },
  },
  {
    id: 'hist-07',
    reportId: 'rpt-quarterly',
    deliveredAt: daysAgoISO(45, 9, 30),
    type: 'Quarterly Executive Review',
    periodStart: daysAgo(135),
    periodEnd: daysAgo(45),
    highlights: [
      'Quarterly revenue: $2.18M (+9% YoY)',
      'Top performer: SoHo Flagship ($620K quarterly)',
      'Biggest gap: Stamford utilization at 62% vs 76% network avg',
      'Recommended: add one provider at Williamsburg to capture demand',
    ],
    metrics: { revenue: 2_180_000, revenueChange: 9.0, topOpportunity: 'Williamsburg capacity expansion', topOpportunityValue: 48_000, actionsCompleted: 22, actionsTotal: 30 },
  },
  {
    id: 'hist-08',
    reportId: 'rpt-weekly',
    deliveredAt: daysAgoISO(41, 8, 0),
    type: 'Weekly Intelligence Brief',
    periodStart: daysAgo(48),
    periodEnd: daysAgo(42),
    highlights: [
      'Williamsburg set new daily revenue record ($14.2K on Thursday)',
      'Network response time at all-time low of 1.6 min',
    ],
    metrics: { revenue: 158_200, revenueChange: 1.4, topOpportunity: 'Injectable package upsell at SoHo', topOpportunityValue: 6_800, actionsCompleted: 6, actionsTotal: 7 },
  },
  {
    id: 'hist-09',
    reportId: 'rpt-weekly',
    deliveredAt: daysAgoISO(48, 8, 0),
    type: 'Weekly Intelligence Brief',
    periodStart: daysAgo(55),
    periodEnd: daysAgo(49),
    highlights: [
      'Post-holiday recovery on track across all locations',
      'Identified $12K gap in lapsed Botox rebookings',
    ],
    metrics: { revenue: 156_100, revenueChange: -1.2, topOpportunity: 'Botox rebooking recovery', topOpportunityValue: 12_000, actionsCompleted: 3, actionsTotal: 6 },
  },
  {
    id: 'hist-10',
    reportId: 'rpt-monthly',
    deliveredAt: daysAgoISO(48, 9, 0),
    type: 'Monthly Deep Dive',
    periodStart: daysAgo(78),
    periodEnd: daysAgo(48),
    highlights: [
      'Total monthly revenue: $668K (+6% vs prior month)',
      'New client acquisition up 18% network-wide',
      'Hoboken emerging as fastest-growing location',
    ],
    metrics: { revenue: 668_000, revenueChange: 6.0, topOpportunity: 'Cross-sell Chemical Peels', topOpportunityValue: 22_000, actionsCompleted: 11, actionsTotal: 16 },
  },
]

// ---------------------------------------------------------------------------
// Current Week's Full Brief
// ---------------------------------------------------------------------------

export const currentWeeklyBrief: WeeklyBriefData = {
  periodStart: daysAgo(6),
  periodEnd: daysAgo(0),
  wins: [
    'Total network revenue reached $192K this week — best week in Q1',
    'SoHo Flagship hit 84% utilization (top-quartile nationally)',
    'Cross-location no-show rate held at 10.8%, down from 14.2% eight weeks ago',
    'Williamsburg rebooking rate climbed to 61%, surpassing the top-performer benchmark',
  ],
  concerns: [
    'Stamford revenue declined 6% WoW — two provider callouts impacted Thursday/Friday slots',
    'White Plains new client pipeline thinning — only 8 new clients vs 14 prior week',
    'Body Contouring demand exceeding capacity at Hoboken — 12 waitlisted prospects',
  ],
  topOpportunities: [
    { title: 'Botox rebooking gap at Hoboken (47 lapsed clients)', impact: 21_150 },
    { title: 'Hydrafacial upsell bundle at SoHo & Williamsburg', impact: 14_800 },
    { title: 'Stamford Chemical Peel launch to offset revenue dip', impact: 8_600 },
  ],
  actionProgress: [
    { action: 'Launch Hoboken Botox rebooking outreach', status: 'in_progress' },
    { action: 'Deploy Hydrafacial bundle pricing at SoHo', status: 'completed' },
    { action: 'Audit Stamford provider scheduling gaps', status: 'in_progress' },
    { action: 'Update White Plains new-client nurture sequence', status: 'not_started' },
    { action: 'Review Body Contouring waitlist for Hoboken expansion', status: 'completed' },
    { action: 'Finalize Q1 executive review deck', status: 'in_progress' },
  ],
  benchmarkMovement: [
    { metric: 'No-Show Rate', previous: 12.1, current: 10.8, percentile: 88 },
    { metric: 'Utilization Rate', previous: 74.2, current: 76.8, percentile: 72 },
    { metric: 'Rebooking Rate', previous: 53.6, current: 56.1, percentile: 78 },
    { metric: 'Avg Ticket', previous: 468, current: 482, percentile: 65 },
    { metric: 'Response Time (min)', previous: 2.1, current: 1.9, percentile: 92 },
  ],
  locationHighlights: [
    { locationId: 'soho', locationName: 'SoHo Flagship', highlight: 'Revenue leader at $52.4K; utilization at 84% — recommend maintaining current provider mix' },
    { locationId: 'williamsburg', locationName: 'Williamsburg', highlight: 'Rebooking rate surpassed 61%; injectable revenue up 18% WoW' },
    { locationId: 'hoboken', locationName: 'Hoboken', highlight: 'Body Contouring demand surging — 12 prospects waitlisted; consider adding Saturday slots' },
    { locationId: 'white-plains', locationName: 'White Plains', highlight: 'New client volume declined; recommend targeted digital spend increase' },
    { locationId: 'stamford', locationName: 'Stamford', highlight: 'Revenue dipped 6% due to provider absences; schedule backfill plan in progress' },
  ],
}
