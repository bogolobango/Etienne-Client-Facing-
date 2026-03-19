// ============================================================================
// Boulevard (BLVD) API Types
// API: GraphQL (Client API + Admin API)
// Auth: API Key + Business ID
// Tier: Enterprise only
// Docs: https://developers.joinblvd.com/
// SDK: @boulevard/blvd-book-sdk
// ============================================================================

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
export interface BoulevardCredentials {
  apiKey: string
  businessId: string
  sandbox?: boolean // use sandbox environment
}

// ---------------------------------------------------------------------------
// Business / Location
// ---------------------------------------------------------------------------
export interface BlvdBusiness {
  id: string
  name: string
  timezone: string
  website?: string
  contactEmail?: string
  locations: BlvdLocation[]
}

export interface BlvdLocation {
  id: string
  name: string
  address: BlvdAddress
  businessPhone?: string
  contactEmail?: string
  isActive: boolean
}

export interface BlvdAddress {
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export interface BlvdService {
  id: string
  name: string
  description?: string
  category?: BlvdServiceCategory
  pricingOptions: BlvdPricingOption[]
  duration: number // minutes
  isActive: boolean
}

export interface BlvdServiceCategory {
  id: string
  name: string
}

export interface BlvdPricingOption {
  id: string
  name?: string
  price: number // in minor units (cents)
  duration: number
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------
export interface BlvdClient {
  id: string
  firstName: string
  lastName: string
  email?: string
  mobilePhone?: string
  homePhone?: string
  createdAt: string // ISO datetime
  updatedAt: string
  dob?: string
  notes?: string
  tags?: BlvdTag[]
  externalId?: string
}

export interface BlvdTag {
  id: string
  name: string
}

// ---------------------------------------------------------------------------
// Appointment
// ---------------------------------------------------------------------------
export interface BlvdAppointment {
  id: string
  locationId: string
  clientId?: string
  client?: {
    firstName: string
    lastName: string
  }
  state: BlvdAppointmentState
  startAt: string // ISO datetime (UTC)
  endAt: string // ISO datetime (UTC)
  duration: number // minutes
  createdAt: string
  cancelledAt?: string
  appointmentServices: BlvdAppointmentService[]
  bookedBy?: 'Client' | 'Staff' | 'API'
  notes?: string
}

export type BlvdAppointmentState =
  | 'BOOKED'
  | 'CONFIRMED'
  | 'ARRIVED'
  | 'STARTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface BlvdAppointmentService {
  serviceId: string
  serviceName: string
  staffId: string
  staffName: string
  price: number // minor units (cents)
  duration: number
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------
export interface BlvdStaff {
  id: string
  firstName: string
  lastName: string
  displayName: string
  email?: string
  mobilePhone?: string
  role?: BlvdStaffRole
  isActive: boolean
  avatar?: string
}

export interface BlvdStaffRole {
  id: string
  name: string
}

// ---------------------------------------------------------------------------
// Order / Transaction
// ---------------------------------------------------------------------------
export interface BlvdOrder {
  id: string
  locationId: string
  clientId?: string
  appointmentId?: string
  createdAt: string
  closedAt?: string
  state: 'OPEN' | 'CLOSED' | 'VOIDED'
  summary: {
    subtotal: number // minor units
    taxTotal: number
    discountTotal: number
    grandTotal: number
    gratuityTotal: number
  }
  lineItems: BlvdLineItem[]
  payments: BlvdPayment[]
}

export interface BlvdLineItem {
  id: string
  itemType: 'SERVICE' | 'PRODUCT' | 'GIFT_CARD' | 'PACKAGE' | 'MEMBERSHIP'
  name: string
  quantity: number
  unitPrice: number // minor units
  totalPrice: number
  discountAmount?: number
}

export interface BlvdPayment {
  id: string
  method: 'CREDIT_CARD' | 'CASH' | 'GIFT_CARD' | 'OTHER'
  amount: number // minor units
}

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------
export interface BlvdWebhookPayload {
  id: string
  event: BlvdWebhookEventType
  data: Record<string, unknown>
  createdAt: string
}

export type BlvdWebhookEventType =
  | 'appointment.created'
  | 'appointment.updated'
  | 'appointment.cancelled'
  | 'appointment.completed'
  | 'appointment.active'
  | 'appointment.confirmed'
  | 'client.created'
  | 'client.updated'
  | 'order.closed'

// ---------------------------------------------------------------------------
// GraphQL Query Shapes (for building queries)
// ---------------------------------------------------------------------------
export interface BlvdPaginationInput {
  cursor?: string
  limit?: number
}

export interface BlvdPageInfo {
  cursor?: string
  hasMore: boolean
  total: number
}

export interface BlvdConnection<T> {
  edges: { node: T; cursor: string }[]
  pageInfo: BlvdPageInfo
}
