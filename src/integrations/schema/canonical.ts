// ============================================================================
// Canonical Schema — Unified data model for all PMS integrations
// All platform adapters (Zenoti, Boulevard, Vagaro, Meevo, Mindbody)
// map their native types into these canonical types.
// ============================================================================

// ---------------------------------------------------------------------------
// Location / Center
// ---------------------------------------------------------------------------
export interface CanonicalLocation {
  id: string
  externalId: string
  platform: PlatformType
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  email?: string
  timezone?: string
  isActive: boolean
  roomCount?: number
  providerCount?: number
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export type ServiceCategory =
  | 'injectable'
  | 'facial'
  | 'laser'
  | 'body'
  | 'skin'
  | 'wellness'
  | 'hair'
  | 'nail'
  | 'massage'
  | 'other'

export interface CanonicalService {
  id: string
  externalId: string
  platform: PlatformType
  locationId: string
  name: string
  category: ServiceCategory
  price: number
  duration: number // minutes
  isActive: boolean
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Client / Guest
// ---------------------------------------------------------------------------
export interface CanonicalClient {
  id: string
  externalId: string
  platform: PlatformType
  firstName: string
  lastName: string
  email?: string
  phone?: string
  preferredLocationId?: string
  totalVisits: number
  lifetimeValue: number
  lastVisitDate?: string // ISO date
  firstVisitDate?: string // ISO date
  noShowCount: number
  tags?: string[]
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Appointment
// ---------------------------------------------------------------------------
export type AppointmentStatus =
  | 'booked'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'no_show'
  | 'cancelled'
  | 'rescheduled'

export type BookingSource =
  | 'walk_in'
  | 'phone'
  | 'online'
  | 'app'
  | 'api'
  | 'staff'
  | 'ai'
  | 'unknown'

export interface CanonicalAppointment {
  id: string
  externalId: string
  platform: PlatformType
  locationId: string
  clientId?: string
  clientName: string
  serviceId?: string
  serviceName: string
  providerId?: string
  providerName: string
  date: string // ISO date (YYYY-MM-DD)
  startTime: string // HH:mm
  endTime: string // HH:mm
  durationMinutes: number
  status: AppointmentStatus
  bookingSource: BookingSource
  noShowRisk?: 'low' | 'medium' | 'high'
  revenue: number
  room?: number | string
  notes?: string
  packageId?: string
  saleType?: 'service' | 'package' | 'membership'
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Provider / Employee / Staff
// ---------------------------------------------------------------------------
export interface CanonicalProvider {
  id: string
  externalId: string
  platform: PlatformType
  locationId: string
  firstName: string
  lastName: string
  displayName: string
  role?: string // 'doctor' | 'nurse' | 'esthetician' | 'technician' | etc.
  isActive: boolean
  email?: string
  phone?: string
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Invoice / Transaction
// ---------------------------------------------------------------------------
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'gift_card' | 'insurance' | 'package' | 'membership' | 'other'

export interface CanonicalInvoiceItem {
  id: string
  type: 'service' | 'product' | 'package' | 'membership' | 'gift_card' | 'tip' | 'other'
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  discount?: number
}

export interface CanonicalInvoice {
  id: string
  externalId: string
  platform: PlatformType
  locationId: string
  clientId?: string
  appointmentId?: string
  date: string // ISO date
  items: CanonicalInvoiceItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod?: PaymentMethod
  status: 'open' | 'paid' | 'refunded' | 'void'
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Daily Metrics (aggregated per location per day)
// ---------------------------------------------------------------------------
export interface CanonicalDailyMetrics {
  date: string // ISO date (YYYY-MM-DD)
  locationId: string
  revenue: number
  normalizedRevenue: number // package revenue spread evenly across sessions
  revenueByType: {
    service: number
    package: number
    product: number
    membership: number
    giftcard: number
  }
  bookings: number
  packageBookings: number
  completedAppointments: number
  noShows: number
  noShowRate: number // 0-100
  cancellations: number
  utilizationRate: number // 0-100
  newClients: number
  returningClients: number
  rebookingRate: number // 0-100
  averageTicket: number
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Webhook Event
// ---------------------------------------------------------------------------
export type WebhookEventType =
  | 'appointment.created'
  | 'appointment.updated'
  | 'appointment.cancelled'
  | 'appointment.completed'
  | 'appointment.no_show'
  | 'client.created'
  | 'client.updated'
  | 'invoice.created'
  | 'invoice.paid'
  | 'transaction.completed'

export interface CanonicalWebhookEvent {
  id: string
  platform: PlatformType
  eventType: WebhookEventType
  timestamp: string // ISO datetime
  locationId?: string
  payload: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Platform Registry
// ---------------------------------------------------------------------------
export type PlatformType = 'zenoti' | 'boulevard' | 'vagaro' | 'meevo' | 'mindbody'

export interface PlatformConfig {
  platform: PlatformType
  displayName: string
  apiBaseUrl: string
  apiType: 'rest' | 'graphql'
  authType: 'api_key' | 'oauth2' | 'bearer_token'
  supportsWebhooks: boolean
  supportsStreaming: boolean
  rateLimitPerMinute?: number
  requiredCredentials: string[]
  documentationUrl: string
  notes?: string
}

export const PLATFORM_CONFIGS: Record<PlatformType, PlatformConfig> = {
  zenoti: {
    platform: 'zenoti',
    displayName: 'Zenoti',
    apiBaseUrl: 'https://{account}.zenoti.com/api/v1',
    apiType: 'rest',
    authType: 'api_key',
    supportsWebhooks: true,
    supportsStreaming: false,
    requiredCredentials: ['apiKey', 'accountName', 'appId', 'secretKey'],
    documentationUrl: 'https://docs.zenoti.com/docs',
    notes: 'V1 reports deprecated July 2025; use V2 endpoints',
  },
  boulevard: {
    platform: 'boulevard',
    displayName: 'Boulevard',
    apiBaseUrl: 'https://dashboard.boulevard.io/api',
    apiType: 'graphql',
    authType: 'api_key',
    supportsWebhooks: true,
    supportsStreaming: false,
    requiredCredentials: ['apiKey', 'businessId'],
    documentationUrl: 'https://developers.joinblvd.com/',
    notes: 'Enterprise tier required; Client API + Admin API (GraphQL)',
  },
  vagaro: {
    platform: 'vagaro',
    displayName: 'Vagaro',
    apiBaseUrl: 'https://api.vagaro.com/v1',
    apiType: 'rest',
    authType: 'api_key',
    supportsWebhooks: true,
    supportsStreaming: false,
    rateLimitPerMinute: 60,
    requiredCredentials: ['apiKey', 'businessId'],
    documentationUrl: 'https://docs.vagaro.com/',
    notes: 'Webhooks $10/mo (5000 calls included); Enterprise sales required for API access',
  },
  meevo: {
    platform: 'meevo',
    displayName: 'Meevo',
    apiBaseUrl: 'https://api.meevo.com/public/v1',
    apiType: 'rest',
    authType: 'api_key',
    supportsWebhooks: false,
    supportsStreaming: true, // Daily Data Stream (DDS)
    requiredCredentials: ['apiKey', 'accountId'],
    documentationUrl: 'https://www.meevo.com/developer-tools',
    notes: 'Public API + Daily Data Stream (DDS); DDS provides 7-day change history',
  },
  mindbody: {
    platform: 'mindbody',
    displayName: 'Mindbody',
    apiBaseUrl: 'https://api.mindbodyonline.com/public/v6',
    apiType: 'rest',
    authType: 'bearer_token',
    supportsWebhooks: true,
    supportsStreaming: false,
    rateLimitPerMinute: 100,
    requiredCredentials: ['apiKey', 'siteId', 'username', 'password'],
    documentationUrl: 'https://developers.mindbodyonline.com/',
    notes: '$11/location/mo; 1000 calls/day/location included; V6 Public API',
  },
}

// ---------------------------------------------------------------------------
// Data Validation
// ---------------------------------------------------------------------------
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  qualityScore: number // 0-100
}

export interface ValidationError {
  field: string
  message: string
  value?: unknown
  record?: string // record ID for context
}

export interface ValidationWarning {
  field: string
  message: string
  value?: unknown
  record?: string
}

// ---------------------------------------------------------------------------
// Ingestion Job
// ---------------------------------------------------------------------------
export type IngestionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'partial'

export interface IngestionJob {
  id: string
  platform: PlatformType
  clientId: string // EIP client workspace ID
  status: IngestionStatus
  startedAt: string // ISO datetime
  completedAt?: string
  recordsCounts: {
    locations: number
    services: number
    clients: number
    appointments: number
    invoices: number
    dailyMetrics: number
  }
  validation: ValidationResult
  errors?: string[]
}
