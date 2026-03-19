import type {
  Location,
  Service,
  AgentStatus,
  Conversation,
  Appointment,
  DailyMetrics,
  Client,
  Alert,
  Opportunity,
} from '@/types'

// ---------------------------------------------------------------------------
// Date helpers -- all dates are relative to "today" so data always looks fresh
// ---------------------------------------------------------------------------
const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function daysAgo(n: number): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function daysAgoISO(n: number, hour = 9, minute = 0): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - n)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function minutesAgo(n: number): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - n)
  return d.toISOString()
}

// ---------------------------------------------------------------------------
// 1. Locations
// ---------------------------------------------------------------------------
export const locations: Location[] = [
  { id: 'soho', name: 'SoHo Flagship', city: 'Manhattan', state: 'NY', rooms: 6, providers: 3 },
  { id: 'williamsburg', name: 'Williamsburg', city: 'Brooklyn', state: 'NY', rooms: 4, providers: 2 },
  { id: 'hoboken', name: 'Hoboken', city: 'Hoboken', state: 'NJ', rooms: 4, providers: 3 },
  { id: 'white-plains', name: 'White Plains', city: 'White Plains', state: 'NY', rooms: 3, providers: 2 },
  { id: 'stamford', name: 'Stamford', city: 'Stamford', state: 'CT', rooms: 3, providers: 2 },
]

// ---------------------------------------------------------------------------
// 2. Services
// ---------------------------------------------------------------------------
export const services: Service[] = [
  { id: 'botox', name: 'Botox', price: 450, duration: 30, category: 'Injectable' },
  { id: 'filler', name: 'Dermal Filler', price: 850, duration: 45, category: 'Injectable' },
  { id: 'hydrafacial', name: 'Hydrafacial', price: 250, duration: 60, category: 'Facial' },
  { id: 'laser-hair', name: 'Laser Hair Removal', price: 350, duration: 45, category: 'Laser' },
  { id: 'peel', name: 'Chemical Peel', price: 200, duration: 30, category: 'Facial' },
  { id: 'body-contour', name: 'Body Contouring', price: 1200, duration: 90, category: 'Body' },
]

// ---------------------------------------------------------------------------
// 3. Agent Statuses
// ---------------------------------------------------------------------------
export const agentStatuses: AgentStatus[] = [
  // Command Center
  { id: 'agent-vr', name: 'Conversation Analyst', type: 'analysis', module: 'command-center', status: 'online', tasksHandled: 1247, lastActivity: minutesAgo(2) },
  { id: 'agent-tc', name: 'Response Monitor', type: 'monitoring', module: 'command-center', status: 'online', tasksHandled: 2381, lastActivity: minutesAgo(1) },
  { id: 'agent-er', name: 'Escalation Tracker', type: 'tracking', module: 'command-center', status: 'online', tasksHandled: 312, lastActivity: minutesAgo(8) },
  // Scheduling
  { id: 'agent-bo', name: 'Schedule Analyst', type: 'scheduling', module: 'scheduling', status: 'online', tasksHandled: 1893, lastActivity: minutesAgo(3) },
  { id: 'agent-ng', name: 'No-Show Predictor', type: 'prediction', module: 'scheduling', status: 'online', tasksHandled: 647, lastActivity: minutesAgo(5) },
  { id: 'agent-df', name: 'Demand Forecaster', type: 'analytics', module: 'scheduling', status: 'idle', tasksHandled: 89, lastActivity: minutesAgo(45) },
  // Intelligence
  { id: 'agent-ra', name: 'Revenue Analyst', type: 'analytics', module: 'intelligence', status: 'online', tasksHandled: 412, lastActivity: minutesAgo(12) },
  { id: 'agent-os', name: 'Opportunity Scout', type: 'analytics', module: 'intelligence', status: 'online', tasksHandled: 238, lastActivity: minutesAgo(18) },
  { id: 'agent-rg', name: 'Report Generator', type: 'reporting', module: 'intelligence', status: 'error', tasksHandled: 156, lastActivity: minutesAgo(120) },
]


// ---------------------------------------------------------------------------
// 4. Conversations (50 records)
// ---------------------------------------------------------------------------
export const conversations: Conversation[] = [
  // --- Voice conversations ---
  {
    id: 'conv-001', clientName: 'Maria Santos', clientPhone: '(212) 555-0101',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Booked Botox appointment for next Tuesday at SoHo.',
    transcript: [
      { role: 'ai', content: 'Thank you for calling Etienne Intelligence. How can I help you today?', timestamp: daysAgoISO(1, 14, 22) },
      { role: 'client', content: 'Hi, I want to schedule a Botox appointment at your SoHo location.', timestamp: daysAgoISO(1, 14, 22) },
      { role: 'ai', content: 'I have availability next Tuesday at 10 AM, 2 PM, or 4 PM. Which works best?', timestamp: daysAgoISO(1, 14, 23) },
      { role: 'client', content: '2 PM works perfectly.', timestamp: daysAgoISO(1, 14, 23) },
      { role: 'ai', content: 'Wonderful! You are confirmed for Botox at SoHo on Tuesday at 2 PM with Dr. Elena Vasquez. See you then!', timestamp: daysAgoISO(1, 14, 24) },
    ],
    locationId: 'soho', agentType: 'Conversation Analyst', timestamp: daysAgoISO(1, 14, 22),
    duration: 127, sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 450,
  },
  {
    id: 'conv-002', clientName: 'James Richardson', clientPhone: '(718) 555-0202',
    channel: 'voice', status: 'escalated', priority: 'urgent',
    summary: 'Client unhappy with filler results, requesting revision. Escalated to manager.',
    transcript: [
      { role: 'ai', content: 'Thank you for calling Etienne Intelligence. How may I assist you?', timestamp: daysAgoISO(2, 11, 5) },
      { role: 'client', content: 'I had filler done three days ago and I am not happy with the results. I want it fixed.', timestamp: daysAgoISO(2, 11, 5) },
      { role: 'ai', content: 'I am sorry to hear that. Let me connect you with our clinic manager who can review your case.', timestamp: daysAgoISO(2, 11, 6) },
      { role: 'staff', content: 'Hi James, this is Nicole. I can see you in person tomorrow at 10 AM for a complimentary assessment.', timestamp: daysAgoISO(2, 11, 8) },
    ],
    locationId: 'williamsburg', agentType: 'Conversation Analyst', timestamp: daysAgoISO(2, 11, 5),
    duration: 245, sentiment: 'negative', resolved: false, afterHours: false,
  },
  {
    id: 'conv-003', clientName: 'Priya Patel', clientPhone: '(201) 555-0303',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'After-hours inquiry captured — Hydrafacial booked at Hoboken, Saturday.',
    transcript: [
      { role: 'ai', content: 'Thanks for calling Etienne Intelligence after hours. I can still help with scheduling!', timestamp: daysAgoISO(3, 21, 45) },
      { role: 'client', content: 'Oh great, I was expecting voicemail. Can I book a Hydrafacial at Hoboken this Saturday?', timestamp: daysAgoISO(3, 21, 45) },
      { role: 'ai', content: 'Absolutely! I have 11 AM and 1 PM available. Which do you prefer?', timestamp: daysAgoISO(3, 21, 46) },
      { role: 'client', content: '11 AM please!', timestamp: daysAgoISO(3, 21, 46) },
      { role: 'ai', content: 'Done! Saturday at 11 AM for a Hydrafacial at Hoboken. Confirmation text sent.', timestamp: daysAgoISO(3, 21, 47) },
    ],
    locationId: 'hoboken', agentType: 'Conversation Analyst', timestamp: daysAgoISO(3, 21, 45),
    duration: 98, sentiment: 'positive', resolved: true, afterHours: true, revenueImpact: 250,
  },
  {
    id: 'conv-004', clientName: 'David Kim', clientPhone: '(914) 555-0404',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Rescheduled Chemical Peel from Wednesday to Friday at White Plains.',
    transcript: [
      { role: 'ai', content: 'Etienne Intelligence, how can I help?', timestamp: daysAgoISO(4, 10, 15) },
      { role: 'client', content: 'I need to reschedule my peel from Wednesday to Friday.', timestamp: daysAgoISO(4, 10, 15) },
      { role: 'ai', content: 'I found your Chemical Peel on Wednesday at 3 PM. I can move it to Friday at 3 PM. Shall I?', timestamp: daysAgoISO(4, 10, 16) },
      { role: 'client', content: 'Yes please.', timestamp: daysAgoISO(4, 10, 16) },
      { role: 'ai', content: 'Rescheduled! Friday at 3 PM at White Plains. Confirmation sent.', timestamp: daysAgoISO(4, 10, 16) },
    ],
    locationId: 'white-plains', agentType: 'Conversation Analyst', timestamp: daysAgoISO(4, 10, 15),
    duration: 72, sentiment: 'neutral', resolved: true, afterHours: false,
  },
  {
    id: 'conv-005', clientName: 'Ashley Wong', clientPhone: '(203) 555-0505',
    channel: 'voice', status: 'abandoned', priority: 'pending',
    summary: 'Client dropped call during hold — attempted callback but no answer.',
    transcript: [
      { role: 'ai', content: 'Thank you for calling Etienne Intelligence. One moment while I look that up.', timestamp: daysAgoISO(5, 16, 30) },
    ],
    locationId: 'stamford', agentType: 'Conversation Analyst', timestamp: daysAgoISO(5, 16, 30),
    duration: 18, sentiment: 'neutral', resolved: false, afterHours: false,
  },
  // --- SMS conversations ---
  {
    id: 'conv-006', clientName: 'Olivia Martinez', clientPhone: '(212) 555-0106',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Confirmed upcoming Botox appointment via text.',
    transcript: [
      { role: 'ai', content: 'Hi Olivia! This is Etienne. Just confirming your Botox appointment tomorrow at 11 AM at SoHo. Reply YES to confirm.', timestamp: daysAgoISO(1, 9, 0) },
      { role: 'client', content: 'YES', timestamp: daysAgoISO(1, 9, 12) },
      { role: 'ai', content: 'Great, you are all set! See you tomorrow.', timestamp: daysAgoISO(1, 9, 12) },
    ],
    locationId: 'soho', agentType: 'Response Monitor', timestamp: daysAgoISO(1, 9, 0),
    sentiment: 'positive', resolved: true, afterHours: false,
  },
  {
    id: 'conv-007', clientName: 'Emma Johnson', clientPhone: '(718) 555-0207',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'No-show prevention: client confirmed after reminder with 2-hour warning.',
    transcript: [
      { role: 'ai', content: 'Hi Emma, friendly reminder — your Hydrafacial is in 2 hours at Williamsburg. Still coming?', timestamp: daysAgoISO(0, 7, 30) },
      { role: 'client', content: 'Yes running a little late though, maybe 10 min', timestamp: daysAgoISO(0, 7, 45) },
      { role: 'ai', content: 'No problem! We will have everything ready. See you soon!', timestamp: daysAgoISO(0, 7, 45) },
    ],
    locationId: 'williamsburg', agentType: 'No-Show Predictor', timestamp: daysAgoISO(0, 7, 30),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 250,
  },
  {
    id: 'conv-008', clientName: 'Sarah Chen', clientPhone: '(201) 555-0308',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Client asked about pricing via text; AI provided menu and booked Body Contouring.',
    transcript: [
      { role: 'ai', content: 'Hi! Thanks for reaching out to Etienne. How can I help?', timestamp: daysAgoISO(2, 13, 10) },
      { role: 'client', content: 'How much is body contouring?', timestamp: daysAgoISO(2, 13, 12) },
      { role: 'ai', content: 'Body Contouring is $1,200 per session (90 min). Would you like to book?', timestamp: daysAgoISO(2, 13, 12) },
      { role: 'client', content: 'Yes next week at Hoboken', timestamp: daysAgoISO(2, 13, 15) },
      { role: 'ai', content: 'Booked for next Thursday at 10 AM at Hoboken. Confirmation sent!', timestamp: daysAgoISO(2, 13, 15) },
    ],
    locationId: 'hoboken', agentType: 'Response Monitor', timestamp: daysAgoISO(2, 13, 10),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 1200,
  },
  {
    id: 'conv-009', clientName: 'Rachel Green', clientPhone: '(914) 555-0409',
    channel: 'sms', status: 'escalated', priority: 'pending',
    summary: 'Client requesting refund for cancelled appointment. Escalated to billing.',
    transcript: [
      { role: 'client', content: 'I was charged even though I cancelled 24 hours in advance. I want a refund.', timestamp: daysAgoISO(3, 15, 0) },
      { role: 'ai', content: 'I apologize for the inconvenience. Let me connect you with our billing team right away.', timestamp: daysAgoISO(3, 15, 1) },
      { role: 'staff', content: 'Hi Rachel, I see the charge. Processing your refund now — please allow 3-5 business days.', timestamp: daysAgoISO(3, 15, 20) },
    ],
    locationId: 'white-plains', agentType: 'Escalation Tracker', timestamp: daysAgoISO(3, 15, 0),
    sentiment: 'negative', resolved: true, afterHours: false,
  },
  {
    id: 'conv-010', clientName: 'Nina Patel', clientPhone: '(203) 555-0510',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'After-hours text inquiry tracked — Laser Hair Removal booked at Stamford.',
    transcript: [
      { role: 'client', content: 'Can I book laser hair removal for this weekend?', timestamp: daysAgoISO(1, 22, 10) },
      { role: 'ai', content: 'Hi Nina! Saturday at 2 PM at Stamford is available. Would you like to book?', timestamp: daysAgoISO(1, 22, 10) },
      { role: 'client', content: 'Perfect!', timestamp: daysAgoISO(1, 22, 14) },
      { role: 'ai', content: 'All booked! Saturday 2 PM at Stamford for Laser Hair Removal. See you then!', timestamp: daysAgoISO(1, 22, 14) },
    ],
    locationId: 'stamford', agentType: 'Response Monitor', timestamp: daysAgoISO(1, 22, 10),
    sentiment: 'positive', resolved: true, afterHours: true, revenueImpact: 350,
  },
  // --- Web chat conversations ---
  {
    id: 'conv-011', clientName: 'Jessica Morgan', clientPhone: '(212) 555-0111',
    channel: 'web', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Website visitor inquired about first-time specials; booked Hydrafacial.',
    transcript: [
      { role: 'client', content: 'Hi, is there a first-time client discount?', timestamp: daysAgoISO(0, 10, 30) },
      { role: 'ai', content: 'Welcome! New clients get 15% off their first treatment. Our most popular intro service is the Hydrafacial at $250 (would be $212.50 with your discount). Want to book?', timestamp: daysAgoISO(0, 10, 30) },
      { role: 'client', content: 'Yes at SoHo please!', timestamp: daysAgoISO(0, 10, 32) },
      { role: 'ai', content: 'Booked! Wednesday at 11 AM at SoHo Flagship. Welcome to Etienne!', timestamp: daysAgoISO(0, 10, 32) },
    ],
    locationId: 'soho', agentType: 'Response Monitor', timestamp: daysAgoISO(0, 10, 30),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 212,
  },
  {
    id: 'conv-012', clientName: 'Michael Brown', clientPhone: '(718) 555-0212',
    channel: 'web', status: 'in_progress', priority: 'ai_handling',
    summary: 'Client browsing treatment options; currently comparing Botox vs Filler.',
    transcript: [
      { role: 'client', content: 'What is the difference between Botox and fillers?', timestamp: minutesAgo(15) },
      { role: 'ai', content: 'Great question! Botox relaxes muscles to smooth wrinkles ($450, 30 min). Fillers add volume to areas like lips and cheeks ($850, 45 min). Which concerns are you looking to address?', timestamp: minutesAgo(14) },
      { role: 'client', content: 'Mostly the lines on my forehead', timestamp: minutesAgo(10) },
      { role: 'ai', content: 'Botox would be ideal for forehead lines. Results last 3-4 months. Would you like to book a consultation?', timestamp: minutesAgo(10) },
    ],
    locationId: 'williamsburg', agentType: 'Response Monitor', timestamp: minutesAgo(15),
    sentiment: 'positive', resolved: false, afterHours: false, revenueImpact: 450,
  },
  {
    id: 'conv-013', clientName: 'Lauren White', clientPhone: '(201) 555-0313',
    channel: 'web', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Client checked availability and booked Chemical Peel at Hoboken.',
    transcript: [
      { role: 'client', content: 'Do you have any Chemical Peel slots this week at Hoboken?', timestamp: daysAgoISO(1, 12, 0) },
      { role: 'ai', content: 'Yes! Thursday at 9 AM, 11 AM, and 3 PM are all open. Which works?', timestamp: daysAgoISO(1, 12, 0) },
      { role: 'client', content: '3 PM Thursday', timestamp: daysAgoISO(1, 12, 2) },
      { role: 'ai', content: 'Confirmed! Chemical Peel, Thursday 3 PM at Hoboken. Total is $200.', timestamp: daysAgoISO(1, 12, 2) },
    ],
    locationId: 'hoboken', agentType: 'Response Monitor', timestamp: daysAgoISO(1, 12, 0),
    sentiment: 'neutral', resolved: true, afterHours: false, revenueImpact: 200,
  },
  {
    id: 'conv-014', clientName: 'Tom Garcia', clientPhone: '(914) 555-0414',
    channel: 'web', status: 'abandoned', priority: 'pending',
    summary: 'Visitor started chat but did not respond after initial greeting.',
    transcript: [
      { role: 'ai', content: 'Welcome to Etienne Intelligence! How can I help you today?', timestamp: daysAgoISO(2, 18, 0) },
    ],
    locationId: 'white-plains', agentType: 'Response Monitor', timestamp: daysAgoISO(2, 18, 0),
    sentiment: 'neutral', resolved: false, afterHours: false,
  },
  {
    id: 'conv-015', clientName: 'Amanda Brooks', clientPhone: '(203) 555-0515',
    channel: 'web', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'After-hours web inquiry — booked Dermal Filler at Stamford.',
    transcript: [
      { role: 'client', content: 'I would like to get lip filler. What are my options?', timestamp: daysAgoISO(4, 23, 15) },
      { role: 'ai', content: 'We offer premium Dermal Filler treatments at $850 (45 min). I can book you at our Stamford location. Next available is Monday at 1 PM.', timestamp: daysAgoISO(4, 23, 15) },
      { role: 'client', content: 'Book it!', timestamp: daysAgoISO(4, 23, 18) },
      { role: 'ai', content: 'You are set for Monday at 1 PM at Stamford. Confirmation emailed!', timestamp: daysAgoISO(4, 23, 18) },
    ],
    locationId: 'stamford', agentType: 'Response Monitor', timestamp: daysAgoISO(4, 23, 15),
    sentiment: 'positive', resolved: true, afterHours: true, revenueImpact: 850,
  },
  // --- Social conversations ---
  {
    id: 'conv-016', clientName: 'Brittany Scott', clientPhone: '(212) 555-0116',
    channel: 'social', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Instagram DM inquiry about Botox — booked at SoHo.',
    transcript: [
      { role: 'client', content: 'Saw your before/after pics! How do I book Botox?', timestamp: daysAgoISO(0, 19, 30) },
      { role: 'ai', content: 'Thanks for the love! I can book you right here. SoHo has openings Thursday at 10 AM and 3 PM. Interested?', timestamp: daysAgoISO(0, 19, 30) },
      { role: 'client', content: '10 AM!', timestamp: daysAgoISO(0, 19, 35) },
      { role: 'ai', content: 'Booked! Thursday 10 AM at SoHo for Botox ($450). DM me if you need anything else!', timestamp: daysAgoISO(0, 19, 35) },
    ],
    locationId: 'soho', agentType: 'Response Monitor', timestamp: daysAgoISO(0, 19, 30),
    sentiment: 'positive', resolved: true, afterHours: true, revenueImpact: 450,
  },
  {
    id: 'conv-017', clientName: 'Kayla Nguyen', clientPhone: '(718) 555-0217',
    channel: 'social', status: 'in_progress', priority: 'ai_handling',
    summary: 'TikTok lead asking about Body Contouring packages.',
    transcript: [
      { role: 'client', content: 'Do you have package deals for body contouring?', timestamp: minutesAgo(30) },
      { role: 'ai', content: 'Yes! We offer a 3-session Body Contouring package at $3,200 (save $400). Sessions are 90 minutes each. Want to learn more?', timestamp: minutesAgo(29) },
    ],
    locationId: 'williamsburg', agentType: 'Response Monitor', timestamp: minutesAgo(30),
    sentiment: 'positive', resolved: false, afterHours: false, revenueImpact: 3200,
  },
  {
    id: 'conv-018', clientName: 'Megan Foster', clientPhone: '(201) 555-0318',
    channel: 'social', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Facebook message — rebooked cancelled Laser Hair Removal.',
    transcript: [
      { role: 'client', content: 'I had to cancel my laser appointment last week. Can I rebook?', timestamp: daysAgoISO(1, 16, 20) },
      { role: 'ai', content: 'Of course! I have Friday at 11 AM or Saturday at 9 AM at Hoboken. Which works?', timestamp: daysAgoISO(1, 16, 20) },
      { role: 'client', content: 'Saturday 9 AM', timestamp: daysAgoISO(1, 16, 25) },
      { role: 'ai', content: 'Rebooked! Saturday 9 AM at Hoboken for Laser Hair Removal.', timestamp: daysAgoISO(1, 16, 25) },
    ],
    locationId: 'hoboken', agentType: 'Response Monitor', timestamp: daysAgoISO(1, 16, 20),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 350,
  },
  {
    id: 'conv-019', clientName: 'Hannah Lee', clientPhone: '(914) 555-0419',
    channel: 'social', status: 'escalated', priority: 'urgent',
    summary: 'Negative review response — client had a bad experience, needs follow-up.',
    transcript: [
      { role: 'client', content: 'I left a review about my terrible experience. Nobody has reached out.', timestamp: daysAgoISO(2, 14, 0) },
      { role: 'ai', content: 'I am so sorry about your experience, Hannah. I am escalating this to our clinic director who will personally call you within the hour.', timestamp: daysAgoISO(2, 14, 1) },
    ],
    locationId: 'white-plains', agentType: 'Escalation Tracker', timestamp: daysAgoISO(2, 14, 0),
    sentiment: 'negative', resolved: false, afterHours: false,
  },
  {
    id: 'conv-020', clientName: 'Zoe Adams', clientPhone: '(203) 555-0520',
    channel: 'social', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Instagram DM — answered pre-care questions for Chemical Peel.',
    transcript: [
      { role: 'client', content: 'What should I avoid before my peel appointment?', timestamp: daysAgoISO(3, 11, 0) },
      { role: 'ai', content: 'Great question! Avoid retinoids for 5 days, skip exfoliants for 3 days, and wear SPF 30+. No direct sun 48 hours before. Anything else?', timestamp: daysAgoISO(3, 11, 0) },
      { role: 'client', content: 'Thank you, that is really helpful!', timestamp: daysAgoISO(3, 11, 5) },
    ],
    locationId: 'stamford', agentType: 'Response Monitor', timestamp: daysAgoISO(3, 11, 0),
    sentiment: 'positive', resolved: true, afterHours: false,
  },
  // --- Conversations 21-30 ---
  {
    id: 'conv-021', clientName: 'Danielle Parker', clientPhone: '(212) 555-0121',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Booked Dermal Filler at SoHo. Client is a returning VIP.',
    transcript: [
      { role: 'ai', content: 'Welcome back, Danielle! I see you are a VIP member. How can I help?', timestamp: daysAgoISO(5, 9, 0) },
      { role: 'client', content: 'I need more filler — same as last time.', timestamp: daysAgoISO(5, 9, 0) },
      { role: 'ai', content: 'Dermal Filler with Dr. Elena Vasquez at SoHo. Next Monday at 2 PM?', timestamp: daysAgoISO(5, 9, 1) },
      { role: 'client', content: 'Perfect.', timestamp: daysAgoISO(5, 9, 1) },
    ],
    locationId: 'soho', agentType: 'Conversation Analyst', timestamp: daysAgoISO(5, 9, 0),
    duration: 65, sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 850,
  },
  {
    id: 'conv-022', clientName: 'Chris Evans', clientPhone: '(718) 555-0222',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'No-show prevention successful — client confirmed with 1hr warning.',
    transcript: [
      { role: 'ai', content: 'Hi Chris, your Botox appointment at Williamsburg is in 1 hour. See you soon?', timestamp: daysAgoISO(6, 12, 0) },
      { role: 'client', content: 'On my way!', timestamp: daysAgoISO(6, 12, 5) },
    ],
    locationId: 'williamsburg', agentType: 'No-Show Predictor', timestamp: daysAgoISO(6, 12, 0),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 450,
  },
  {
    id: 'conv-023', clientName: 'Lisa Chang', clientPhone: '(201) 555-0323',
    channel: 'web', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'New client booked 3-session Laser Hair Removal package at Hoboken.',
    transcript: [
      { role: 'client', content: 'How many laser sessions do I need for full results?', timestamp: daysAgoISO(6, 15, 0) },
      { role: 'ai', content: 'Most clients see best results with 6-8 sessions spaced 4-6 weeks apart. We recommend starting with our 3-session package. Want to book your first?', timestamp: daysAgoISO(6, 15, 0) },
      { role: 'client', content: 'Yes, at Hoboken please.', timestamp: daysAgoISO(6, 15, 3) },
      { role: 'ai', content: 'Booked! First session next Wednesday at 2 PM at Hoboken.', timestamp: daysAgoISO(6, 15, 3) },
    ],
    locationId: 'hoboken', agentType: 'Response Monitor', timestamp: daysAgoISO(6, 15, 0),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 1050,
  },
  {
    id: 'conv-024', clientName: 'Amy Stewart', clientPhone: '(914) 555-0424',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'After-hours inquiry captured — Hydrafacial booked at White Plains.',
    transcript: [
      { role: 'ai', content: 'Etienne after-hours assistant. I can help with bookings!', timestamp: daysAgoISO(7, 20, 30) },
      { role: 'client', content: 'I want a Hydrafacial this weekend.', timestamp: daysAgoISO(7, 20, 30) },
      { role: 'ai', content: 'Saturday at 10 AM at White Plains is available. Shall I book?', timestamp: daysAgoISO(7, 20, 31) },
      { role: 'client', content: 'Yes!', timestamp: daysAgoISO(7, 20, 31) },
    ],
    locationId: 'white-plains', agentType: 'Conversation Analyst', timestamp: daysAgoISO(7, 20, 30),
    duration: 58, sentiment: 'positive', resolved: true, afterHours: true, revenueImpact: 250,
  },
  {
    id: 'conv-025', clientName: 'Rebecca Hill', clientPhone: '(203) 555-0525',
    channel: 'sms', status: 'abandoned', priority: 'pending',
    summary: 'Client did not reply to no-show follow-up text.',
    transcript: [
      { role: 'ai', content: 'Hi Rebecca, we missed you today at your Chemical Peel appointment. Would you like to reschedule?', timestamp: daysAgoISO(8, 17, 0) },
    ],
    locationId: 'stamford', agentType: 'No-Show Predictor', timestamp: daysAgoISO(8, 17, 0),
    sentiment: 'neutral', resolved: false, afterHours: false,
  },
  {
    id: 'conv-026', clientName: 'Vanessa Cruz', clientPhone: '(212) 555-0126',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Booked Body Contouring at SoHo — high-value conversion.',
    transcript: [
      { role: 'ai', content: 'Etienne Intelligence, how can I help?', timestamp: daysAgoISO(8, 11, 0) },
      { role: 'client', content: 'I want to try body contouring. What does it involve?', timestamp: daysAgoISO(8, 11, 0) },
      { role: 'ai', content: 'Body Contouring is a 90-minute non-invasive treatment at $1,200. It targets stubborn fat areas. Our next SoHo slot is Thursday at 10 AM.', timestamp: daysAgoISO(8, 11, 1) },
      { role: 'client', content: 'Book me in.', timestamp: daysAgoISO(8, 11, 2) },
      { role: 'ai', content: 'Done! Thursday 10 AM at SoHo for Body Contouring. See you then!', timestamp: daysAgoISO(8, 11, 2) },
    ],
    locationId: 'soho', agentType: 'Conversation Analyst', timestamp: daysAgoISO(8, 11, 0),
    duration: 145, sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 1200,
  },
  {
    id: 'conv-027', clientName: 'Tiffany Ross', clientPhone: '(718) 555-0227',
    channel: 'social', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Instagram inquiry about Hydrafacial downtime — converted to booking.',
    transcript: [
      { role: 'client', content: 'Is there any downtime with the Hydrafacial?', timestamp: daysAgoISO(9, 13, 0) },
      { role: 'ai', content: 'Zero downtime! You can even apply makeup right after. Most clients do it on their lunch break. Want to try it?', timestamp: daysAgoISO(9, 13, 0) },
      { role: 'client', content: 'Love that. Book me at Williamsburg for Saturday.', timestamp: daysAgoISO(9, 13, 5) },
      { role: 'ai', content: 'Saturday at 10 AM at Williamsburg. See you there!', timestamp: daysAgoISO(9, 13, 5) },
    ],
    locationId: 'williamsburg', agentType: 'Response Monitor', timestamp: daysAgoISO(9, 13, 0),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 250,
  },
  {
    id: 'conv-028', clientName: 'Jasmine Washington', clientPhone: '(201) 555-0328',
    channel: 'voice', status: 'escalated', priority: 'urgent',
    summary: 'Client reporting adverse reaction post-Botox. Escalated to medical director.',
    transcript: [
      { role: 'ai', content: 'Etienne Intelligence, how may I help?', timestamp: daysAgoISO(10, 8, 0) },
      { role: 'client', content: 'I had Botox yesterday and my eyelid is drooping. I am really worried.', timestamp: daysAgoISO(10, 8, 0) },
      { role: 'ai', content: 'I understand your concern. Let me connect you with our medical director immediately.', timestamp: daysAgoISO(10, 8, 1) },
      { role: 'staff', content: 'Jasmine, this is Dr. Rivera. Mild ptosis can occur but is temporary. Please come in today at 2 PM for evaluation.', timestamp: daysAgoISO(10, 8, 5) },
    ],
    locationId: 'hoboken', agentType: 'Escalation Tracker', timestamp: daysAgoISO(10, 8, 0),
    duration: 310, sentiment: 'negative', resolved: true, afterHours: false,
  },
  {
    id: 'conv-029', clientName: 'Nicole Reed', clientPhone: '(914) 555-0429',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Waitlist notification — filled a cancellation slot at White Plains.',
    transcript: [
      { role: 'ai', content: 'Hi Nicole! A Botox slot just opened up tomorrow at 11 AM at White Plains. You are first on the waitlist. Want it?', timestamp: daysAgoISO(10, 16, 0) },
      { role: 'client', content: 'Yes!!! Grab it for me.', timestamp: daysAgoISO(10, 16, 2) },
      { role: 'ai', content: 'Done! Tomorrow at 11 AM. Confirmation sent.', timestamp: daysAgoISO(10, 16, 2) },
    ],
    locationId: 'white-plains', agentType: 'Schedule Analyst', timestamp: daysAgoISO(10, 16, 0),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 450,
  },
  {
    id: 'conv-030', clientName: 'Sandra Miller', clientPhone: '(203) 555-0530',
    channel: 'web', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'After-hours web chat — booked Botox at Stamford.',
    transcript: [
      { role: 'client', content: 'Can I book Botox for next week?', timestamp: daysAgoISO(11, 22, 0) },
      { role: 'ai', content: 'Absolutely! Tuesday at 3 PM at Stamford is available. Want to book?', timestamp: daysAgoISO(11, 22, 0) },
      { role: 'client', content: 'Yes please', timestamp: daysAgoISO(11, 22, 3) },
      { role: 'ai', content: 'Booked! Tuesday 3 PM at Stamford for Botox. See you then!', timestamp: daysAgoISO(11, 22, 3) },
    ],
    locationId: 'stamford', agentType: 'Response Monitor', timestamp: daysAgoISO(11, 22, 0),
    sentiment: 'positive', resolved: true, afterHours: true, revenueImpact: 450,
  },
  // --- Conversations 31-40 ---
  {
    id: 'conv-031', clientName: 'Diana Torres', clientPhone: '(212) 555-0131',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Returning client rebooked Hydrafacial at SoHo — monthly standing appointment.',
    transcript: [
      { role: 'ai', content: 'Welcome back, Diana! Time for your monthly Hydrafacial?', timestamp: daysAgoISO(12, 10, 0) },
      { role: 'client', content: 'You know me so well! Same time next month too.', timestamp: daysAgoISO(12, 10, 0) },
      { role: 'ai', content: 'Both booked! This Saturday and the 3rd Saturday of next month, both at 9 AM at SoHo.', timestamp: daysAgoISO(12, 10, 1) },
    ],
    locationId: 'soho', agentType: 'Conversation Analyst', timestamp: daysAgoISO(12, 10, 0),
    duration: 45, sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 500,
  },
  {
    id: 'conv-032', clientName: 'Angela Wright', clientPhone: '(718) 555-0232',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Rebooking reminder converted — Laser Hair Removal follow-up at Williamsburg.',
    transcript: [
      { role: 'ai', content: 'Hi Angela! It has been 6 weeks since your last Laser Hair session. Ready for the next one?', timestamp: daysAgoISO(13, 10, 0) },
      { role: 'client', content: 'Yes! Friday works best.', timestamp: daysAgoISO(13, 10, 30) },
      { role: 'ai', content: 'Friday at 1 PM at Williamsburg. See you then!', timestamp: daysAgoISO(13, 10, 30) },
    ],
    locationId: 'williamsburg', agentType: 'No-Show Predictor', timestamp: daysAgoISO(13, 10, 0),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 350,
  },
  {
    id: 'conv-033', clientName: 'Kevin Murphy', clientPhone: '(201) 555-0333',
    channel: 'web', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Client compared services and booked Chemical Peel at Hoboken.',
    transcript: [
      { role: 'client', content: 'What facial treatment do you recommend for acne scars?', timestamp: daysAgoISO(14, 14, 0) },
      { role: 'ai', content: 'For acne scars, I recommend our Chemical Peel ($200, 30 min). It promotes cell turnover and reduces scarring over multiple sessions. Want to start?', timestamp: daysAgoISO(14, 14, 0) },
      { role: 'client', content: 'Sounds good, book at Hoboken.', timestamp: daysAgoISO(14, 14, 5) },
    ],
    locationId: 'hoboken', agentType: 'Response Monitor', timestamp: daysAgoISO(14, 14, 0),
    sentiment: 'neutral', resolved: true, afterHours: false, revenueImpact: 200,
  },
  {
    id: 'conv-034', clientName: 'Patricia Collins', clientPhone: '(914) 555-0434',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'After-hours inquiry captured — Dermal Filler booked at White Plains.',
    transcript: [
      { role: 'ai', content: 'Etienne after-hours booking assistant. How can I help?', timestamp: daysAgoISO(14, 21, 0) },
      { role: 'client', content: 'I need cheek filler. What do you have at White Plains?', timestamp: daysAgoISO(14, 21, 0) },
      { role: 'ai', content: 'We have Dermal Filler at $850 for 45 minutes. Next opening is Monday at 10 AM. Interested?', timestamp: daysAgoISO(14, 21, 1) },
      { role: 'client', content: 'Book it.', timestamp: daysAgoISO(14, 21, 2) },
    ],
    locationId: 'white-plains', agentType: 'Conversation Analyst', timestamp: daysAgoISO(14, 21, 0),
    duration: 82, sentiment: 'positive', resolved: true, afterHours: true, revenueImpact: 850,
  },
  {
    id: 'conv-035', clientName: 'Ryan Cooper', clientPhone: '(203) 555-0535',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Client confirmed appointment via two-way SMS.',
    transcript: [
      { role: 'ai', content: 'Reminder: Body Contouring at Stamford tomorrow at 9 AM. Reply YES to confirm.', timestamp: daysAgoISO(15, 9, 0) },
      { role: 'client', content: 'YES', timestamp: daysAgoISO(15, 9, 10) },
    ],
    locationId: 'stamford', agentType: 'No-Show Predictor', timestamp: daysAgoISO(15, 9, 0),
    sentiment: 'neutral', resolved: true, afterHours: false, revenueImpact: 1200,
  },
  {
    id: 'conv-036', clientName: 'Michelle Gonzalez', clientPhone: '(212) 555-0136',
    channel: 'social', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Converted Instagram follower to Botox booking at SoHo.',
    transcript: [
      { role: 'client', content: 'How much for Botox? I follow you guys and love your content!', timestamp: daysAgoISO(16, 17, 0) },
      { role: 'ai', content: 'Thank you! Botox is $450 per session. New followers get priority booking. SoHo has openings Wednesday. Want in?', timestamp: daysAgoISO(16, 17, 0) },
      { role: 'client', content: 'Yes Wednesday afternoon!', timestamp: daysAgoISO(16, 17, 8) },
      { role: 'ai', content: 'Booked for Wednesday at 2 PM at SoHo Flagship!', timestamp: daysAgoISO(16, 17, 8) },
    ],
    locationId: 'soho', agentType: 'Response Monitor', timestamp: daysAgoISO(16, 17, 0),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 450,
  },
  {
    id: 'conv-037', clientName: 'Jennifer Lopez', clientPhone: '(718) 555-0237',
    channel: 'voice', status: 'escalated', priority: 'pending',
    summary: 'Client requesting appointment outside normal hours. Escalated to manager.',
    transcript: [
      { role: 'client', content: 'I can only come Sundays. Do you have Sunday availability?', timestamp: daysAgoISO(17, 14, 0) },
      { role: 'ai', content: 'Our standard hours are Monday through Saturday. Let me check with the clinic manager about a special arrangement.', timestamp: daysAgoISO(17, 14, 0) },
      { role: 'staff', content: 'Hi Jennifer, we can accommodate a Sunday appointment on the first Sunday of each month. Would that work?', timestamp: daysAgoISO(17, 14, 30) },
    ],
    locationId: 'williamsburg', agentType: 'Escalation Tracker', timestamp: daysAgoISO(17, 14, 0),
    duration: 185, sentiment: 'neutral', resolved: true, afterHours: false,
  },
  {
    id: 'conv-038', clientName: 'Catherine Bell', clientPhone: '(201) 555-0338',
    channel: 'web', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Bulk booking — mother and daughter booked Hydrafacials together.',
    transcript: [
      { role: 'client', content: 'Can I book two Hydrafacials side by side? One for me and one for my daughter.', timestamp: daysAgoISO(18, 11, 0) },
      { role: 'ai', content: 'Absolutely! I have two adjacent rooms at Hoboken on Saturday at 11 AM. Both are $250 each. Shall I book?', timestamp: daysAgoISO(18, 11, 0) },
      { role: 'client', content: 'Yes that would be wonderful!', timestamp: daysAgoISO(18, 11, 3) },
    ],
    locationId: 'hoboken', agentType: 'Schedule Analyst', timestamp: daysAgoISO(18, 11, 0),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 500,
  },
  {
    id: 'conv-039', clientName: 'Samantha Phillips', clientPhone: '(914) 555-0439',
    channel: 'sms', status: 'abandoned', priority: 'pending',
    summary: 'Rebooking outreach — client did not respond.',
    transcript: [
      { role: 'ai', content: 'Hi Samantha! It has been 3 months since your last Botox session. Time for a touch-up? Reply to book.', timestamp: daysAgoISO(19, 10, 0) },
    ],
    locationId: 'white-plains', agentType: 'No-Show Predictor', timestamp: daysAgoISO(19, 10, 0),
    sentiment: 'neutral', resolved: false, afterHours: false,
  },
  {
    id: 'conv-040', clientName: 'Emily Turner', clientPhone: '(203) 555-0540',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Quick reschedule handled by AI — Chemical Peel at Stamford.',
    transcript: [
      { role: 'ai', content: 'Etienne Intelligence, how can I help?', timestamp: daysAgoISO(20, 9, 30) },
      { role: 'client', content: 'Need to move my peel from Tuesday to Thursday.', timestamp: daysAgoISO(20, 9, 30) },
      { role: 'ai', content: 'Moved to Thursday at 2 PM at Stamford. All set!', timestamp: daysAgoISO(20, 9, 31) },
    ],
    locationId: 'stamford', agentType: 'Conversation Analyst', timestamp: daysAgoISO(20, 9, 30),
    duration: 38, sentiment: 'neutral', resolved: true, afterHours: false,
  },
  // --- Conversations 41-50 ---
  {
    id: 'conv-041', clientName: 'Sofia Ramirez', clientPhone: '(212) 555-0141',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'VIP client booked Filler + Botox combo at SoHo.',
    transcript: [
      { role: 'ai', content: 'Welcome back, Sofia! What can we do for you today?', timestamp: daysAgoISO(21, 10, 0) },
      { role: 'client', content: 'I want to do Botox and filler in the same session.', timestamp: daysAgoISO(21, 10, 0) },
      { role: 'ai', content: 'Perfect combo! I can book 75 minutes with Dr. Elena Vasquez at SoHo. Friday at 1 PM?', timestamp: daysAgoISO(21, 10, 1) },
      { role: 'client', content: 'Done.', timestamp: daysAgoISO(21, 10, 1) },
    ],
    locationId: 'soho', agentType: 'Conversation Analyst', timestamp: daysAgoISO(21, 10, 0),
    duration: 55, sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 1300,
  },
  {
    id: 'conv-042', clientName: 'Laura Bennett', clientPhone: '(718) 555-0242',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'No-show rescue — client was running late, appointment held.',
    transcript: [
      { role: 'ai', content: 'Hi Laura, your Laser Hair appointment at Williamsburg starts in 15 min. On your way?', timestamp: daysAgoISO(22, 13, 45) },
      { role: 'client', content: 'Stuck in traffic, be there in 20', timestamp: daysAgoISO(22, 13, 48) },
      { role: 'ai', content: 'No worries! I have adjusted your slot. Take your time and stay safe.', timestamp: daysAgoISO(22, 13, 48) },
    ],
    locationId: 'williamsburg', agentType: 'No-Show Predictor', timestamp: daysAgoISO(22, 13, 45),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 350,
  },
  {
    id: 'conv-043', clientName: 'Gregory Hall', clientPhone: '(201) 555-0343',
    channel: 'web', status: 'in_progress', priority: 'ai_handling',
    summary: 'Client comparing Body Contouring with competitor pricing.',
    transcript: [
      { role: 'client', content: 'How does your body contouring compare to CoolSculpting?', timestamp: minutesAgo(45) },
      { role: 'ai', content: 'Our Body Contouring uses the latest non-invasive technology similar to CoolSculpting at $1,200 per session. Many clients see results after just one session. Would you like a free consultation?', timestamp: minutesAgo(44) },
      { role: 'client', content: 'Maybe. What is your cancellation policy?', timestamp: minutesAgo(40) },
    ],
    locationId: 'hoboken', agentType: 'Response Monitor', timestamp: minutesAgo(45),
    sentiment: 'neutral', resolved: false, afterHours: false, revenueImpact: 1200,
  },
  {
    id: 'conv-044', clientName: 'Martha Young', clientPhone: '(914) 555-0444',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'After-hours inquiry captured — Botox booked at White Plains via voicemail.',
    transcript: [
      { role: 'ai', content: 'Etienne after-hours. I can help with scheduling.', timestamp: daysAgoISO(22, 21, 15) },
      { role: 'client', content: 'I was just going to leave a voicemail! Can I book Botox for next week?', timestamp: daysAgoISO(22, 21, 15) },
      { role: 'ai', content: 'No voicemail needed! Tuesday at 11 AM at White Plains. Booked!', timestamp: daysAgoISO(22, 21, 16) },
    ],
    locationId: 'white-plains', agentType: 'Conversation Analyst', timestamp: daysAgoISO(22, 21, 15),
    duration: 62, sentiment: 'positive', resolved: true, afterHours: true, revenueImpact: 450,
  },
  {
    id: 'conv-045', clientName: 'Heather Morgan', clientPhone: '(203) 555-0545',
    channel: 'social', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Facebook Messenger — booked Hydrafacial at Stamford after seeing ad.',
    transcript: [
      { role: 'client', content: 'Saw your Facebook ad for Hydrafacial. Is the $250 price for real?', timestamp: daysAgoISO(23, 12, 0) },
      { role: 'ai', content: 'Yes! $250 for a full 60-minute Hydrafacial treatment. Our Stamford location has openings all week!', timestamp: daysAgoISO(23, 12, 0) },
      { role: 'client', content: 'Thursday please', timestamp: daysAgoISO(23, 12, 5) },
      { role: 'ai', content: 'Thursday at 2 PM at Stamford. Booked and confirmed!', timestamp: daysAgoISO(23, 12, 5) },
    ],
    locationId: 'stamford', agentType: 'Response Monitor', timestamp: daysAgoISO(23, 12, 0),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 250,
  },
  {
    id: 'conv-046', clientName: 'Janet Cooper', clientPhone: '(212) 555-0146',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Automated post-visit follow-up — client left positive feedback.',
    transcript: [
      { role: 'ai', content: 'Hi Janet! How was your Botox treatment at SoHo today? Rate 1-5 stars.', timestamp: daysAgoISO(24, 17, 0) },
      { role: 'client', content: '5 stars! Dr. Elena Vasquez was amazing.', timestamp: daysAgoISO(24, 17, 15) },
      { role: 'ai', content: 'Wonderful! We will let Dr. Elena Vasquez know. Ready to rebook in 3 months?', timestamp: daysAgoISO(24, 17, 15) },
      { role: 'client', content: 'Yes same time same place', timestamp: daysAgoISO(24, 17, 20) },
    ],
    locationId: 'soho', agentType: 'Response Monitor', timestamp: daysAgoISO(24, 17, 0),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 450,
  },
  {
    id: 'conv-047', clientName: 'Robert Davis', clientPhone: '(718) 555-0247',
    channel: 'voice', status: 'escalated', priority: 'urgent',
    summary: 'Billing dispute — client charged twice for Filler. Sent to billing.',
    transcript: [
      { role: 'client', content: 'I was charged twice on my credit card for my filler appointment!', timestamp: daysAgoISO(25, 10, 0) },
      { role: 'ai', content: 'I sincerely apologize. Let me connect you with billing right away to resolve this.', timestamp: daysAgoISO(25, 10, 0) },
      { role: 'staff', content: 'Robert, I see the duplicate charge. Refund initiated — allow 3-5 days.', timestamp: daysAgoISO(25, 10, 10) },
    ],
    locationId: 'williamsburg', agentType: 'Escalation Tracker', timestamp: daysAgoISO(25, 10, 0),
    duration: 420, sentiment: 'negative', resolved: true, afterHours: false,
  },
  {
    id: 'conv-048', clientName: 'Susan White', clientPhone: '(201) 555-0348',
    channel: 'web', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Answered detailed skincare questions; booked Chemical Peel at Hoboken.',
    transcript: [
      { role: 'client', content: 'I have sensitive skin. Is a chemical peel safe for me?', timestamp: daysAgoISO(26, 15, 0) },
      { role: 'ai', content: 'We customize peel strength for each client. A gentle lactic acid peel is perfect for sensitive skin. Would you like a consultation at Hoboken?', timestamp: daysAgoISO(26, 15, 0) },
      { role: 'client', content: 'Yes that sounds great', timestamp: daysAgoISO(26, 15, 5) },
      { role: 'ai', content: 'Booked a consultation + Chemical Peel at Hoboken, Wednesday at 10 AM.', timestamp: daysAgoISO(26, 15, 5) },
    ],
    locationId: 'hoboken', agentType: 'Response Monitor', timestamp: daysAgoISO(26, 15, 0),
    sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 200,
  },
  {
    id: 'conv-049', clientName: 'Karen Taylor', clientPhone: '(914) 555-0449',
    channel: 'sms', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'After-hours text — booked Laser Hair Removal at White Plains.',
    transcript: [
      { role: 'client', content: 'Is it too late to book for tomorrow?', timestamp: daysAgoISO(27, 23, 30) },
      { role: 'ai', content: 'Not at all! I have 3 PM open for Laser Hair Removal at White Plains. Want it?', timestamp: daysAgoISO(27, 23, 30) },
      { role: 'client', content: 'Yes', timestamp: daysAgoISO(27, 23, 32) },
      { role: 'ai', content: 'Tomorrow at 3 PM at White Plains. See you!', timestamp: daysAgoISO(27, 23, 32) },
    ],
    locationId: 'white-plains', agentType: 'Response Monitor', timestamp: daysAgoISO(27, 23, 30),
    sentiment: 'positive', resolved: true, afterHours: true, revenueImpact: 350,
  },
  {
    id: 'conv-050', clientName: 'Christine Hall', clientPhone: '(203) 555-0550',
    channel: 'voice', status: 'ai_resolved', priority: 'ai_handling',
    summary: 'Booked first-time Botox consult at Stamford — new client acquisition.',
    transcript: [
      { role: 'ai', content: 'Etienne Intelligence, how can I help?', timestamp: daysAgoISO(28, 13, 0) },
      { role: 'client', content: 'I have never had Botox before. Can I get a consultation first?', timestamp: daysAgoISO(28, 13, 0) },
      { role: 'ai', content: 'Absolutely! We offer a complimentary 15-minute consult. Stamford has openings all week. Prefer morning or afternoon?', timestamp: daysAgoISO(28, 13, 1) },
      { role: 'client', content: 'Morning please, any day.', timestamp: daysAgoISO(28, 13, 2) },
      { role: 'ai', content: 'Monday at 9 AM at Stamford. Look forward to meeting you!', timestamp: daysAgoISO(28, 13, 2) },
    ],
    locationId: 'stamford', agentType: 'Conversation Analyst', timestamp: daysAgoISO(28, 13, 0),
    duration: 95, sentiment: 'positive', resolved: true, afterHours: false, revenueImpact: 450,
  },
]


// ---------------------------------------------------------------------------
// 5. Appointments (100 records)
//    saleType: 'service' = individual visit, 'package' = part of multi-session package
//    normalizedRevenue: for packages, revenue spread across all sessions
//    packageId + packageSession: track multi-session packages
// ---------------------------------------------------------------------------

// Package definitions: some Body Contouring and Laser clients purchased packages
const PACKAGES: Record<string, { totalRevenue: number; sessions: number }> = {
  'pkg-001': { totalRevenue: 3600, sessions: 6 },  // Body Contouring 6-session
  'pkg-002': { totalRevenue: 1800, sessions: 6 },  // Laser Hair Removal 6-session
  'pkg-003': { totalRevenue: 1050, sessions: 3 },  // Hydrafacial 3-pack
  'pkg-004': { totalRevenue: 3600, sessions: 6 },  // Body Contouring 6-session
  'pkg-005': { totalRevenue: 1800, sessions: 6 },  // Laser Hair Removal 6-session
}

// Map certain appointments to packages for realistic demo data
const PKG_MAP: Record<string, { pkgId: string; session: string }> = {
  'apt-003': { pkgId: 'pkg-001', session: '1 of 6' },  // Sofia — Body Contouring
  'apt-007': { pkgId: 'pkg-001', session: '2 of 6' },  // Vanessa — Body Contouring
  'apt-020': { pkgId: 'pkg-001', session: '3 of 6' },  // Jessica — Body Contouring
  'apt-012': { pkgId: 'pkg-002', session: '1 of 6' },  // Maria — Laser
  'apt-023': { pkgId: 'pkg-004', session: '1 of 6' },  // Kayla — Body Contouring
  'apt-027': { pkgId: 'pkg-005', session: '1 of 6' },  // Angela — Laser
  'apt-028': { pkgId: 'pkg-005', session: '2 of 6' },  // Laura — Laser
  'apt-034': { pkgId: 'pkg-005', session: '3 of 6' },  // Tiffany — Laser
  'apt-040': { pkgId: 'pkg-004', session: '2 of 6' },  // Sarah — Body Contouring
  'apt-048': { pkgId: 'pkg-004', session: '3 of 6' },  // Gregory — Body Contouring
  'apt-068': { pkgId: 'pkg-003', session: '1 of 3' },  // David — Hydrafacial
  'apt-072': { pkgId: 'pkg-003', session: '2 of 3' },  // Martha — Hydrafacial
  'apt-083': { pkgId: 'pkg-001', session: '4 of 6' },  // Ryan — Body Contouring
}

type RawAppointment = Omit<Appointment, 'normalizedRevenue' | 'saleType' | 'packageId' | 'packageSession'>

function enrichAppointments(raw: RawAppointment[]): Appointment[] {
  return raw.map((apt) => {
    const pkg = PKG_MAP[apt.id]
    if (pkg) {
      const pkgDef = PACKAGES[pkg.pkgId]
      return {
        ...apt,
        saleType: 'package' as const,
        packageId: pkg.pkgId,
        packageSession: pkg.session,
        // Package revenue: full amount booked on first session, $0 on rest (Zenoti behavior)
        revenue: pkg.session.startsWith('1 ') ? pkgDef.totalRevenue : 0,
        normalizedRevenue: Math.round(pkgDef.totalRevenue / pkgDef.sessions),
      }
    }
    return {
      ...apt,
      saleType: 'service' as const,
      normalizedRevenue: apt.revenue,
    }
  })
}

const rawAppointments: RawAppointment[] = [
  // SoHo appointments (rooms 1-6, 3 providers)
  { id: 'apt-001', clientName: 'Maria Santos', clientId: 'cli-001', service: 'Botox', provider: 'Dr. Elena Vasquez', locationId: 'soho', date: daysAgo(0), startTime: '09:00', endTime: '09:30', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-002', clientName: 'Danielle Parker', clientId: 'cli-002', service: 'Dermal Filler', provider: 'Dr. Elena Vasquez', locationId: 'soho', date: daysAgo(0), startTime: '10:00', endTime: '10:45', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 850 },
  { id: 'apt-003', clientName: 'Sofia Ramirez', clientId: 'cli-003', service: 'Body Contouring', provider: 'Sarah Kim', locationId: 'soho', date: daysAgo(0), startTime: '11:00', endTime: '12:30', status: 'confirmed', bookedBy: 'online', noShowRisk: 'medium', room: 3, revenue: 1200 },
  { id: 'apt-004', clientName: 'Janet Cooper', clientId: 'cli-004', service: 'Botox', provider: 'Olivia Chen', locationId: 'soho', date: daysAgo(0), startTime: '14:00', endTime: '14:30', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-005', clientName: 'Michelle Gonzalez', clientId: 'cli-005', service: 'Hydrafacial', provider: 'Sarah Kim', locationId: 'soho', date: daysAgo(0), startTime: '15:00', endTime: '16:00', status: 'confirmed', bookedBy: 'staff', noShowRisk: 'low', room: 4, revenue: 250 },
  { id: 'apt-006', clientName: 'Brittany Scott', clientId: 'cli-006', service: 'Botox', provider: 'Dr. Elena Vasquez', locationId: 'soho', date: daysAgo(1), startTime: '10:00', endTime: '10:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-007', clientName: 'Vanessa Cruz', clientId: 'cli-007', service: 'Body Contouring', provider: 'Sarah Kim', locationId: 'soho', date: daysAgo(1), startTime: '10:00', endTime: '11:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 3, revenue: 1200 },
  { id: 'apt-008', clientName: 'Diana Torres', clientId: 'cli-008', service: 'Hydrafacial', provider: 'Olivia Chen', locationId: 'soho', date: daysAgo(2), startTime: '09:00', endTime: '10:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 5, revenue: 250 },
  { id: 'apt-009', clientName: 'Olivia Martinez', clientId: 'cli-009', service: 'Botox', provider: 'Dr. Elena Vasquez', locationId: 'soho', date: daysAgo(2), startTime: '11:00', endTime: '11:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-010', clientName: 'Jessica Morgan', clientId: 'cli-010', service: 'Hydrafacial', provider: 'Sarah Kim', locationId: 'soho', date: daysAgo(3), startTime: '13:00', endTime: '14:00', status: 'no_show', bookedBy: 'online', noShowRisk: 'high', room: 4, revenue: 250 },
  { id: 'apt-011', clientName: 'Danielle Parker', clientId: 'cli-002', service: 'Chemical Peel', provider: 'Olivia Chen', locationId: 'soho', date: daysAgo(4), startTime: '09:00', endTime: '09:30', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 2, revenue: 200 },
  { id: 'apt-012', clientName: 'Maria Santos', clientId: 'cli-001', service: 'Laser Hair Removal', provider: 'Sarah Kim', locationId: 'soho', date: daysAgo(5), startTime: '14:00', endTime: '14:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 6, revenue: 350 },
  { id: 'apt-013', clientName: 'Sofia Ramirez', clientId: 'cli-003', service: 'Botox', provider: 'Dr. Elena Vasquez', locationId: 'soho', date: daysAgo(7), startTime: '10:00', endTime: '10:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-014', clientName: 'Janet Cooper', clientId: 'cli-004', service: 'Dermal Filler', provider: 'Dr. Elena Vasquez', locationId: 'soho', date: daysAgo(8), startTime: '11:00', endTime: '11:45', status: 'cancelled', bookedBy: 'online', noShowRisk: 'medium', room: 2, revenue: 850 },
  { id: 'apt-015', clientName: 'Michelle Gonzalez', clientId: 'cli-005', service: 'Botox', provider: 'Olivia Chen', locationId: 'soho', date: daysAgo(10), startTime: '15:00', endTime: '15:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-016', clientName: 'Brittany Scott', clientId: 'cli-006', service: 'Chemical Peel', provider: 'Sarah Kim', locationId: 'soho', date: daysAgo(12), startTime: '09:00', endTime: '09:30', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 4, revenue: 200 },
  { id: 'apt-017', clientName: 'Vanessa Cruz', clientId: 'cli-007', service: 'Hydrafacial', provider: 'Olivia Chen', locationId: 'soho', date: daysAgo(14), startTime: '13:00', endTime: '14:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 5, revenue: 250 },
  { id: 'apt-018', clientName: 'Diana Torres', clientId: 'cli-008', service: 'Botox', provider: 'Dr. Elena Vasquez', locationId: 'soho', date: daysAgo(15), startTime: '10:00', endTime: '10:30', status: 'no_show', bookedBy: 'online', noShowRisk: 'high', room: 1, revenue: 450 },
  { id: 'apt-019', clientName: 'Olivia Martinez', clientId: 'cli-009', service: 'Dermal Filler', provider: 'Dr. Elena Vasquez', locationId: 'soho', date: daysAgo(18), startTime: '14:00', endTime: '14:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 850 },
  { id: 'apt-020', clientName: 'Jessica Morgan', clientId: 'cli-010', service: 'Body Contouring', provider: 'Sarah Kim', locationId: 'soho', date: daysAgo(20), startTime: '09:00', endTime: '10:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 3, revenue: 1200 },

  // Williamsburg appointments (rooms 1-4, 2 providers)
  { id: 'apt-021', clientName: 'Emma Johnson', clientId: 'cli-011', service: 'Hydrafacial', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(0), startTime: '09:30', endTime: '10:30', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 250 },
  { id: 'apt-022', clientName: 'Michael Brown', clientId: 'cli-012', service: 'Botox', provider: 'Jessica Taylor', locationId: 'williamsburg', date: daysAgo(0), startTime: '11:00', endTime: '11:30', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'medium', room: 2, revenue: 450 },
  { id: 'apt-023', clientName: 'Kayla Nguyen', clientId: 'cli-013', service: 'Body Contouring', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(0), startTime: '13:00', endTime: '14:30', status: 'confirmed', bookedBy: 'online', noShowRisk: 'low', room: 3, revenue: 1200 },
  { id: 'apt-024', clientName: 'Tiffany Ross', clientId: 'cli-014', service: 'Hydrafacial', provider: 'Jessica Taylor', locationId: 'williamsburg', date: daysAgo(1), startTime: '10:00', endTime: '11:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 250 },
  { id: 'apt-025', clientName: 'Chris Evans', clientId: 'cli-015', service: 'Botox', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(1), startTime: '14:00', endTime: '14:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 450 },
  { id: 'apt-026', clientName: 'James Richardson', clientId: 'cli-016', service: 'Dermal Filler', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(2), startTime: '09:00', endTime: '09:45', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 2, revenue: 850 },
  { id: 'apt-027', clientName: 'Angela Wright', clientId: 'cli-017', service: 'Laser Hair Removal', provider: 'Jessica Taylor', locationId: 'williamsburg', date: daysAgo(3), startTime: '11:00', endTime: '11:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 3, revenue: 350 },
  { id: 'apt-028', clientName: 'Laura Bennett', clientId: 'cli-018', service: 'Laser Hair Removal', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(4), startTime: '13:00', endTime: '13:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 4, revenue: 350 },
  { id: 'apt-029', clientName: 'Jennifer Lopez', clientId: 'cli-019', service: 'Botox', provider: 'Jessica Taylor', locationId: 'williamsburg', date: daysAgo(5), startTime: '10:00', endTime: '10:30', status: 'no_show', bookedBy: 'online', noShowRisk: 'high', room: 1, revenue: 450 },
  { id: 'apt-030', clientName: 'Robert Davis', clientId: 'cli-020', service: 'Dermal Filler', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(6), startTime: '15:00', endTime: '15:45', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 2, revenue: 850 },
  { id: 'apt-031', clientName: 'Emma Johnson', clientId: 'cli-011', service: 'Chemical Peel', provider: 'Jessica Taylor', locationId: 'williamsburg', date: daysAgo(8), startTime: '09:00', endTime: '09:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 200 },
  { id: 'apt-032', clientName: 'Kayla Nguyen', clientId: 'cli-013', service: 'Hydrafacial', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(10), startTime: '14:00', endTime: '15:00', status: 'cancelled', bookedBy: 'online', noShowRisk: 'medium', room: 3, revenue: 250 },
  { id: 'apt-033', clientName: 'Chris Evans', clientId: 'cli-015', service: 'Botox', provider: 'Jessica Taylor', locationId: 'williamsburg', date: daysAgo(12), startTime: '11:00', endTime: '11:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 450 },
  { id: 'apt-034', clientName: 'Tiffany Ross', clientId: 'cli-014', service: 'Laser Hair Removal', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(14), startTime: '10:00', endTime: '10:45', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 4, revenue: 350 },
  { id: 'apt-035', clientName: 'Angela Wright', clientId: 'cli-017', service: 'Botox', provider: 'Jessica Taylor', locationId: 'williamsburg', date: daysAgo(16), startTime: '13:00', endTime: '13:30', status: 'no_show', bookedBy: 'online', noShowRisk: 'high', room: 1, revenue: 450 },
  { id: 'apt-036', clientName: 'Laura Bennett', clientId: 'cli-018', service: 'Hydrafacial', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(20), startTime: '09:00', endTime: '10:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 250 },
  { id: 'apt-037', clientName: 'Michael Brown', clientId: 'cli-012', service: 'Chemical Peel', provider: 'Jessica Taylor', locationId: 'williamsburg', date: daysAgo(22), startTime: '15:00', endTime: '15:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 200 },
  { id: 'apt-038', clientName: 'Jennifer Lopez', clientId: 'cli-019', service: 'Dermal Filler', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(25), startTime: '10:00', endTime: '10:45', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 3, revenue: 850 },

  // Hoboken appointments (rooms 1-4, 3 providers)
  { id: 'apt-039', clientName: 'Priya Patel', clientId: 'cli-021', service: 'Hydrafacial', provider: 'Dr. Amir Patel', locationId: 'hoboken', date: daysAgo(0), startTime: '11:00', endTime: '12:00', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 250 },
  { id: 'apt-040', clientName: 'Sarah Chen', clientId: 'cli-022', service: 'Body Contouring', provider: 'Megan Russo', locationId: 'hoboken', date: daysAgo(0), startTime: '10:00', endTime: '11:30', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 1200 },
  { id: 'apt-041', clientName: 'Lauren White', clientId: 'cli-023', service: 'Chemical Peel', provider: 'Daniela Moreno', locationId: 'hoboken', date: daysAgo(0), startTime: '15:00', endTime: '15:30', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'medium', room: 3, revenue: 200 },
  { id: 'apt-042', clientName: 'Megan Foster', clientId: 'cli-024', service: 'Laser Hair Removal', provider: 'Dr. Amir Patel', locationId: 'hoboken', date: daysAgo(1), startTime: '09:00', endTime: '09:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 4, revenue: 350 },
  { id: 'apt-043', clientName: 'Jasmine Washington', clientId: 'cli-025', service: 'Botox', provider: 'Megan Russo', locationId: 'hoboken', date: daysAgo(1), startTime: '14:00', endTime: '14:30', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-044', clientName: 'Lisa Chang', clientId: 'cli-026', service: 'Laser Hair Removal', provider: 'Daniela Moreno', locationId: 'hoboken', date: daysAgo(2), startTime: '14:00', endTime: '14:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 350 },
  { id: 'apt-045', clientName: 'Catherine Bell', clientId: 'cli-027', service: 'Hydrafacial', provider: 'Dr. Amir Patel', locationId: 'hoboken', date: daysAgo(3), startTime: '11:00', endTime: '12:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 250 },
  { id: 'apt-046', clientName: 'Kevin Murphy', clientId: 'cli-028', service: 'Chemical Peel', provider: 'Megan Russo', locationId: 'hoboken', date: daysAgo(4), startTime: '09:00', endTime: '09:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 3, revenue: 200 },
  { id: 'apt-047', clientName: 'Susan White', clientId: 'cli-029', service: 'Chemical Peel', provider: 'Daniela Moreno', locationId: 'hoboken', date: daysAgo(5), startTime: '10:00', endTime: '10:30', status: 'no_show', bookedBy: 'online', noShowRisk: 'high', room: 3, revenue: 200 },
  { id: 'apt-048', clientName: 'Gregory Hall', clientId: 'cli-030', service: 'Body Contouring', provider: 'Dr. Amir Patel', locationId: 'hoboken', date: daysAgo(6), startTime: '13:00', endTime: '14:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 1200 },
  { id: 'apt-049', clientName: 'Priya Patel', clientId: 'cli-021', service: 'Botox', provider: 'Megan Russo', locationId: 'hoboken', date: daysAgo(8), startTime: '11:00', endTime: '11:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-050', clientName: 'Sarah Chen', clientId: 'cli-022', service: 'Dermal Filler', provider: 'Dr. Amir Patel', locationId: 'hoboken', date: daysAgo(10), startTime: '14:00', endTime: '14:45', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 2, revenue: 850 },
  { id: 'apt-051', clientName: 'Lauren White', clientId: 'cli-023', service: 'Hydrafacial', provider: 'Daniela Moreno', locationId: 'hoboken', date: daysAgo(12), startTime: '09:00', endTime: '10:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 250 },
  { id: 'apt-052', clientName: 'Megan Foster', clientId: 'cli-024', service: 'Botox', provider: 'Megan Russo', locationId: 'hoboken', date: daysAgo(14), startTime: '15:00', endTime: '15:30', status: 'cancelled', bookedBy: 'online', noShowRisk: 'medium', room: 4, revenue: 450 },
  { id: 'apt-053', clientName: 'Jasmine Washington', clientId: 'cli-025', service: 'Chemical Peel', provider: 'Dr. Amir Patel', locationId: 'hoboken', date: daysAgo(16), startTime: '10:00', endTime: '10:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 3, revenue: 200 },
  { id: 'apt-054', clientName: 'Lisa Chang', clientId: 'cli-026', service: 'Laser Hair Removal', provider: 'Daniela Moreno', locationId: 'hoboken', date: daysAgo(18), startTime: '13:00', endTime: '13:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 350 },
  { id: 'apt-055', clientName: 'Catherine Bell', clientId: 'cli-027', service: 'Dermal Filler', provider: 'Megan Russo', locationId: 'hoboken', date: daysAgo(20), startTime: '11:00', endTime: '11:45', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 1, revenue: 850 },
  { id: 'apt-056', clientName: 'Kevin Murphy', clientId: 'cli-028', service: 'Botox', provider: 'Dr. Amir Patel', locationId: 'hoboken', date: daysAgo(22), startTime: '09:00', endTime: '09:30', status: 'no_show', bookedBy: 'online', noShowRisk: 'high', room: 4, revenue: 450 },
  { id: 'apt-057', clientName: 'Susan White', clientId: 'cli-029', service: 'Hydrafacial', provider: 'Daniela Moreno', locationId: 'hoboken', date: daysAgo(25), startTime: '14:00', endTime: '15:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 250 },
  { id: 'apt-058', clientName: 'Gregory Hall', clientId: 'cli-030', service: 'Laser Hair Removal', provider: 'Megan Russo', locationId: 'hoboken', date: daysAgo(28), startTime: '10:00', endTime: '10:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 350 },

  // White Plains appointments (rooms 1-3, 2 providers)
  { id: 'apt-059', clientName: 'David Kim', clientId: 'cli-031', service: 'Chemical Peel', provider: 'Dr. Christine Lee', locationId: 'white-plains', date: daysAgo(0), startTime: '15:00', endTime: '15:30', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 200 },
  { id: 'apt-060', clientName: 'Amy Stewart', clientId: 'cli-032', service: 'Hydrafacial', provider: 'Rachel Nguyen', locationId: 'white-plains', date: daysAgo(0), startTime: '10:00', endTime: '11:00', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 250 },
  { id: 'apt-061', clientName: 'Nicole Reed', clientId: 'cli-033', service: 'Botox', provider: 'Dr. Christine Lee', locationId: 'white-plains', date: daysAgo(0), startTime: '11:00', endTime: '11:30', status: 'waitlist', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-062', clientName: 'Rachel Green', clientId: 'cli-034', service: 'Dermal Filler', provider: 'Rachel Nguyen', locationId: 'white-plains', date: daysAgo(1), startTime: '09:00', endTime: '09:45', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 2, revenue: 850 },
  { id: 'apt-063', clientName: 'Martha Young', clientId: 'cli-035', service: 'Botox', provider: 'Dr. Christine Lee', locationId: 'white-plains', date: daysAgo(1), startTime: '14:00', endTime: '14:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-064', clientName: 'Hannah Lee', clientId: 'cli-036', service: 'Laser Hair Removal', provider: 'Rachel Nguyen', locationId: 'white-plains', date: daysAgo(2), startTime: '13:00', endTime: '13:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 3, revenue: 350 },
  { id: 'apt-065', clientName: 'Samantha Phillips', clientId: 'cli-037', service: 'Botox', provider: 'Dr. Christine Lee', locationId: 'white-plains', date: daysAgo(3), startTime: '10:00', endTime: '10:30', status: 'no_show', bookedBy: 'online', noShowRisk: 'high', room: 1, revenue: 450 },
  { id: 'apt-066', clientName: 'Patricia Collins', clientId: 'cli-038', service: 'Dermal Filler', provider: 'Rachel Nguyen', locationId: 'white-plains', date: daysAgo(4), startTime: '10:00', endTime: '10:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 850 },
  { id: 'apt-067', clientName: 'Karen Taylor', clientId: 'cli-039', service: 'Laser Hair Removal', provider: 'Dr. Christine Lee', locationId: 'white-plains', date: daysAgo(5), startTime: '15:00', endTime: '15:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 3, revenue: 350 },
  { id: 'apt-068', clientName: 'David Kim', clientId: 'cli-031', service: 'Hydrafacial', provider: 'Rachel Nguyen', locationId: 'white-plains', date: daysAgo(7), startTime: '09:00', endTime: '10:00', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 1, revenue: 250 },
  { id: 'apt-069', clientName: 'Amy Stewart', clientId: 'cli-032', service: 'Botox', provider: 'Dr. Christine Lee', locationId: 'white-plains', date: daysAgo(9), startTime: '11:00', endTime: '11:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 450 },
  { id: 'apt-070', clientName: 'Nicole Reed', clientId: 'cli-033', service: 'Chemical Peel', provider: 'Rachel Nguyen', locationId: 'white-plains', date: daysAgo(11), startTime: '14:00', endTime: '14:30', status: 'cancelled', bookedBy: 'online', noShowRisk: 'medium', room: 3, revenue: 200 },
  { id: 'apt-071', clientName: 'Rachel Green', clientId: 'cli-034', service: 'Botox', provider: 'Dr. Christine Lee', locationId: 'white-plains', date: daysAgo(14), startTime: '10:00', endTime: '10:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-072', clientName: 'Martha Young', clientId: 'cli-035', service: 'Hydrafacial', provider: 'Rachel Nguyen', locationId: 'white-plains', date: daysAgo(17), startTime: '13:00', endTime: '14:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 250 },
  { id: 'apt-073', clientName: 'Hannah Lee', clientId: 'cli-036', service: 'Dermal Filler', provider: 'Dr. Christine Lee', locationId: 'white-plains', date: daysAgo(20), startTime: '09:00', endTime: '09:45', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 1, revenue: 850 },
  { id: 'apt-074', clientName: 'Samantha Phillips', clientId: 'cli-037', service: 'Laser Hair Removal', provider: 'Rachel Nguyen', locationId: 'white-plains', date: daysAgo(22), startTime: '15:00', endTime: '15:45', status: 'no_show', bookedBy: 'online', noShowRisk: 'high', room: 3, revenue: 350 },
  { id: 'apt-075', clientName: 'Patricia Collins', clientId: 'cli-038', service: 'Botox', provider: 'Dr. Christine Lee', locationId: 'white-plains', date: daysAgo(25), startTime: '10:00', endTime: '10:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-076', clientName: 'Karen Taylor', clientId: 'cli-039', service: 'Chemical Peel', provider: 'Rachel Nguyen', locationId: 'white-plains', date: daysAgo(28), startTime: '11:00', endTime: '11:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 200 },

  // Stamford appointments (rooms 1-3, 2 providers)
  { id: 'apt-077', clientName: 'Nina Patel', clientId: 'cli-040', service: 'Laser Hair Removal', provider: 'Dr. James Whitfield', locationId: 'stamford', date: daysAgo(0), startTime: '14:00', endTime: '14:45', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 350 },
  { id: 'apt-078', clientName: 'Amanda Brooks', clientId: 'cli-041', service: 'Dermal Filler', provider: 'Amy Berkowitz', locationId: 'stamford', date: daysAgo(0), startTime: '13:00', endTime: '13:45', status: 'confirmed', bookedBy: 'ai', noShowRisk: 'medium', room: 2, revenue: 850 },
  { id: 'apt-079', clientName: 'Sandra Miller', clientId: 'cli-042', service: 'Botox', provider: 'Dr. James Whitfield', locationId: 'stamford', date: daysAgo(1), startTime: '15:00', endTime: '15:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 450 },
  { id: 'apt-080', clientName: 'Zoe Adams', clientId: 'cli-043', service: 'Chemical Peel', provider: 'Amy Berkowitz', locationId: 'stamford', date: daysAgo(1), startTime: '09:00', endTime: '09:30', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 3, revenue: 200 },
  { id: 'apt-081', clientName: 'Rebecca Hill', clientId: 'cli-044', service: 'Chemical Peel', provider: 'Dr. James Whitfield', locationId: 'stamford', date: daysAgo(2), startTime: '10:00', endTime: '10:30', status: 'no_show', bookedBy: 'online', noShowRisk: 'high', room: 1, revenue: 200 },
  { id: 'apt-082', clientName: 'Heather Morgan', clientId: 'cli-045', service: 'Hydrafacial', provider: 'Amy Berkowitz', locationId: 'stamford', date: daysAgo(3), startTime: '14:00', endTime: '15:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 250 },
  { id: 'apt-083', clientName: 'Ryan Cooper', clientId: 'cli-046', service: 'Body Contouring', provider: 'Dr. James Whitfield', locationId: 'stamford', date: daysAgo(4), startTime: '09:00', endTime: '10:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 3, revenue: 1200 },
  { id: 'apt-084', clientName: 'Emily Turner', clientId: 'cli-047', service: 'Chemical Peel', provider: 'Amy Berkowitz', locationId: 'stamford', date: daysAgo(5), startTime: '14:00', endTime: '14:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 200 },
  { id: 'apt-085', clientName: 'Christine Hall', clientId: 'cli-048', service: 'Botox', provider: 'Dr. James Whitfield', locationId: 'stamford', date: daysAgo(6), startTime: '09:00', endTime: '09:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 450 },
  { id: 'apt-086', clientName: 'Ashley Wong', clientId: 'cli-049', service: 'Hydrafacial', provider: 'Amy Berkowitz', locationId: 'stamford', date: daysAgo(7), startTime: '11:00', endTime: '12:00', status: 'cancelled', bookedBy: 'online', noShowRisk: 'medium', room: 1, revenue: 250 },
  { id: 'apt-087', clientName: 'Nina Patel', clientId: 'cli-040', service: 'Botox', provider: 'Dr. James Whitfield', locationId: 'stamford', date: daysAgo(9), startTime: '10:00', endTime: '10:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 450 },
  { id: 'apt-088', clientName: 'Amanda Brooks', clientId: 'cli-041', service: 'Laser Hair Removal', provider: 'Amy Berkowitz', locationId: 'stamford', date: daysAgo(11), startTime: '14:00', endTime: '14:45', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 3, revenue: 350 },
  { id: 'apt-089', clientName: 'Sandra Miller', clientId: 'cli-042', service: 'Hydrafacial', provider: 'Dr. James Whitfield', locationId: 'stamford', date: daysAgo(13), startTime: '09:00', endTime: '10:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 250 },
  { id: 'apt-090', clientName: 'Zoe Adams', clientId: 'cli-043', service: 'Dermal Filler', provider: 'Amy Berkowitz', locationId: 'stamford', date: daysAgo(15), startTime: '13:00', endTime: '13:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 850 },
  { id: 'apt-091', clientName: 'Rebecca Hill', clientId: 'cli-044', service: 'Botox', provider: 'Dr. James Whitfield', locationId: 'stamford', date: daysAgo(17), startTime: '10:00', endTime: '10:30', status: 'no_show', bookedBy: 'online', noShowRisk: 'high', room: 1, revenue: 450 },
  { id: 'apt-092', clientName: 'Heather Morgan', clientId: 'cli-045', service: 'Chemical Peel', provider: 'Amy Berkowitz', locationId: 'stamford', date: daysAgo(19), startTime: '15:00', endTime: '15:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 3, revenue: 200 },
  { id: 'apt-093', clientName: 'Ryan Cooper', clientId: 'cli-046', service: 'Laser Hair Removal', provider: 'Dr. James Whitfield', locationId: 'stamford', date: daysAgo(21), startTime: '11:00', endTime: '11:45', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 1, revenue: 350 },
  { id: 'apt-094', clientName: 'Emily Turner', clientId: 'cli-047', service: 'Botox', provider: 'Amy Berkowitz', locationId: 'stamford', date: daysAgo(23), startTime: '14:00', endTime: '14:30', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 450 },
  { id: 'apt-095', clientName: 'Christine Hall', clientId: 'cli-048', service: 'Hydrafacial', provider: 'Dr. James Whitfield', locationId: 'stamford', date: daysAgo(25), startTime: '09:00', endTime: '10:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 3, revenue: 250 },
  { id: 'apt-096', clientName: 'Ashley Wong', clientId: 'cli-049', service: 'Dermal Filler', provider: 'Amy Berkowitz', locationId: 'stamford', date: daysAgo(27), startTime: '13:00', endTime: '13:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 850 },

  // A few extra cross-location appointments to reach 100
  { id: 'apt-097', clientName: 'Tom Garcia', clientId: 'cli-050', service: 'Botox', provider: 'Dr. Elena Vasquez', locationId: 'soho', date: daysAgo(24), startTime: '16:00', endTime: '16:30', status: 'completed', bookedBy: 'online', noShowRisk: 'low', room: 6, revenue: 450 },
  { id: 'apt-098', clientName: 'Tom Garcia', clientId: 'cli-050', service: 'Hydrafacial', provider: 'Dr. Marcus Rolle', locationId: 'williamsburg', date: daysAgo(28), startTime: '11:00', endTime: '12:00', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 1, revenue: 250 },
  { id: 'apt-099', clientName: 'Maria Santos', clientId: 'cli-001', service: 'Dermal Filler', provider: 'Dr. Elena Vasquez', locationId: 'soho', date: daysAgo(26), startTime: '14:00', endTime: '14:45', status: 'completed', bookedBy: 'ai', noShowRisk: 'low', room: 2, revenue: 850 },
  { id: 'apt-100', clientName: 'Priya Patel', clientId: 'cli-021', service: 'Chemical Peel', provider: 'Megan Russo', locationId: 'hoboken', date: daysAgo(28), startTime: '15:00', endTime: '15:30', status: 'completed', bookedBy: 'staff', noShowRisk: 'low', room: 3, revenue: 200 },
]

export const appointments: Appointment[] = enrichAppointments(rawAppointments)


// ---------------------------------------------------------------------------
// 6. Daily Metrics  (90 days x 5 locations = 450 records)
//    Phase 1 (days 89-60 ago): Before EIP
//    Phase 2 (days 59-30 ago): Ramp-up
//    Phase 3 (days 29-0 ago): Full operation
// ---------------------------------------------------------------------------
function buildDailyMetrics(): DailyMetrics[] {
  const metrics: DailyMetrics[] = []

  // Deterministic pseudo-random based on seed — NOT Math.random
  function seededValue(day: number, locIdx: number, field: number): number {
    // Simple hash-like function to produce repeatable variation
    const hash = ((day * 7 + locIdx * 13 + field * 31) % 100) / 100
    return hash
  }

  const locIds = ['soho', 'williamsburg', 'hoboken', 'white-plains', 'stamford']

  // Revenue base ranges per location per phase [min, max]
  const revenueRanges: Record<string, number[][]> = {
    'soho':         [[3000, 3500], [3400, 4000], [3800, 4500]],
    'williamsburg': [[1800, 2100], [2000, 2400], [2300, 2800]],
    'hoboken':      [[2000, 2300], [2200, 2600], [2500, 3000]],
    'white-plains': [[1200, 1500], [1400, 1700], [1600, 2000]],
    'stamford':     [[1200, 1500], [1400, 1700], [1600, 2000]],
  }

  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const phase = dayOffset >= 60 ? 0 : dayOffset >= 30 ? 1 : 2

    for (let li = 0; li < locIds.length; li++) {
      const locId = locIds[li]
      const v = seededValue(dayOffset, li, 0)  // 0..1 variation factor

      // Revenue
      const [rMin, rMax] = revenueRanges[locId][phase]
      const revenue = Math.round(rMin + v * (rMax - rMin))

      // Bookings scale roughly with revenue
      const bookings = Math.round(revenue / 380 + seededValue(dayOffset, li, 1) * 3)

      // No-show rate by phase (percentage scale: 10 = 10%)
      const noShowRateRanges = [[25, 30], [15, 20], [10, 14]]
      const [nsMin, nsMax] = noShowRateRanges[phase]
      const noShowRate = +(nsMin + seededValue(dayOffset, li, 2) * (nsMax - nsMin)).toFixed(1)
      const noShows = Math.max(0, Math.round(bookings * noShowRate / 100))

      // Response time (seconds): Phase 0 = 3.5-5 hrs, Phase 1 = 30-60s, Phase 2 = 10-28s
      const rtRanges = [[12600, 18000], [30, 60], [10, 28]]
      const [rtMin, rtMax] = rtRanges[phase]
      const responseTimeAvg = Math.round(rtMin + seededValue(dayOffset, li, 3) * (rtMax - rtMin))

      // Utilization rate by phase (percentage scale: 65 = 65%)
      const utilRanges = [[45, 55], [55, 65], [65, 78]]
      const [uMin, uMax] = utilRanges[phase]
      const utilizationRate = +(uMin + seededValue(dayOffset, li, 4) * (uMax - uMin)).toFixed(1)

      // New clients
      const newClients = Math.round(1 + seededValue(dayOffset, li, 5) * (phase === 2 ? 5 : phase === 1 ? 3 : 2))

      // Rebooking rate improves by phase (percentage scale: 55 = 55%)
      const rbRanges = [[30, 40], [40, 55], [55, 72]]
      const [rbMin, rbMax] = rbRanges[phase]
      const rebookingRate = +(rbMin + seededValue(dayOffset, li, 6) * (rbMax - rbMin)).toFixed(1)

      // Calls answered / missed
      const totalCalls = Math.round(8 + seededValue(dayOffset, li, 7) * 12)
      const missedRate = phase === 0 ? 0.3 : phase === 1 ? 0.1 : 0.03
      const callsMissed = Math.round(totalCalls * missedRate * (0.5 + seededValue(dayOffset, li, 8)))
      const callsAnswered = totalCalls - callsMissed

      // AI resolved / escalated
      const aiResolved = phase === 0 ? 0 : Math.round((callsAnswered + bookings) * (phase === 1 ? 0.5 : 0.75) * (0.7 + seededValue(dayOffset, li, 9) * 0.6))
      const escalated = phase === 0 ? 0 : Math.round(aiResolved * (phase === 1 ? 0.25 : 0.12) * (0.5 + seededValue(dayOffset, li, 10)))

      // Revenue recovered (from no-show prevention, after-hours saves, etc.)
      const revenueRecovered = phase === 0 ? 0 : Math.round(noShows * 350 * (phase === 1 ? 0.3 : 0.6) * (0.5 + seededValue(dayOffset, li, 11)))

      // Revenue disaggregation — realistic mix of service types
      // ~65% service, ~20% package, ~8% product, ~5% membership, ~2% gift card
      const pkgPct = 0.15 + seededValue(dayOffset, li, 12) * 0.10  // 15-25%
      const prodPct = 0.05 + seededValue(dayOffset, li, 13) * 0.06 // 5-11%
      const memPct = 0.03 + seededValue(dayOffset, li, 14) * 0.04  // 3-7%
      const gcPct = 0.01 + seededValue(dayOffset, li, 15) * 0.02   // 1-3%
      const svcPct = 1 - pkgPct - prodPct - memPct - gcPct

      const serviceRevenue = Math.round(revenue * svcPct)
      const packageRevenue = Math.round(revenue * pkgPct)
      const productRevenue = Math.round(revenue * prodPct)
      const membershipRevenue = Math.round(revenue * memPct)
      const giftcardRevenue = revenue - serviceRevenue - packageRevenue - productRevenue - membershipRevenue

      // Package bookings: ~15-25% of total bookings
      const packageBookings = Math.round(bookings * pkgPct)

      // Normalized revenue: spread package revenue evenly (simulate proper normalization)
      const normalizedRevenue = serviceRevenue + Math.round(packageRevenue * 0.85) + productRevenue + membershipRevenue + giftcardRevenue

      metrics.push({
        date: daysAgo(dayOffset),
        locationId: locId,
        revenue,
        normalizedRevenue,
        revenueByType: {
          service: serviceRevenue,
          package: packageRevenue,
          product: productRevenue,
          membership: membershipRevenue,
          giftcard: giftcardRevenue,
        },
        bookings,
        packageBookings,
        noShows,
        noShowRate,
        responseTimeAvg,
        utilizationRate,
        newClients,
        rebookingRate,
        callsAnswered,
        callsMissed,
        aiResolved,
        escalated,
        revenueRecovered,
      })
    }
  }

  return metrics
}

export const dailyMetrics: DailyMetrics[] = buildDailyMetrics()


// ---------------------------------------------------------------------------
// 7. Clients (50 records)
// ---------------------------------------------------------------------------
export const clients: Client[] = [
  { id: 'cli-001', name: 'Maria Santos', email: 'maria.santos@email.com', phone: '(212) 555-0101', preferredLocation: 'soho', totalVisits: 18, clv: 8100, lastVisit: daysAgo(0), joinDate: daysAgo(540), favoriteService: 'Botox', noShowCount: 0 },
  { id: 'cli-002', name: 'Danielle Parker', email: 'danielle.p@email.com', phone: '(212) 555-0121', preferredLocation: 'soho', totalVisits: 25, clv: 15000, lastVisit: daysAgo(4), joinDate: daysAgo(730), favoriteService: 'Dermal Filler', noShowCount: 0 },
  { id: 'cli-003', name: 'Sofia Ramirez', email: 'sofia.r@email.com', phone: '(212) 555-0141', preferredLocation: 'soho', totalVisits: 12, clv: 9600, lastVisit: daysAgo(0), joinDate: daysAgo(365), favoriteService: 'Body Contouring', noShowCount: 0 },
  { id: 'cli-004', name: 'Janet Cooper', email: 'janet.c@email.com', phone: '(212) 555-0146', preferredLocation: 'soho', totalVisits: 8, clv: 3600, lastVisit: daysAgo(0), joinDate: daysAgo(300), favoriteService: 'Botox', noShowCount: 0 },
  { id: 'cli-005', name: 'Michelle Gonzalez', email: 'michelle.g@email.com', phone: '(212) 555-0136', preferredLocation: 'soho', totalVisits: 6, clv: 2700, lastVisit: daysAgo(0), joinDate: daysAgo(210), favoriteService: 'Botox', noShowCount: 0 },
  { id: 'cli-006', name: 'Brittany Scott', email: 'brittany.s@email.com', phone: '(212) 555-0116', preferredLocation: 'soho', totalVisits: 4, clv: 1300, lastVisit: daysAgo(1), joinDate: daysAgo(120), favoriteService: 'Chemical Peel', noShowCount: 0 },
  { id: 'cli-007', name: 'Vanessa Cruz', email: 'vanessa.c@email.com', phone: '(212) 555-0126', preferredLocation: 'soho', totalVisits: 7, clv: 5450, lastVisit: daysAgo(1), joinDate: daysAgo(280), favoriteService: 'Body Contouring', noShowCount: 0 },
  { id: 'cli-008', name: 'Diana Torres', email: 'diana.t@email.com', phone: '(212) 555-0131', preferredLocation: 'soho', totalVisits: 22, clv: 5500, lastVisit: daysAgo(2), joinDate: daysAgo(660), favoriteService: 'Hydrafacial', noShowCount: 1 },
  { id: 'cli-009', name: 'Olivia Martinez', email: 'olivia.m@email.com', phone: '(212) 555-0106', preferredLocation: 'soho', totalVisits: 10, clv: 6500, lastVisit: daysAgo(2), joinDate: daysAgo(400), favoriteService: 'Dermal Filler', noShowCount: 0 },
  { id: 'cli-010', name: 'Jessica Morgan', email: 'jessica.t@email.com', phone: '(212) 555-0111', preferredLocation: 'soho', totalVisits: 3, clv: 1700, lastVisit: daysAgo(3), joinDate: daysAgo(90), favoriteService: 'Body Contouring', noShowCount: 1 },
  { id: 'cli-011', name: 'Emma Johnson', email: 'emma.j@email.com', phone: '(718) 555-0207', preferredLocation: 'williamsburg', totalVisits: 15, clv: 4500, lastVisit: daysAgo(0), joinDate: daysAgo(450), favoriteService: 'Hydrafacial', noShowCount: 0 },
  { id: 'cli-012', name: 'Michael Brown', email: 'michael.b@email.com', phone: '(718) 555-0212', preferredLocation: 'williamsburg', totalVisits: 5, clv: 2100, lastVisit: daysAgo(0), joinDate: daysAgo(150), favoriteService: 'Botox', noShowCount: 0 },
  { id: 'cli-013', name: 'Kayla Nguyen', email: 'kayla.n@email.com', phone: '(718) 555-0217', preferredLocation: 'williamsburg', totalVisits: 3, clv: 3650, lastVisit: daysAgo(0), joinDate: daysAgo(60), favoriteService: 'Body Contouring', noShowCount: 0 },
  { id: 'cli-014', name: 'Tiffany Ross', email: 'tiffany.r@email.com', phone: '(718) 555-0227', preferredLocation: 'williamsburg', totalVisits: 8, clv: 2800, lastVisit: daysAgo(1), joinDate: daysAgo(300), favoriteService: 'Hydrafacial', noShowCount: 0 },
  { id: 'cli-015', name: 'Chris Evans', email: 'chris.e@email.com', phone: '(718) 555-0222', preferredLocation: 'williamsburg', totalVisits: 9, clv: 4050, lastVisit: daysAgo(1), joinDate: daysAgo(330), favoriteService: 'Botox', noShowCount: 0 },
  { id: 'cli-016', name: 'James Richardson', email: 'james.r@email.com', phone: '(718) 555-0202', preferredLocation: 'williamsburg', totalVisits: 4, clv: 3400, lastVisit: daysAgo(2), joinDate: daysAgo(180), favoriteService: 'Dermal Filler', noShowCount: 0 },
  { id: 'cli-017', name: 'Angela Wright', email: 'angela.w@email.com', phone: '(718) 555-0232', preferredLocation: 'williamsburg', totalVisits: 6, clv: 2100, lastVisit: daysAgo(3), joinDate: daysAgo(240), favoriteService: 'Laser Hair Removal', noShowCount: 1 },
  { id: 'cli-018', name: 'Laura Bennett', email: 'laura.b@email.com', phone: '(718) 555-0242', preferredLocation: 'williamsburg', totalVisits: 7, clv: 2450, lastVisit: daysAgo(4), joinDate: daysAgo(270), favoriteService: 'Laser Hair Removal', noShowCount: 0 },
  { id: 'cli-019', name: 'Jennifer Lopez', email: 'jennifer.l@email.com', phone: '(718) 555-0237', preferredLocation: 'williamsburg', totalVisits: 2, clv: 1300, lastVisit: daysAgo(5), joinDate: daysAgo(90), favoriteService: 'Dermal Filler', noShowCount: 1 },
  { id: 'cli-020', name: 'Robert Davis', email: 'robert.d@email.com', phone: '(718) 555-0247', preferredLocation: 'williamsburg', totalVisits: 3, clv: 2550, lastVisit: daysAgo(6), joinDate: daysAgo(120), favoriteService: 'Dermal Filler', noShowCount: 0 },
  { id: 'cli-021', name: 'Priya Patel', email: 'priya.p@email.com', phone: '(201) 555-0303', preferredLocation: 'hoboken', totalVisits: 14, clv: 5600, lastVisit: daysAgo(0), joinDate: daysAgo(420), favoriteService: 'Hydrafacial', noShowCount: 0 },
  { id: 'cli-022', name: 'Sarah Chen', email: 'sarah.c@email.com', phone: '(201) 555-0308', preferredLocation: 'hoboken', totalVisits: 6, clv: 4100, lastVisit: daysAgo(0), joinDate: daysAgo(200), favoriteService: 'Body Contouring', noShowCount: 0 },
  { id: 'cli-023', name: 'Lauren White', email: 'lauren.w@email.com', phone: '(201) 555-0313', preferredLocation: 'hoboken', totalVisits: 5, clv: 1250, lastVisit: daysAgo(0), joinDate: daysAgo(150), favoriteService: 'Chemical Peel', noShowCount: 0 },
  { id: 'cli-024', name: 'Megan Foster', email: 'megan.f@email.com', phone: '(201) 555-0318', preferredLocation: 'hoboken', totalVisits: 10, clv: 3500, lastVisit: daysAgo(1), joinDate: daysAgo(365), favoriteService: 'Laser Hair Removal', noShowCount: 0 },
  { id: 'cli-025', name: 'Jasmine Washington', email: 'jasmine.w@email.com', phone: '(201) 555-0328', preferredLocation: 'hoboken', totalVisits: 7, clv: 3150, lastVisit: daysAgo(1), joinDate: daysAgo(250), favoriteService: 'Botox', noShowCount: 0 },
  { id: 'cli-026', name: 'Lisa Chang', email: 'lisa.c@email.com', phone: '(201) 555-0323', preferredLocation: 'hoboken', totalVisits: 8, clv: 2800, lastVisit: daysAgo(2), joinDate: daysAgo(300), favoriteService: 'Laser Hair Removal', noShowCount: 0 },
  { id: 'cli-027', name: 'Catherine Bell', email: 'catherine.b@email.com', phone: '(201) 555-0338', preferredLocation: 'hoboken', totalVisits: 11, clv: 4400, lastVisit: daysAgo(3), joinDate: daysAgo(380), favoriteService: 'Hydrafacial', noShowCount: 0 },
  { id: 'cli-028', name: 'Kevin Murphy', email: 'kevin.m@email.com', phone: '(201) 555-0333', preferredLocation: 'hoboken', totalVisits: 4, clv: 850, lastVisit: daysAgo(4), joinDate: daysAgo(120), favoriteService: 'Chemical Peel', noShowCount: 1 },
  { id: 'cli-029', name: 'Susan White', email: 'susan.w@email.com', phone: '(201) 555-0348', preferredLocation: 'hoboken', totalVisits: 3, clv: 650, lastVisit: daysAgo(5), joinDate: daysAgo(90), favoriteService: 'Chemical Peel', noShowCount: 1 },
  { id: 'cli-030', name: 'Gregory Hall', email: 'gregory.h@email.com', phone: '(201) 555-0343', preferredLocation: 'hoboken', totalVisits: 5, clv: 3800, lastVisit: daysAgo(6), joinDate: daysAgo(180), favoriteService: 'Body Contouring', noShowCount: 0 },
  { id: 'cli-031', name: 'David Kim', email: 'david.k@email.com', phone: '(914) 555-0404', preferredLocation: 'white-plains', totalVisits: 9, clv: 2700, lastVisit: daysAgo(0), joinDate: daysAgo(320), favoriteService: 'Chemical Peel', noShowCount: 0 },
  { id: 'cli-032', name: 'Amy Stewart', email: 'amy.s@email.com', phone: '(914) 555-0424', preferredLocation: 'white-plains', totalVisits: 12, clv: 4200, lastVisit: daysAgo(0), joinDate: daysAgo(400), favoriteService: 'Hydrafacial', noShowCount: 0 },
  { id: 'cli-033', name: 'Nicole Reed', email: 'nicole.r@email.com', phone: '(914) 555-0429', preferredLocation: 'white-plains', totalVisits: 7, clv: 3150, lastVisit: daysAgo(0), joinDate: daysAgo(250), favoriteService: 'Botox', noShowCount: 0 },
  { id: 'cli-034', name: 'Rachel Green', email: 'rachel.g@email.com', phone: '(914) 555-0409', preferredLocation: 'white-plains', totalVisits: 5, clv: 2600, lastVisit: daysAgo(1), joinDate: daysAgo(180), favoriteService: 'Dermal Filler', noShowCount: 0 },
  { id: 'cli-035', name: 'Martha Young', email: 'martha.y@email.com', phone: '(914) 555-0444', preferredLocation: 'white-plains', totalVisits: 6, clv: 2100, lastVisit: daysAgo(1), joinDate: daysAgo(210), favoriteService: 'Botox', noShowCount: 0 },
  { id: 'cli-036', name: 'Hannah Lee', email: 'hannah.l@email.com', phone: '(914) 555-0419', preferredLocation: 'white-plains', totalVisits: 4, clv: 2400, lastVisit: daysAgo(2), joinDate: daysAgo(140), favoriteService: 'Dermal Filler', noShowCount: 0 },
  { id: 'cli-037', name: 'Samantha Phillips', email: 'samantha.p@email.com', phone: '(914) 555-0439', preferredLocation: 'white-plains', totalVisits: 2, clv: 800, lastVisit: daysAgo(3), joinDate: daysAgo(60), favoriteService: 'Botox', noShowCount: 2 },
  { id: 'cli-038', name: 'Patricia Collins', email: 'patricia.c@email.com', phone: '(914) 555-0434', preferredLocation: 'white-plains', totalVisits: 8, clv: 5200, lastVisit: daysAgo(4), joinDate: daysAgo(290), favoriteService: 'Dermal Filler', noShowCount: 0 },
  { id: 'cli-039', name: 'Karen Taylor', email: 'karen.t@email.com', phone: '(914) 555-0449', preferredLocation: 'white-plains', totalVisits: 6, clv: 1900, lastVisit: daysAgo(5), joinDate: daysAgo(200), favoriteService: 'Laser Hair Removal', noShowCount: 0 },
  { id: 'cli-040', name: 'Nina Patel', email: 'nina.p@email.com', phone: '(203) 555-0510', preferredLocation: 'stamford', totalVisits: 11, clv: 4400, lastVisit: daysAgo(0), joinDate: daysAgo(360), favoriteService: 'Laser Hair Removal', noShowCount: 0 },
  { id: 'cli-041', name: 'Amanda Brooks', email: 'amanda.b@email.com', phone: '(203) 555-0515', preferredLocation: 'stamford', totalVisits: 7, clv: 4250, lastVisit: daysAgo(0), joinDate: daysAgo(240), favoriteService: 'Dermal Filler', noShowCount: 0 },
  { id: 'cli-042', name: 'Sandra Miller', email: 'sandra.m@email.com', phone: '(203) 555-0530', preferredLocation: 'stamford', totalVisits: 9, clv: 3150, lastVisit: daysAgo(1), joinDate: daysAgo(310), favoriteService: 'Botox', noShowCount: 0 },
  { id: 'cli-043', name: 'Zoe Adams', email: 'zoe.a@email.com', phone: '(203) 555-0520', preferredLocation: 'stamford', totalVisits: 5, clv: 2100, lastVisit: daysAgo(1), joinDate: daysAgo(160), favoriteService: 'Chemical Peel', noShowCount: 0 },
  { id: 'cli-044', name: 'Rebecca Hill', email: 'rebecca.h@email.com', phone: '(203) 555-0525', preferredLocation: 'stamford', totalVisits: 1, clv: 200, lastVisit: daysAgo(2), joinDate: daysAgo(30), favoriteService: 'Chemical Peel', noShowCount: 2 },
  { id: 'cli-045', name: 'Heather Morgan', email: 'heather.m@email.com', phone: '(203) 555-0545', preferredLocation: 'stamford', totalVisits: 6, clv: 1500, lastVisit: daysAgo(3), joinDate: daysAgo(200), favoriteService: 'Hydrafacial', noShowCount: 0 },
  { id: 'cli-046', name: 'Ryan Cooper', email: 'ryan.c@email.com', phone: '(203) 555-0535', preferredLocation: 'stamford', totalVisits: 4, clv: 3100, lastVisit: daysAgo(4), joinDate: daysAgo(130), favoriteService: 'Body Contouring', noShowCount: 0 },
  { id: 'cli-047', name: 'Emily Turner', email: 'emily.t@email.com', phone: '(203) 555-0540', preferredLocation: 'stamford', totalVisits: 5, clv: 1300, lastVisit: daysAgo(5), joinDate: daysAgo(170), favoriteService: 'Chemical Peel', noShowCount: 0 },
  { id: 'cli-048', name: 'Christine Hall', email: 'christine.h@email.com', phone: '(203) 555-0550', preferredLocation: 'stamford', totalVisits: 3, clv: 1150, lastVisit: daysAgo(6), joinDate: daysAgo(90), favoriteService: 'Botox', noShowCount: 0 },
  { id: 'cli-049', name: 'Ashley Wong', email: 'ashley.w@email.com', phone: '(203) 555-0505', preferredLocation: 'stamford', totalVisits: 2, clv: 1100, lastVisit: daysAgo(7), joinDate: daysAgo(50), favoriteService: 'Hydrafacial', noShowCount: 0 },
  { id: 'cli-050', name: 'Tom Garcia', email: 'tom.g@email.com', phone: '(914) 555-0414', preferredLocation: 'white-plains', totalVisits: 2, clv: 700, lastVisit: daysAgo(24), joinDate: daysAgo(60), favoriteService: 'Botox', noShowCount: 0 },
]


// ---------------------------------------------------------------------------
// 8. Alerts (20 records)
// ---------------------------------------------------------------------------
export const alerts: Alert[] = [
  {
    id: 'alert-001', type: 'opportunity',
    title: 'SoHo Botox utilization dropped 15%',
    description: 'Botox bookings at SoHo are down 15% this week vs last. Consider a Tuesday promotion or social media push to fill 6 open slots.',
    locationId: 'soho', impact: 2700, timestamp: minutesAgo(30),
    actionLabel: 'Create Tuesday Promo', dismissed: false,
  },
  {
    id: 'alert-002', type: 'warning',
    title: 'Williamsburg has 8 unbooked slots tomorrow',
    description: 'Tomorrow at Williamsburg there are 8 empty appointment slots. AI can send targeted texts to 24 clients who are overdue for rebooking.',
    locationId: 'williamsburg', impact: 3200, timestamp: minutesAgo(45),
    actionLabel: 'Send Rebooking Texts', dismissed: false,
  },
  {
    id: 'alert-003', type: 'opportunity',
    title: 'Body Contouring demand surging at Hoboken',
    description: 'Body Contouring inquiries up 40% at Hoboken this week. 3 consultations pending conversion. Follow-up could yield $3,600.',
    locationId: 'hoboken', impact: 3600, timestamp: minutesAgo(120),
    actionLabel: 'Follow Up on Leads', dismissed: false,
  },
  {
    id: 'alert-004', type: 'critical',
    title: 'White Plains no-show rate spiked to 28%',
    description: 'No-show rate at White Plains hit 28% today. 3 of 11 clients missed appointments. Recommend same-day confirmation calls.',
    locationId: 'white-plains', impact: 1500, timestamp: minutesAgo(60),
    actionLabel: 'Enable Confirmation Calls', dismissed: false,
  },
  {
    id: 'alert-005', type: 'opportunity',
    title: 'Stamford Hydrafacial trending on social',
    description: 'A client tagged Etienne Stamford in a viral TikTok about their Hydrafacial. 12 DM inquiries received. Fast response could convert 8+.',
    locationId: 'stamford', impact: 2000, timestamp: minutesAgo(90),
    actionLabel: 'Respond to DMs', dismissed: false,
  },
  {
    id: 'alert-006', type: 'warning',
    title: 'SoHo provider Dr. Elena Vasquez nearing capacity',
    description: 'Dr. Elena Vasquez is booked at 92% for the next 5 business days. Consider routing overflow to Sarah Kim or Olivia Chen.',
    locationId: 'soho', impact: 1800, timestamp: daysAgoISO(0, 8, 0),
    actionLabel: 'Rebalance Schedule', dismissed: false,
  },
  {
    id: 'alert-007', type: 'opportunity',
    title: 'Williamsburg Chemical Peel upsell opportunity',
    description: '14 Hydrafacial clients at Williamsburg have never tried Chemical Peel. Targeted email campaign could generate $2,800.',
    locationId: 'williamsburg', impact: 2800, timestamp: daysAgoISO(0, 9, 30),
    actionLabel: 'Launch Email Campaign', dismissed: false,
  },
  {
    id: 'alert-008', type: 'critical',
    title: 'Hoboken Room 2 double-booked at 2 PM',
    description: 'Scheduling conflict: Room 2 at Hoboken has two overlapping appointments at 2 PM tomorrow. Immediate resolution needed.',
    locationId: 'hoboken', impact: 850, timestamp: minutesAgo(15),
    actionLabel: 'Resolve Conflict', dismissed: false,
  },
  {
    id: 'alert-009', type: 'opportunity',
    title: 'White Plains lunch-hour slots consistently empty',
    description: 'The 12-1 PM slot at White Plains has been empty 80% of the time this month. A "Lunch Break Hydrafacial" promo could fill it.',
    locationId: 'white-plains', impact: 1250, timestamp: daysAgoISO(0, 10, 0),
    actionLabel: 'Create Lunch Promo', dismissed: false,
  },
  {
    id: 'alert-010', type: 'warning',
    title: 'Stamford rebooking rate below target',
    description: 'Stamford rebooking rate is 48% vs 65% target. 22 clients have not rebooked after their last visit. Automated follow-up recommended.',
    locationId: 'stamford', impact: 4400, timestamp: daysAgoISO(0, 11, 0),
    actionLabel: 'Trigger Follow-ups', dismissed: false,
  },
  {
    id: 'alert-011', type: 'opportunity',
    title: 'After-hours inquiry conversion: 78%',
    description: 'After-hours inquiries are converting at 78% — response time averaging 12 seconds vs. 4.2 hour industry benchmark.',
    locationId: 'soho', impact: 5400, timestamp: daysAgoISO(1, 9, 0),
    actionLabel: 'Increase Evening Ads', dismissed: false,
  },
  {
    id: 'alert-012', type: 'warning',
    title: 'Williamsburg Filler inventory low',
    description: 'Dermal Filler product inventory at Williamsburg projected to run out in 3 days based on current booking pace.',
    locationId: 'williamsburg', impact: 3400, timestamp: daysAgoISO(1, 14, 0),
    actionLabel: 'Reorder Inventory', dismissed: false,
  },
  {
    id: 'alert-013', type: 'opportunity',
    title: 'Hoboken Saturday fully booked — add overflow',
    description: 'This Saturday at Hoboken is 100% booked with 4 people on waitlist. Opening an extra provider could capture $2,400.',
    locationId: 'hoboken', impact: 2400, timestamp: daysAgoISO(1, 10, 0),
    actionLabel: 'Add Saturday Provider', dismissed: false,
  },
  {
    id: 'alert-014', type: 'critical',
    title: '3 high-CLV clients at risk of churn',
    description: 'Danielle Parker ($15K CLV), Diana Torres ($5.5K CLV), and Amy Stewart ($4.2K CLV) are overdue for appointments by 30+ days.',
    locationId: 'soho', impact: 8200, timestamp: daysAgoISO(1, 11, 0),
    actionLabel: 'Send VIP Outreach', dismissed: false,
  },
  {
    id: 'alert-015', type: 'opportunity',
    title: 'White Plains new client acquisition up 25%',
    description: 'New client sign-ups at White Plains are up 25% month-over-month. Ensure first-visit experience is optimized for retention.',
    locationId: 'white-plains', impact: 3000, timestamp: daysAgoISO(2, 9, 0),
    actionLabel: 'Review Onboarding', dismissed: true,
  },
  {
    id: 'alert-016', type: 'warning',
    title: 'Stamford response time creeping up',
    description: 'Average response time at Stamford increased from 18s to 26s over the past week. AI agent may need retuning.',
    locationId: 'stamford', impact: 800, timestamp: daysAgoISO(2, 15, 0),
    actionLabel: 'Review AI Config', dismissed: true,
  },
  {
    id: 'alert-017', type: 'opportunity',
    title: 'Cross-sell: SoHo Botox clients for Hydrafacial',
    description: '18 Botox-only clients at SoHo have never booked a Hydrafacial. A bundled "Refresh Package" could yield $4,500 in new revenue.',
    locationId: 'soho', impact: 4500, timestamp: daysAgoISO(3, 10, 0),
    actionLabel: 'Create Bundle Offer', dismissed: true,
  },
  {
    id: 'alert-018', type: 'warning',
    title: 'Williamsburg Sunday request volume increasing',
    description: '12 booking requests for Sunday at Williamsburg were deflected this month. Consider adding limited Sunday hours.',
    locationId: 'williamsburg', impact: 4200, timestamp: daysAgoISO(3, 14, 0),
    actionLabel: 'Evaluate Sunday Hours', dismissed: true,
  },
  {
    id: 'alert-019', type: 'opportunity',
    title: 'Hoboken Laser Hair package conversion',
    description: '6 single-session Laser clients at Hoboken could be converted to 3-session packages, adding $2,100 in committed revenue.',
    locationId: 'hoboken', impact: 2100, timestamp: daysAgoISO(4, 9, 0),
    actionLabel: 'Offer Package Deal', dismissed: true,
  },
  {
    id: 'alert-020', type: 'critical',
    title: 'Report Generator agent in error state',
    description: 'The Report Generator intelligence agent has been in error state for 2 hours. Weekly reports may be delayed.',
    locationId: 'soho', impact: 0, timestamp: minutesAgo(120),
    actionLabel: 'Restart Agent', dismissed: false,
  },
]

// ---------------------------------------------------------------------------
// Opportunities
// ---------------------------------------------------------------------------
export const opportunities: Opportunity[] = [
  // 8 new
  { id: 'opp-001', guestName: 'Sophia Martinez', guestPhone: '(212) 555-0201', serviceInterest: 'Botox — Forehead & Crow\'s Feet', source: 'phone', status: 'new', locationId: 'soho', estimatedRevenue: 650, createdAt: daysAgoISO(0, 10, 15), notes: 'Called asking about pricing, seemed very interested.' },
  { id: 'opp-002', guestName: 'Liam Chen', guestPhone: '(718) 555-0302', serviceInterest: 'Hydrafacial Platinum', source: 'web', status: 'new', locationId: 'williamsburg', estimatedRevenue: 350, createdAt: daysAgoISO(0, 14, 30), notes: 'Submitted online inquiry form.' },
  { id: 'opp-003', guestName: 'Ava Patel', guestPhone: '(201) 555-0403', serviceInterest: 'Laser Hair Removal — Full Legs', source: 'social', status: 'new', locationId: 'hoboken', estimatedRevenue: 1200, createdAt: daysAgoISO(1, 9, 0), notes: 'DM on Instagram, wants package pricing.' },
  { id: 'opp-004', guestName: 'Noah Williams', guestPhone: '(914) 555-0504', serviceInterest: 'CoolSculpting Consultation', source: 'phone', status: 'new', locationId: 'white-plains', estimatedRevenue: 1500, createdAt: daysAgoISO(1, 11, 45), notes: 'Referred by existing client. High intent.' },
  { id: 'opp-005', guestName: 'Isabella Johnson', guestPhone: '(203) 555-0605', serviceInterest: 'Dermal Fillers — Lips', source: 'web', status: 'new', locationId: 'stamford', estimatedRevenue: 800, createdAt: daysAgoISO(1, 16, 0), notes: 'Browsed filler page 3 times before inquiry.' },
  { id: 'opp-006', guestName: 'Emma Rodriguez', guestPhone: '(212) 555-0706', serviceInterest: 'Chemical Peel — VI Peel', source: 'walk-in', status: 'new', locationId: 'soho', estimatedRevenue: 450, createdAt: daysAgoISO(2, 13, 0), notes: 'Walked in asking about skin resurfacing options.' },
  { id: 'opp-007', guestName: 'Oliver Kim', guestPhone: '(718) 555-0807', serviceInterest: 'Microneedling with PRP', source: 'social', status: 'new', locationId: 'williamsburg', estimatedRevenue: 750, createdAt: daysAgoISO(2, 10, 30), notes: 'Responded to TikTok ad about skin rejuvenation.' },
  { id: 'opp-008', guestName: 'Charlotte Davis', guestPhone: '(201) 555-0908', serviceInterest: 'IPL Photofacial', source: 'phone', status: 'new', locationId: 'hoboken', estimatedRevenue: 500, createdAt: daysAgoISO(3, 9, 15), notes: 'Called about sun damage treatment.' },

  // 7 contacted
  { id: 'opp-009', guestName: 'James Thompson', guestPhone: '(914) 555-1009', serviceInterest: 'Botox — Full Face', source: 'web', status: 'contacted', locationId: 'white-plains', estimatedRevenue: 850, createdAt: daysAgoISO(3, 14, 0), notes: 'Follow-up call scheduled for tomorrow.' },
  { id: 'opp-010', guestName: 'Mia Garcia', guestPhone: '(203) 555-1110', serviceInterest: 'Hydrafacial + LED Add-on', source: 'phone', status: 'contacted', locationId: 'stamford', estimatedRevenue: 400, createdAt: daysAgoISO(4, 11, 0), notes: 'Texted pricing info, awaiting response.' },
  { id: 'opp-011', guestName: 'Ethan Brown', guestPhone: '(212) 555-1211', serviceInterest: 'Laser Hair Removal — Back', source: 'social', status: 'contacted', locationId: 'soho', estimatedRevenue: 900, createdAt: daysAgoISO(4, 15, 30), notes: 'Sent consultation booking link via DM.' },
  { id: 'opp-012', guestName: 'Amelia Wilson', guestPhone: '(718) 555-1312', serviceInterest: 'Kybella — Double Chin', source: 'web', status: 'contacted', locationId: 'williamsburg', estimatedRevenue: 1200, createdAt: daysAgoISO(5, 10, 0), notes: 'Email sent with before/after gallery.' },
  { id: 'opp-013', guestName: 'Lucas Taylor', guestPhone: '(201) 555-1413', serviceInterest: 'Sculptra — Cheeks', source: 'phone', status: 'contacted', locationId: 'hoboken', estimatedRevenue: 1100, createdAt: daysAgoISO(5, 13, 0), notes: 'Discussed treatment plan over phone.' },
  { id: 'opp-014', guestName: 'Harper Anderson', guestPhone: '(914) 555-1514', serviceInterest: 'Morpheus8 — Face', source: 'walk-in', status: 'contacted', locationId: 'white-plains', estimatedRevenue: 1300, createdAt: daysAgoISO(6, 11, 30), notes: 'Came in for consult, reviewing financing options.' },
  { id: 'opp-015', guestName: 'Benjamin Lee', guestPhone: '(203) 555-1615', serviceInterest: 'Microneedling Package (3 sessions)', source: 'social', status: 'contacted', locationId: 'stamford', estimatedRevenue: 950, createdAt: daysAgoISO(6, 9, 45), notes: 'Engaged with stories ad, sent package details.' },

  // 6 booked
  { id: 'opp-016', guestName: 'Ella Martin', guestPhone: '(212) 555-1716', serviceInterest: 'Botox — Forehead Lines', source: 'phone', status: 'booked', locationId: 'soho', estimatedRevenue: 550, createdAt: daysAgoISO(7, 10, 0), notes: 'Booked for next Tuesday at 2pm.' },
  { id: 'opp-017', guestName: 'Alexander White', guestPhone: '(718) 555-1817', serviceInterest: 'Hydrafacial Deluxe', source: 'web', status: 'booked', locationId: 'williamsburg', estimatedRevenue: 300, createdAt: daysAgoISO(8, 14, 0), notes: 'Confirmed online booking for Saturday.' },
  { id: 'opp-018', guestName: 'Scarlett Harris', guestPhone: '(201) 555-1918', serviceInterest: 'Laser Hair Removal — Bikini', source: 'social', status: 'booked', locationId: 'hoboken', estimatedRevenue: 600, createdAt: daysAgoISO(8, 11, 30), notes: 'Package deal secured — 6 sessions.' },
  { id: 'opp-019', guestName: 'Daniel Clark', guestPhone: '(914) 555-2019', serviceInterest: 'CoolSculpting — Abdomen', source: 'phone', status: 'booked', locationId: 'white-plains', estimatedRevenue: 1400, createdAt: daysAgoISO(9, 9, 0), notes: 'Two-area treatment plan booked.' },
  { id: 'opp-020', guestName: 'Grace Lewis', guestPhone: '(203) 555-2120', serviceInterest: 'Dermal Fillers — Cheeks & Lips', source: 'walk-in', status: 'booked', locationId: 'stamford', estimatedRevenue: 1100, createdAt: daysAgoISO(10, 15, 0), notes: 'Walk-in consult converted to booking.' },
  { id: 'opp-021', guestName: 'Jack Robinson', guestPhone: '(212) 555-2221', serviceInterest: 'Chemical Peel — Jessner\'s', source: 'web', status: 'booked', locationId: 'soho', estimatedRevenue: 350, createdAt: daysAgoISO(10, 12, 0), notes: 'First-time client, booked intro offer.' },

  // 4 lost
  { id: 'opp-022', guestName: 'Aria Walker', guestPhone: '(718) 555-2322', serviceInterest: 'Morpheus8 — Body', source: 'phone', status: 'lost', locationId: 'williamsburg', estimatedRevenue: 1500, createdAt: daysAgoISO(12, 10, 0), notes: 'Price too high, went to competitor.' },
  { id: 'opp-023', guestName: 'Henry Young', guestPhone: '(201) 555-2423', serviceInterest: 'Botox — Jawline Slimming', source: 'web', status: 'lost', locationId: 'hoboken', estimatedRevenue: 700, createdAt: daysAgoISO(14, 11, 0), notes: 'No response after 3 follow-ups.' },
  { id: 'opp-024', guestName: 'Chloe King', guestPhone: '(914) 555-2524', serviceInterest: 'IPL Photofacial Package', source: 'social', status: 'lost', locationId: 'white-plains', estimatedRevenue: 800, createdAt: daysAgoISO(15, 14, 0), notes: 'Decided to wait until after summer.' },
  { id: 'opp-025', guestName: 'Sebastian Wright', guestPhone: '(203) 555-2625', serviceInterest: 'Laser Hair Removal — Arms', source: 'walk-in', status: 'lost', locationId: 'stamford', estimatedRevenue: 500, createdAt: daysAgoISO(18, 16, 0), notes: 'Insurance question — not covered, declined.' },
]
