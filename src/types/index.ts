export interface Location {
  id: string
  name: string
  city: string
  state: string
  rooms: number
  providers: number
}

export interface Service {
  id: string
  name: string
  price: number
  duration: number
  category: 'Injectable' | 'Facial' | 'Laser' | 'Body'
}

export interface Conversation {
  id: string
  clientName: string
  clientPhone: string
  channel: 'voice' | 'sms' | 'web' | 'social'
  status: 'ai_resolved' | 'escalated' | 'in_progress' | 'abandoned'
  priority: 'urgent' | 'pending' | 'ai_handling'
  summary: string
  transcript: TranscriptMessage[]
  locationId: string
  agentType: string
  timestamp: string
  duration?: number
  sentiment: 'positive' | 'neutral' | 'negative'
  resolved: boolean
  afterHours: boolean
  revenueImpact?: number
}

export interface TranscriptMessage {
  role: 'ai' | 'client' | 'staff'
  content: string
  timestamp: string
}

export type SaleType = 'service' | 'package' | 'product' | 'membership' | 'giftcard'

export interface Appointment {
  id: string
  clientName: string
  clientId: string
  service: string
  provider: string
  locationId: string
  date: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'completed' | 'no_show' | 'cancelled' | 'waitlist'
  bookedBy: 'ai' | 'staff' | 'online'
  noShowRisk: 'low' | 'medium' | 'high'
  room: number
  revenue: number
  /** Revenue for this specific visit (package revenue spread across sessions) */
  normalizedRevenue: number
  saleType: SaleType
  /** Package ID if this appointment is part of a multi-session package */
  packageId?: string
  /** e.g. "2 of 6" — which session in the package */
  packageSession?: string
}

export interface RevenueBreakdown {
  service: number
  package: number
  product: number
  membership: number
  giftcard: number
}

export interface DailyMetrics {
  date: string
  locationId: string
  revenue: number
  /** Revenue with package amounts normalized across sessions */
  normalizedRevenue: number
  /** Breakdown by sale type */
  revenueByType: RevenueBreakdown
  bookings: number
  /** Bookings that are part of a package */
  packageBookings: number
  noShows: number
  noShowRate: number
  responseTimeAvg: number
  utilizationRate: number
  newClients: number
  rebookingRate: number
  callsAnswered: number
  callsMissed: number
  aiResolved: number
  escalated: number
  revenueRecovered: number
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  preferredLocation: string
  totalVisits: number
  clv: number
  lastVisit: string
  joinDate: string
  favoriteService: string
  noShowCount: number
}

export interface Alert {
  id: string
  type: 'opportunity' | 'warning' | 'critical'
  title: string
  description: string
  locationId: string
  impact: number
  timestamp: string
  actionLabel: string
  dismissed: boolean
}

export interface AgentStatus {
  id: string
  name: string
  type: string
  module: 'command-center' | 'scheduling' | 'intelligence'
  status: 'online' | 'idle' | 'error'
  tasksHandled: number
  lastActivity: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Opportunity {
  id: string
  guestName: string
  guestPhone: string
  serviceInterest: string
  source: 'phone' | 'web' | 'social' | 'walk-in'
  status: 'new' | 'contacted' | 'booked' | 'lost'
  locationId: string
  estimatedRevenue: number
  createdAt: string
  notes: string
}

export type Role = 'owner' | 'staff'

export type LocationFilter = 'all' | string
