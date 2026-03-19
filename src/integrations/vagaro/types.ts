// ============================================================================
// Vagaro API Types
// API: REST
// Auth: API Key (Enterprise access required)
// Docs: https://docs.vagaro.com/
// Webhooks: $10/mo (5000 calls)
// ============================================================================

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
export interface VagaroCredentials {
  apiKey: string
  businessId: string
}

// ---------------------------------------------------------------------------
// Business / Location
// ---------------------------------------------------------------------------
export interface VagaroBusiness {
  businessId: string
  businessName: string
  businessType: 'salon' | 'spa' | 'medspa' | 'fitness' | 'wellness'
  locations: VagaroLocation[]
}

export interface VagaroLocation {
  locationId: string
  locationName: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  email?: string
  timezone?: string
  isActive: boolean
}

// ---------------------------------------------------------------------------
// Employee
// ---------------------------------------------------------------------------
export interface VagaroEmployee {
  employeeId: string
  firstName: string
  lastName: string
  displayName: string
  email?: string
  phone?: string
  accessLevel: VagaroAccessLevel
  locationIds: string[] // assigned locations
  calendarEnabled: boolean
  isActive: boolean
  role?: string
}

export type VagaroAccessLevel =
  | 'owner'
  | 'manager'
  | 'employee'
  | 'receptionist'
  | 'limited'

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export interface VagaroService {
  serviceId: string
  serviceName: string
  categoryId?: string
  categoryName?: string
  duration: number // minutes
  price: number
  isActive: boolean
  description?: string
}

export interface VagaroServiceCategory {
  categoryId: string
  categoryName: string
  services: VagaroService[]
}

// ---------------------------------------------------------------------------
// Customer / Client
// ---------------------------------------------------------------------------
export interface VagaroCustomer {
  customerId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  mobilePhone?: string
  dateOfBirth?: string
  gender?: string
  address?: VagaroAddress
  createdDate: string // ISO date
  lastVisitDate?: string
  totalVisits: number
  totalSpent: number
  noShowCount: number
  notes?: string
  tags?: string[]
}

export interface VagaroAddress {
  address1?: string
  address2?: string
  city?: string
  state?: string
  zipCode?: string
}

// ---------------------------------------------------------------------------
// Appointment
// ---------------------------------------------------------------------------
export interface VagaroAppointment {
  appointmentId: string
  locationId: string
  customerId?: string
  customerFirstName?: string
  customerLastName?: string
  employeeId: string
  employeeName: string
  serviceId: string
  serviceName: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  duration: number // minutes
  status: VagaroAppointmentStatus
  bookingSource: VagaroBookingSource
  price: number
  notes?: string
  createdAt: string
  updatedAt?: string
}

export type VagaroAppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'CheckedIn'
  | 'Completed'
  | 'NoShow'
  | 'Cancelled'
  | 'Rescheduled'

export type VagaroBookingSource =
  | 'Calendar'     // staff booked
  | 'Online'       // client online booking
  | 'App'          // Vagaro app
  | 'WalkIn'
  | 'Phone'
  | 'API'

// ---------------------------------------------------------------------------
// Transaction
// ---------------------------------------------------------------------------
export interface VagaroTransaction {
  transactionId: string
  locationId: string
  customerId?: string
  appointmentId?: string
  date: string // ISO date
  items: VagaroTransactionItem[]
  subtotal: number
  tax: number
  discount: number
  tip: number
  total: number
  paymentMethod: VagaroPaymentMethod
  status: 'Completed' | 'Refunded' | 'Voided'
}

export interface VagaroTransactionItem {
  itemId: string
  type: 'Service' | 'Product' | 'GiftCard' | 'Package' | 'Membership'
  name: string
  quantity: number
  price: number
  total: number
}

export type VagaroPaymentMethod =
  | 'CreditCard'
  | 'Cash'
  | 'GiftCard'
  | 'Check'
  | 'Other'

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------
export interface VagaroWebhookPayload {
  webhookId: string
  eventType: VagaroWebhookEventType
  businessId: string
  locationId?: string
  timestamp: string // ISO datetime
  data: Record<string, unknown>
}

export type VagaroWebhookEventType =
  | 'appointment.booked'
  | 'appointment.modified'
  | 'appointment.cancelled'
  | 'customer.created'
  | 'customer.updated'
  | 'transaction.completed'
  | 'form.submitted'

// ---------------------------------------------------------------------------
// API Response Envelope
// ---------------------------------------------------------------------------
export interface VagaroApiResponse<T> {
  success: boolean
  data: T
  pagination?: {
    page: number
    pageSize: number
    totalRecords: number
    totalPages: number
  }
  error?: {
    code: string
    message: string
  }
}
