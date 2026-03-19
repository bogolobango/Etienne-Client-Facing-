export interface RevenueOpportunity {
  id: string
  type: 'no_show_recovery' | 'rebook_gap' | 'utilization_gap' | 'pricing_optimization' | 'service_mix' | 'cross_sell'
  title: string
  description: string
  locationId: string
  estimatedImpact: number
  confidence: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  status: 'new' | 'in_review' | 'implementing' | 'implemented' | 'dismissed'
  dataPoints: string[]
  suggestedAction: string
  createdAt: string
  implementedAt?: string
  actualImpact?: number
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function daysAgo(n: number): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export const revenueOpportunities: RevenueOpportunity[] = [
  // --- No-Show Recovery ---
  {
    id: 'opp-001',
    type: 'no_show_recovery',
    title: 'Stamford Tuesday afternoon no-show surge',
    description:
      'Stamford lost $14,200 last month from Tuesday afternoon no-shows alone — a 28% no-show rate between 1–5 PM. SoHo runs the same time slot at just 12%. Implementing a same-day SMS confirmation sequence plus a 48-hour rebooking trigger could recover the majority of this lost revenue.',
    locationId: 'stamford',
    estimatedImpact: 14200,
    confidence: 'high',
    effort: 'low',
    status: 'new',
    dataPoints: ['No-show rate: 28%', 'Industry avg: 20%', 'SoHo rate: 12%', 'Lost appts/month: 34'],
    suggestedAction: 'Enable automated SMS confirmation 2 hours before Tuesday PM appointments and auto-offer rebooking within 48 hours of a no-show.',
    createdAt: daysAgo(2),
  },
  {
    id: 'opp-002',
    type: 'no_show_recovery',
    title: 'Hoboken weekend Injectable no-shows',
    description:
      'Hoboken sees 24% no-shows on Saturday Injectable appointments — nearly double the network average of 13%. These are high-ticket slots ($450–$850 each). A deposit requirement for weekend Injectables could recover an estimated $8,400/month.',
    locationId: 'hoboken',
    estimatedImpact: 8400,
    confidence: 'high',
    effort: 'medium',
    status: 'in_review',
    dataPoints: ['Saturday no-show rate: 24%', 'Network avg: 13%', 'Avg ticket: $650', 'Missed slots/month: 13'],
    suggestedAction: 'Require a $100 deposit for Saturday Injectable bookings. Deposit applies to service cost.',
    createdAt: daysAgo(5),
  },
  {
    id: 'opp-003',
    type: 'no_show_recovery',
    title: 'White Plains repeat offender pattern',
    description:
      'Eight clients at White Plains have no-showed 3+ times in the past 90 days, accounting for $6,100 in lost revenue. These clients collectively book 22 appointments per month but attend fewer than half.',
    locationId: 'white-plains',
    estimatedImpact: 6100,
    confidence: 'medium',
    effort: 'low',
    status: 'new',
    dataPoints: ['Repeat no-show clients: 8', 'Missed revenue: $6,100/mo', 'Attendance rate: 45%', 'Avg bookings/client: 2.75'],
    suggestedAction: 'Flag repeat no-show clients and require prepayment or deposit before booking. Send personalized outreach to re-engage.',
    createdAt: daysAgo(3),
  },

  // --- Rebook Gap ---
  {
    id: 'opp-004',
    type: 'rebook_gap',
    title: 'SoHo Botox rebook rate below benchmark',
    description:
      'SoHo\'s Botox rebook-within-90-days rate is 58%, while the industry benchmark sits at 72%. With 120 unique Botox clients per month, closing that 14-point gap means recapturing roughly 17 additional rebookings at $450 each.',
    locationId: 'soho',
    estimatedImpact: 7650,
    confidence: 'high',
    effort: 'medium',
    status: 'new',
    dataPoints: ['Rebook rate: 58%', 'Industry benchmark: 72%', 'Unique Botox clients/mo: 120', 'Revenue per visit: $450'],
    suggestedAction: 'Launch a 75-day automated reminder sequence for Botox clients who haven\'t rebooked, including a "maintenance pricing" incentive.',
    createdAt: daysAgo(4),
  },
  {
    id: 'opp-005',
    type: 'rebook_gap',
    title: 'Williamsburg Hydrafacial drop-off after first visit',
    description:
      'Only 34% of first-time Hydrafacial clients at Williamsburg return for a second appointment, compared to 51% at SoHo. The gap represents roughly 18 lost clients per month at $250 each.',
    locationId: 'williamsburg',
    estimatedImpact: 4500,
    confidence: 'medium',
    effort: 'medium',
    status: 'new',
    dataPoints: ['First-visit rebook: 34%', 'SoHo first-visit rebook: 51%', 'Lost clients/mo: 18', 'Revenue per visit: $250'],
    suggestedAction: 'Implement a post-first-visit follow-up call within 7 days and offer a package discount for committing to 3 sessions.',
    createdAt: daysAgo(6),
  },
  {
    id: 'opp-006',
    type: 'rebook_gap',
    title: 'Stamford Chemical Peel seasonal rebook lapse',
    description:
      'Chemical Peel rebookings at Stamford dropped 40% month-over-month heading into spring. Clients aren\'t being educated on year-round benefits. Peer locations maintained flat rebook rates.',
    locationId: 'stamford',
    estimatedImpact: 3200,
    confidence: 'medium',
    effort: 'low',
    status: 'new',
    dataPoints: ['MoM rebook decline: -40%', 'Peer decline: -5%', 'Lost rebookings: 16', 'Revenue per peel: $200'],
    suggestedAction: 'Train front-desk staff on spring skincare messaging. Send seasonal educational email to past Chemical Peel clients.',
    createdAt: daysAgo(1),
  },

  // --- Utilization Gap ---
  {
    id: 'opp-007',
    type: 'utilization_gap',
    title: 'White Plains Monday/Wednesday rooms sitting empty',
    description:
      'White Plains runs at only 41% room utilization on Mondays and Wednesdays — well below the 68% network average. Three treatment rooms sit idle for a combined 36 hours per week. Filling even half of that gap with mid-tier services would add significant revenue.',
    locationId: 'white-plains',
    estimatedImpact: 9800,
    confidence: 'medium',
    effort: 'high',
    status: 'new',
    dataPoints: ['Mon/Wed utilization: 41%', 'Network avg: 68%', 'Idle room-hours/week: 36', 'Revenue/room-hour: $135'],
    suggestedAction: 'Launch a "Midweek Special" promotion targeting Mon/Wed with 10% off Hydrafacials and Laser Hair Removal. Cross-promote on Instagram.',
    createdAt: daysAgo(7),
  },
  {
    id: 'opp-008',
    type: 'utilization_gap',
    title: 'Hoboken provider downtime between 2–4 PM',
    description:
      'Provider schedules at Hoboken show a consistent 2-hour gap between 2–4 PM every weekday. This dead zone costs approximately 40 billable hours per month. SoHo solved this by offering express 30-minute services in the same slot.',
    locationId: 'hoboken',
    estimatedImpact: 5400,
    confidence: 'medium',
    effort: 'medium',
    status: 'in_review',
    dataPoints: ['Daily idle gap: 2 hrs (2–4 PM)', 'Lost hours/month: 40', 'Avg revenue/hr: $135', 'SoHo same-slot utilization: 78%'],
    suggestedAction: 'Introduce "Express Refresh" 30-min Botox and Chemical Peel slots targeting lunch-break clients in the 2–4 PM window.',
    createdAt: daysAgo(8),
  },

  // --- Pricing Optimization ---
  {
    id: 'opp-009',
    type: 'pricing_optimization',
    title: 'SoHo Dermal Filler priced 15% below market',
    description:
      'SoHo\'s Dermal Filler is priced at $850 while comparable Manhattan medspas charge $975–$1,050. With 85 filler appointments per month, even a modest $75 increase — still below market — generates substantial incremental revenue with no volume loss expected.',
    locationId: 'soho',
    estimatedImpact: 6375,
    confidence: 'high',
    effort: 'low',
    status: 'new',
    dataPoints: ['Current price: $850', 'Market range: $975–$1,050', 'Monthly volume: 85', 'Suggested increase: $75'],
    suggestedAction: 'Raise Dermal Filler price to $925 effective next month. Grandfather existing package holders at current rate.',
    createdAt: daysAgo(3),
  },
  {
    id: 'opp-010',
    type: 'pricing_optimization',
    title: 'Williamsburg Body Contouring underpriced vs. demand',
    description:
      'Williamsburg Body Contouring has a 3-week waitlist at $1,200 per session. Demand clearly outstrips supply. A price adjustment to $1,400 would match Brooklyn market rates and generate $4,800 more per month at current volume without adding capacity.',
    locationId: 'williamsburg',
    estimatedImpact: 4800,
    confidence: 'high',
    effort: 'low',
    status: 'implementing',
    dataPoints: ['Current price: $1,200', 'Market rate: $1,350–$1,500', 'Monthly sessions: 24', 'Waitlist: 3 weeks'],
    suggestedAction: 'Increase Body Contouring to $1,400/session. Communicate value positioning through updated marketing materials.',
    createdAt: daysAgo(14),
  },

  // --- Service Mix ---
  {
    id: 'opp-011',
    type: 'service_mix',
    title: 'Hoboken over-indexed on low-margin Facials',
    description:
      'Facials represent 52% of Hoboken\'s bookings but only 31% of revenue. Meanwhile, Injectables — which drive 2.4x the margin — account for just 18% of bookings. Shifting 10% of Facial slots to Injectable consultations would meaningfully improve the revenue mix.',
    locationId: 'hoboken',
    estimatedImpact: 7200,
    confidence: 'medium',
    effort: 'high',
    status: 'new',
    dataPoints: ['Facial share of bookings: 52%', 'Facial share of revenue: 31%', 'Injectable margin: 2.4x Facial', 'Injectable booking share: 18%'],
    suggestedAction: 'Reduce Facial-only slots by 10% and replace with Injectable consultation blocks. Upsell Facial clients on combination treatments.',
    createdAt: daysAgo(10),
  },
  {
    id: 'opp-012',
    type: 'service_mix',
    title: 'Stamford not offering Laser Hair Removal packages',
    description:
      'Stamford sells Laser Hair Removal as single sessions only ($350 each), while every other location offers 6-session packages at $1,800 (14% discount). Package buyers have a 91% completion rate vs. 47% for single-session buyers. Stamford is leaving recurring revenue on the table.',
    locationId: 'stamford',
    estimatedImpact: 5600,
    confidence: 'high',
    effort: 'low',
    status: 'new',
    dataPoints: ['Single-session price: $350', 'Package price: $1,800 (6 sessions)', 'Package completion: 91%', 'Single completion: 47%'],
    suggestedAction: 'Launch the 6-session Laser Hair Removal package at Stamford. Train staff on package conversion scripts used at SoHo.',
    createdAt: daysAgo(9),
  },

  // --- Cross-Sell ---
  {
    id: 'opp-013',
    type: 'cross_sell',
    title: 'SoHo Botox clients not offered Chemical Peels',
    description:
      'Only 8% of SoHo\'s 120 monthly Botox clients also book Chemical Peels, compared to an industry cross-sell benchmark of 22%. Botox + Peel is a natural pairing — providers at Williamsburg already achieve 19% through simple verbal prompts at checkout.',
    locationId: 'soho',
    estimatedImpact: 3360,
    confidence: 'medium',
    effort: 'low',
    status: 'new',
    dataPoints: ['Current cross-sell: 8%', 'Industry benchmark: 22%', 'Williamsburg rate: 19%', 'Peel price: $200', 'Botox clients/mo: 120'],
    suggestedAction: 'Add a checkout prompt for Chemical Peel add-on after every Botox appointment. Offer a $25 discount when booked same-day.',
    createdAt: daysAgo(2),
  },
  {
    id: 'opp-014',
    type: 'cross_sell',
    title: 'White Plains Hydrafacial-to-Injectable pathway missing',
    description:
      'White Plains has 65 unique Hydrafacial clients per month, yet fewer than 5% convert to Injectable services. At SoHo, this pathway converts at 14% through a structured consultation offer at the 3rd Hydrafacial visit.',
    locationId: 'white-plains',
    estimatedImpact: 3900,
    confidence: 'medium',
    effort: 'medium',
    status: 'new',
    dataPoints: ['Hydrafacial clients/mo: 65', 'Injectable conversion: 5%', 'SoHo conversion: 14%', 'Avg Injectable ticket: $650'],
    suggestedAction: 'Offer a complimentary Injectable consultation at the 3rd Hydrafacial visit. Replicate SoHo\'s conversion playbook.',
    createdAt: daysAgo(4),
  },
  {
    id: 'opp-015',
    type: 'cross_sell',
    title: 'Williamsburg missed Body Contouring upsell from Laser clients',
    description:
      'Williamsburg\'s Laser Hair Removal clients (48/month) share a strong demographic overlap with Body Contouring buyers, yet only 2 clients per month cross over. A bundled "Total Body" package could drive 8–10 additional conversions per month.',
    locationId: 'williamsburg',
    estimatedImpact: 4200,
    confidence: 'low',
    effort: 'medium',
    status: 'new',
    dataPoints: ['Laser clients/mo: 48', 'Current cross-sell: 4%', 'Target cross-sell: 20%', 'Body Contouring price: $1,200'],
    suggestedAction: 'Create a "Total Body" bundle pairing 6-session Laser + 2 Body Contouring sessions at 12% off. Promote in-clinic and via email.',
    createdAt: daysAgo(6),
  },

  // --- Implemented example ---
  {
    id: 'opp-016',
    type: 'no_show_recovery',
    title: 'SoHo automated confirmation reduced no-shows',
    description:
      'After implementing a dual SMS + email confirmation flow 45 days ago, SoHo\'s no-show rate dropped from 18% to 11%. The system now auto-fills cancelled slots from the waitlist within 15 minutes.',
    locationId: 'soho',
    estimatedImpact: 9200,
    confidence: 'high',
    effort: 'low',
    status: 'implemented',
    dataPoints: ['Before no-show rate: 18%', 'After no-show rate: 11%', 'Slots auto-filled/mo: 28', 'Recovery rate: 76%'],
    suggestedAction: 'Maintain current confirmation cadence. Roll out identical flow to remaining locations.',
    createdAt: daysAgo(45),
    implementedAt: daysAgo(30),
    actualImpact: 8750,
  },
  {
    id: 'opp-017',
    type: 'pricing_optimization',
    title: 'Hoboken Botox price alignment completed',
    description:
      'Hoboken raised Botox from $400 to $450, matching the network standard. Volume held steady at 62 appointments/month — no measurable drop-off after 60 days of observation.',
    locationId: 'hoboken',
    estimatedImpact: 3100,
    confidence: 'high',
    effort: 'low',
    status: 'implemented',
    dataPoints: ['Old price: $400', 'New price: $450', 'Volume before: 62/mo', 'Volume after: 63/mo'],
    suggestedAction: 'No further action needed. Monitor quarterly for market shifts.',
    createdAt: daysAgo(60),
    implementedAt: daysAgo(45),
    actualImpact: 3150,
  },
]
