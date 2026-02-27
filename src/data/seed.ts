import type { Location, Service, AgentStatus, Conversation, Appointment, DailyMetrics, Client, Alert } from '@/types'

// Helper to generate dates relative to today
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function daysAgoISO(n: number, hour = 10, min = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

export const locations: Location[] = [
  { id: 'soho', name: 'SoHo Flagship', city: 'Manhattan', state: 'NY', rooms: 6, providers: 3 },
  { id: 'williamsburg', name: 'Williamsburg', city: 'Brooklyn', state: 'NY', rooms: 4, providers: 2 },
  { id: 'hoboken', name: 'Hoboken', city: 'Hoboken', state: 'NJ', rooms: 4, providers: 3 },
  { id: 'white-plains', name: 'White Plains', city: 'White Plains', state: 'NY', rooms: 3, providers: 2 },
  { id: 'stamford', name: 'Stamford', city: 'Stamford', state: 'CT', rooms: 3, providers: 2 },
]

export const services: Service[] = [
  { id: 'botox', name: 'Botox', price: 450, duration: 30, category: 'Injectable' },
  { id: 'filler', name: 'Dermal Filler', price: 850, duration: 45, category: 'Injectable' },
  { id: 'hydrafacial', name: 'Hydrafacial', price: 250, duration: 60, category: 'Facial' },
  { id: 'laser', name: 'Laser Hair Removal', price: 350, duration: 45, category: 'Laser' },
  { id: 'peel', name: 'Chemical Peel', price: 200, duration: 30, category: 'Facial' },
  { id: 'body', name: 'Body Contouring', price: 1200, duration: 90, category: 'Body' },
]

export const agentStatuses: AgentStatus[] = [
  { id: 'a1', name: 'Voice Responder', type: 'Answers calls, handles FAQs', module: 'command-center', status: 'online', tasksHandled: 847, lastActivity: daysAgoISO(0, 9, 15) },
  { id: 'a2', name: 'Text Concierge', type: 'Two-way SMS scheduling', module: 'command-center', status: 'online', tasksHandled: 1203, lastActivity: daysAgoISO(0, 9, 8) },
  { id: 'a3', name: 'Escalation Router', type: 'Intent & sentiment routing', module: 'command-center', status: 'online', tasksHandled: 156, lastActivity: daysAgoISO(0, 8, 45) },
  { id: 'a4', name: 'Booking Optimizer', type: 'Load balancing across providers', module: 'scheduling', status: 'online', tasksHandled: 632, lastActivity: daysAgoISO(0, 9, 20) },
  { id: 'a5', name: 'No-Show Guardian', type: 'Reminders & risk prediction', module: 'scheduling', status: 'online', tasksHandled: 421, lastActivity: daysAgoISO(0, 8, 30) },
  { id: 'a6', name: 'Demand Forecaster', type: 'Demand prediction by service', module: 'scheduling', status: 'idle', tasksHandled: 90, lastActivity: daysAgoISO(0, 6, 0) },
  { id: 'a7', name: 'Revenue Analyst', type: 'Natural language data queries', module: 'intelligence', status: 'online', tasksHandled: 234, lastActivity: daysAgoISO(0, 9, 5) },
  { id: 'a8', name: 'Opportunity Scout', type: 'Revenue leak detection', module: 'intelligence', status: 'online', tasksHandled: 67, lastActivity: daysAgoISO(0, 7, 0) },
  { id: 'a9', name: 'Report Generator', type: 'Weekly executive summaries', module: 'intelligence', status: 'idle', tasksHandled: 12, lastActivity: daysAgoISO(1, 18, 0) },
]

const convoNames = [
  'Sarah Mitchell', 'James Rodriguez', 'Emily Chen', 'Michael Park', 'Jessica Lee',
  'David Kim', 'Amanda Foster', 'Robert Taylor', 'Lisa Wang', 'Christopher Brown',
  'Maria Garcia', 'Daniel Johnson', 'Rachel Adams', 'Kevin Martinez', 'Stephanie Nguyen',
  'Andrew Wilson', 'Jennifer Rivera', 'Thomas Moore', 'Nicole Baker', 'Brandon Harris',
  'Michelle Clark', 'Jason Wright', 'Laura Martin', 'Ryan Thompson', 'Ashley Scott',
  'Carlos Ramirez', 'Megan Hall', 'Patrick O\'Brien', 'Diana Torres', 'Nathan Young',
  'Olivia King', 'Justin Green', 'Samantha Lewis', 'Tyler Robinson', 'Rebecca Walker',
  'Marcus Allen', 'Heather Phillips', 'Derek Campbell', 'Christina Evans', 'Brian Turner',
  'Victoria Collins', 'Adam Stewart', 'Katherine Murphy', 'Sean Bailey', 'Alexandra Reed',
  'Trevor Cook', 'Monica Price', 'Eric Howard', 'Hannah Morgan', 'Dustin Bell',
]

const channels: Conversation['channel'][] = ['voice', 'sms', 'web', 'social']
const statuses: Conversation['status'][] = ['ai_resolved', 'ai_resolved', 'ai_resolved', 'escalated', 'in_progress', 'abandoned']
const priorities: Conversation['priority'][] = ['urgent', 'pending', 'ai_handling', 'ai_handling', 'ai_handling']
const sentiments: Conversation['sentiment'][] = ['positive', 'positive', 'neutral', 'neutral', 'negative']
const locIds = ['soho', 'soho', 'williamsburg', 'hoboken', 'hoboken', 'white-plains', 'stamford']
const serviceNames = ['Botox', 'Dermal Filler', 'Hydrafacial', 'Laser Hair Removal', 'Chemical Peel', 'Body Contouring']

const summaries = [
  'Client inquired about Botox pricing and availability. AI booked appointment for next Tuesday.',
  'After-hours call about Hydrafacial. AI captured details and scheduled callback.',
  'Existing client rescheduling Dermal Filler appointment. AI handled rebooking.',
  'New client asking about Body Contouring packages. Escalated to specialist.',
  'Client confirming appointment and asking about pre-treatment instructions.',
  'Client requesting cancellation due to schedule conflict. AI offered alternative times.',
  'Walk-in availability inquiry for Chemical Peel. AI found same-day opening.',
  'Client asking about treatment financing options. Routed to billing.',
  'Follow-up on post-treatment care questions. AI provided guidelines.',
  'VIP client requesting specific provider. Escalated per VIP protocol.',
  'Client comparing Botox vs Filler options. AI explained differences and booked consultation.',
  'Urgent skin reaction inquiry. Immediately escalated to medical staff.',
  'Client interested in package deal for multiple services. AI quoted and booked.',
  'Appointment reminder confirmation. Client confirmed via SMS.',
  'New lead from social media ad. AI nurtured and booked consultation.',
]

function makeTranscript(summary: string, channel: string, day: number): Conversation['transcript'] {
  const base = daysAgoISO(day, 10 + (day % 8), day % 60)
  const msgs: Conversation['transcript'] = []

  if (channel === 'voice') {
    msgs.push({ role: 'client', content: 'Hi, I\'m calling about your services. Do you have availability this week?', timestamp: base })
    msgs.push({ role: 'ai', content: 'Thank you for calling GlowUp Aesthetics! I\'d love to help you find an appointment. What service are you interested in?', timestamp: daysAgoISO(day, 10 + (day % 8), (day % 60) + 1) })
    msgs.push({ role: 'client', content: summary.includes('Botox') ? 'I\'m interested in Botox.' : 'I\'d like to know more about your treatments.', timestamp: daysAgoISO(day, 10 + (day % 8), (day % 60) + 2) })
    msgs.push({ role: 'ai', content: 'Great choice! I have availability this Thursday at 2 PM and Friday at 10 AM. Which works better for you?', timestamp: daysAgoISO(day, 10 + (day % 8), (day % 60) + 3) })
  } else {
    msgs.push({ role: 'client', content: 'Hey! Do you have any openings this week?', timestamp: base })
    msgs.push({ role: 'ai', content: 'Hi there! Yes, we have several openings. What treatment are you looking for? 💫', timestamp: daysAgoISO(day, 10 + (day % 8), (day % 60) + 2) })
    msgs.push({ role: 'client', content: 'Looking for a Hydrafacial, preferably afternoon.', timestamp: daysAgoISO(day, 10 + (day % 8), (day % 60) + 5) })
  }

  return msgs
}

export const conversations: Conversation[] = convoNames.map((name, i) => {
  const day = i % 28
  const ch = channels[i % channels.length]
  const st = statuses[i % statuses.length]
  const pr = priorities[i % priorities.length]
  const se = sentiments[i % sentiments.length]
  const loc = locIds[i % locIds.length]
  const summary = summaries[i % summaries.length]
  const afterHours = i % 7 === 0

  return {
    id: `conv-${i + 1}`,
    clientName: name,
    clientPhone: `(${212 + (i % 5)}) ${500 + i}-${1000 + i * 3}`,
    channel: ch,
    status: st,
    priority: pr,
    summary,
    transcript: makeTranscript(summary, ch, day),
    locationId: loc,
    agentType: ch === 'voice' ? 'Voice Responder' : ch === 'sms' ? 'Text Concierge' : 'Escalation Router',
    timestamp: daysAgoISO(day, 9 + (i % 10), i % 60),
    duration: ch === 'voice' ? 120 + i * 15 : undefined,
    sentiment: se,
    resolved: st === 'ai_resolved' || st === 'escalated',
    afterHours,
    revenueImpact: st === 'ai_resolved' ? [450, 850, 250, 350, 200, 1200][i % 6] : undefined,
  }
})

const providers = [
  'Dr. Sarah Chen', 'Dr. Michael Ross', 'Dr. Emily Park',
  'Dr. James Liu', 'Dr. Amanda Foster', 'Dr. David Kim',
  'Dr. Rachel Adams', 'Dr. Kevin Martinez', 'Dr. Lisa Wang',
  'Dr. Thomas Moore', 'Dr. Nicole Baker', 'Dr. Brandon Harris',
]

const providersByLocation: Record<string, string[]> = {
  'soho': ['Dr. Sarah Chen', 'Dr. Michael Ross', 'Dr. Emily Park'],
  'williamsburg': ['Dr. James Liu', 'Dr. Amanda Foster'],
  'hoboken': ['Dr. David Kim', 'Dr. Rachel Adams', 'Dr. Kevin Martinez'],
  'white-plains': ['Dr. Lisa Wang', 'Dr. Thomas Moore'],
  'stamford': ['Dr. Nicole Baker', 'Dr. Brandon Harris'],
}

const apptStatuses: Appointment['status'][] = ['confirmed', 'confirmed', 'completed', 'completed', 'completed', 'no_show', 'cancelled', 'waitlist']
const bookedByOptions: Appointment['bookedBy'][] = ['ai', 'ai', 'staff', 'online']
const riskLevels: Appointment['noShowRisk'][] = ['low', 'low', 'low', 'medium', 'medium', 'high']
const times = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM']

export const appointments: Appointment[] = Array.from({ length: 100 }, (_, i) => {
  const day = i % 30
  const locId = locIds[i % locIds.length]
  const locProviders = providersByLocation[locId] || providers.slice(0, 2)
  const svc = services[i % services.length]
  const time = times[i % times.length]
  const endIdx = Math.min((i % times.length) + (svc.duration / 30), times.length - 1)

  return {
    id: `appt-${i + 1}`,
    clientName: convoNames[i % convoNames.length],
    clientId: `client-${(i % 50) + 1}`,
    service: svc.name,
    provider: locProviders[i % locProviders.length],
    locationId: locId,
    date: daysAgo(day),
    startTime: time,
    endTime: times[endIdx] || '5:30 PM',
    status: apptStatuses[i % apptStatuses.length],
    bookedBy: bookedByOptions[i % bookedByOptions.length],
    noShowRisk: riskLevels[i % riskLevels.length],
    room: (i % (locations.find(l => l.id === locId)?.rooms || 3)) + 1,
    revenue: svc.price,
  }
})

// 90 days × 5 locations = 450 daily metrics records
// Data arc: days 1-30 (before EIP), 31-60 (ramp-up), 61-90 (full operation)
export const dailyMetrics: DailyMetrics[] = (() => {
  const results: DailyMetrics[] = []
  const baseRevenue: Record<string, number> = {
    'soho': 3800, 'williamsburg': 2300, 'hoboken': 2600,
    'white-plains': 1600, 'stamford': 1500,
  }

  for (let day = 89; day >= 0; day--) {
    for (const loc of locations) {
      const phase = day >= 60 ? 'before' : day >= 30 ? 'rampup' : 'full'
      const base = baseRevenue[loc.id]
      // Variation based on day-of-week and deterministic "noise"
      const dayOfWeek = new Date(daysAgo(day)).getDay()
      const weekendFactor = dayOfWeek === 0 ? 0.4 : dayOfWeek === 6 ? 0.85 : 1.0
      const noise = ((day * 7 + loc.id.charCodeAt(0)) % 20 - 10) / 100

      let noShowRate: number, responseTimeAvg: number, utilizationRate: number, revenueMultiplier: number
      let rebookingRate: number

      if (phase === 'before') {
        noShowRate = 25 + ((day * 3 + loc.id.charCodeAt(0)) % 8) // 25-32%
        responseTimeAvg = 12600 + ((day * 17 + loc.id.charCodeAt(2)) % 3600) // 3.5-4.5 hours in seconds
        utilizationRate = 45 + ((day * 5 + loc.id.charCodeAt(0)) % 12) // 45-56%
        revenueMultiplier = 0.75 + noise * 0.5
        rebookingRate = 40 + ((day + loc.id.charCodeAt(0)) % 10) // 40-49%
      } else if (phase === 'rampup') {
        noShowRate = 15 + ((day * 3 + loc.id.charCodeAt(0)) % 7) // 15-21%
        responseTimeAvg = 30 + ((day * 7 + loc.id.charCodeAt(2)) % 35) // 30-65 seconds
        utilizationRate = 55 + ((day * 3 + loc.id.charCodeAt(0)) % 12) // 55-66%
        revenueMultiplier = 0.9 + noise * 0.3
        rebookingRate = 50 + ((day + loc.id.charCodeAt(0)) % 10) // 50-59%
      } else {
        noShowRate = 10 + ((day * 3 + loc.id.charCodeAt(0)) % 5) // 10-14%
        responseTimeAvg = 15 + ((day * 5 + loc.id.charCodeAt(2)) % 18) // 15-32 seconds
        utilizationRate = 65 + ((day * 3 + loc.id.charCodeAt(0)) % 14) // 65-78%
        revenueMultiplier = 1.0 + noise * 0.2
        rebookingRate = 58 + ((day + loc.id.charCodeAt(0)) % 12) // 58-69%
      }

      // White Plains underperforms slightly
      if (loc.id === 'white-plains') {
        noShowRate += 3
        utilizationRate -= 8
        revenueMultiplier *= 0.9
      }

      const revenue = Math.round(base * revenueMultiplier * weekendFactor)
      const bookings = Math.round(revenue / 450)
      const noShows = Math.round(bookings * noShowRate / 100)
      const callsTotal = 8 + ((day + loc.id.charCodeAt(0)) % 12)
      const missedRate = phase === 'before' ? 0.3 : phase === 'rampup' ? 0.1 : 0.04
      const callsMissed = Math.round(callsTotal * missedRate)
      const aiResolved = Math.round(callsTotal * (phase === 'before' ? 0 : phase === 'rampup' ? 0.5 : 0.75))
      const escalated = Math.round(callsTotal * (phase === 'before' ? 0 : 0.1))
      const revenueRecovered = phase === 'before' ? 0 : Math.round(
        (phase === 'rampup' ? 800 : 1600) * (loc.id === 'soho' ? 1.5 : 1) * (1 + noise)
      )

      results.push({
        date: daysAgo(day),
        locationId: loc.id,
        revenue,
        bookings,
        noShows,
        noShowRate,
        responseTimeAvg,
        utilizationRate,
        newClients: 1 + ((day + loc.id.charCodeAt(0)) % 4),
        rebookingRate,
        callsAnswered: callsTotal - callsMissed,
        callsMissed,
        aiResolved,
        escalated,
        revenueRecovered,
      })
    }
  }
  return results
})()

export const clients: Client[] = convoNames.map((name, i) => ({
  id: `client-${i + 1}`,
  name,
  email: `${name.toLowerCase().replace(/[' ]/g, '').replace(/ /g, '.')}@email.com`,
  phone: `(${212 + (i % 5)}) ${500 + i}-${1000 + i * 3}`,
  preferredLocation: locIds[i % locIds.length],
  totalVisits: 1 + (i * 3 + 7) % 25,
  clv: 200 + ((i * 137 + 41) % 14800),
  lastVisit: daysAgo(i % 30),
  joinDate: daysAgo(90 + (i * 7) % 365),
  favoriteService: serviceNames[i % serviceNames.length],
  noShowCount: i % 8 === 0 ? 2 + (i % 3) : i % 4 === 0 ? 1 : 0,
}))

export const alerts: Alert[] = [
  { id: 'alert-1', type: 'opportunity', title: 'SoHo Body Contouring demand surging — add Saturday block', description: 'Body Contouring bookings up 35% this week at SoHo. Waitlist has 6 clients.', locationId: 'soho', impact: 7200, timestamp: daysAgoISO(0, 8), actionLabel: 'Add Time Block', dismissed: false },
  { id: 'alert-2', type: 'warning', title: 'White Plains utilization dropped to 52% — suggest midweek promo', description: 'Tue-Thu slots underbooked. 8 rooms available.', locationId: 'white-plains', impact: 4800, timestamp: daysAgoISO(0, 7), actionLabel: 'Create Promo', dismissed: false },
  { id: 'alert-3', type: 'critical', title: 'White Plains no-show rate at 16.1% — enable deposit requirement', description: 'No-show rate well above 12% benchmark. Estimated weekly loss: $4,200.', locationId: 'white-plains', impact: 4200, timestamp: daysAgoISO(0, 9), actionLabel: 'Enable Deposits', dismissed: false },
  { id: 'alert-4', type: 'opportunity', title: '23 warm leads at Stamford not contacted in 48h+', description: 'Social media campaign generated leads that need follow-up.', locationId: 'stamford', impact: 8050, timestamp: daysAgoISO(1, 14), actionLabel: 'Auto-Nurture', dismissed: false },
  { id: 'alert-5', type: 'opportunity', title: 'Hoboken Botox rebooking rate below target — suggest loyalty discount', description: 'Rebooking rate at 58% vs 75% benchmark. Loyalty promo could help.', locationId: 'hoboken', impact: 5400, timestamp: daysAgoISO(1, 10), actionLabel: 'Create Offer', dismissed: false },
  { id: 'alert-6', type: 'warning', title: 'Williamsburg has 8 unbooked slots tomorrow', description: 'Tomorrow afternoon has 8 open treatment room slots.', locationId: 'williamsburg', impact: 3600, timestamp: daysAgoISO(0, 16), actionLabel: 'Fill from Waitlist', dismissed: false },
  { id: 'alert-7', type: 'opportunity', title: 'SoHo top 20 clients overdue for visit — trigger re-engagement', description: '20 high-CLV clients haven\'t visited in 30+ days.', locationId: 'soho', impact: 9500, timestamp: daysAgoISO(2, 9), actionLabel: 'Send Campaign', dismissed: false },
  { id: 'alert-8', type: 'warning', title: 'Stamford Hydrafacial inventory running low', description: 'Hydrafacial supplies projected to run out in 5 days at current pace.', locationId: 'stamford', impact: 2500, timestamp: daysAgoISO(1, 11), actionLabel: 'Reorder', dismissed: false },
  { id: 'alert-9', type: 'opportunity', title: 'Cross-sell Chemical Peel to Botox clients — 68% match rate', description: 'AI identified 34 Botox clients who match Chemical Peel profile.', locationId: 'soho', impact: 6800, timestamp: daysAgoISO(2, 8), actionLabel: 'Launch Upsell', dismissed: false },
  { id: 'alert-10', type: 'critical', title: '3 escalated conversations awaiting response >2 hours', description: 'Urgent client issues not yet addressed by staff.', locationId: 'soho', impact: 2550, timestamp: daysAgoISO(0, 11), actionLabel: 'Review Now', dismissed: false },
  { id: 'alert-11', type: 'opportunity', title: 'Williamsburg weekend demand increasing — consider extended hours', description: 'Saturday bookings full 3 weeks out. Sunday demand emerging.', locationId: 'williamsburg', impact: 5200, timestamp: daysAgoISO(3, 9), actionLabel: 'Extend Hours', dismissed: false },
  { id: 'alert-12', type: 'warning', title: 'Hoboken provider schedule imbalance — Dr. Adams overbooked', description: 'Dr. Adams at 95% utilization while Dr. Martinez at 55%.', locationId: 'hoboken', impact: 3200, timestamp: daysAgoISO(2, 10), actionLabel: 'Rebalance', dismissed: false },
  { id: 'alert-13', type: 'opportunity', title: 'Launch Dermal Filler package at White Plains — competitor gap', description: 'No competitor within 5 miles offers filler packages. Estimated capture: $15K/mo.', locationId: 'white-plains', impact: 15000, timestamp: daysAgoISO(4, 9), actionLabel: 'Create Package', dismissed: false },
  { id: 'alert-14', type: 'warning', title: 'SoHo AC maintenance scheduled — may affect Thursday appointments', description: 'Building maintenance notice for HVAC work on Thursday 2-4 PM.', locationId: 'soho', impact: 1800, timestamp: daysAgoISO(1, 15), actionLabel: 'Reschedule', dismissed: false },
  { id: 'alert-15', type: 'opportunity', title: 'Stamford client lifetime value trending up 22%', description: 'Average CLV increased from $2,100 to $2,562 over 60 days.', locationId: 'stamford', impact: 11500, timestamp: daysAgoISO(3, 8), actionLabel: 'View Analysis', dismissed: false },
  { id: 'alert-16', type: 'critical', title: 'Hoboken missed 5 after-hours calls last night', description: 'Voice Responder was briefly offline. Calls went to voicemail.', locationId: 'hoboken', impact: 2250, timestamp: daysAgoISO(0, 8), actionLabel: 'Review Calls', dismissed: true },
  { id: 'alert-17', type: 'opportunity', title: 'Social media conversion rate doubled at Williamsburg', description: 'Instagram campaign driving 2x more bookings than last month.', locationId: 'williamsburg', impact: 4200, timestamp: daysAgoISO(5, 10), actionLabel: 'Scale Campaign', dismissed: false },
  { id: 'alert-18', type: 'warning', title: 'White Plains rebooking rate declining — now 55%', description: 'Down from 62% last month. Industry benchmark is 75%.', locationId: 'white-plains', impact: 3800, timestamp: daysAgoISO(2, 14), actionLabel: 'Investigate', dismissed: false },
  { id: 'alert-19', type: 'opportunity', title: 'SoHo has capacity for 2 more Laser Hair Removal slots weekly', description: 'Room 4 underutilized on Tuesdays. Could add 2 laser slots.', locationId: 'soho', impact: 2800, timestamp: daysAgoISO(4, 11), actionLabel: 'Add Slots', dismissed: false },
  { id: 'alert-20', type: 'opportunity', title: 'Bundle opportunity: Hydrafacial + Peel package trending nationally', description: 'Competitor analysis shows combo packages growing 40% YoY.', locationId: 'soho', impact: 8400, timestamp: daysAgoISO(6, 9), actionLabel: 'Create Bundle', dismissed: false },
]
