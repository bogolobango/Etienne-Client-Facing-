// ================================================================
// Zenoti API Response Types
// Based on https://docs.zenoti.com/reference
// ================================================================

// ── Authentication ──────────────────────────────────────────────

export interface ZenotiTokenRequest {
  account_name: string
  application_id: string
  secret_key: string
  /** Employee username — required for bearer‑token auth */
  user_name?: string
  /** Employee password — required for bearer‑token auth */
  password?: string
}

export interface ZenotiTokenResponse {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  /** ISO timestamp of when the token was issued */
  issued_at?: string
}

// ── Centers (Locations) ─────────────────────────────────────────

export interface ZenotiCenter {
  id: string
  name: string
  code: string
  display_name: string
  description: string
  address_1: string
  address_2: string
  city: string
  state: { id: number; code: string; name: string }
  country: { id: number; code: string; name: string }
  zip_code: string
  phone: string
  email: string
  time_zone: string
  currency: { id: number; code: string; symbol: string }
  is_active: boolean
  rooms: ZenotiRoom[]
  /** Number of active service providers */
  provider_count?: number
}

export interface ZenotiRoom {
  id: string
  name: string
  is_active: boolean
}

export interface ZenotiCentersResponse {
  centers: ZenotiCenter[]
  page_info: ZenotiPageInfo
}

// ── Services ────────────────────────────────────────────────────

export interface ZenotiService {
  id: string
  name: string
  description: string
  category: ZenotiServiceCategory
  duration: number
  /** Duration in minutes (for add‑on services) */
  add_on_duration: number
  price: ZenotiPrice
  is_active: boolean
  can_be_booked_online: boolean
  /** Recovery / gap time between back‑to‑back bookings (minutes) */
  recovery_time: number
}

export interface ZenotiServiceCategory {
  id: string
  name: string
  description: string
}

export interface ZenotiPrice {
  currency_id: number
  sales: number
  /** Special / promotional price */
  special: number
}

export interface ZenotiServicesResponse {
  services: ZenotiService[]
  page_info: ZenotiPageInfo
}

// ── Guests (Clients) ────────────────────────────────────────────

export interface ZenotiGuest {
  id: string
  personal_info: {
    first_name: string
    last_name: string
    middle_name: string
    email: string
    mobile_phone: { country_code: number; number: string }
    home_phone: { country_code: number; number: string }
    work_phone: { country_code: number; number: string }
    gender: number
    date_of_birth: string
    anniversary_date: string
  }
  center_id: string
  /** Preferred / home center */
  home_center_id: string
  creation_date: string
  tags: string[]
  is_active: boolean
  loyalty_points: { redeemable: number; non_redeemable: number }
  /** Total completed visits across all centers */
  total_visits?: number
  /** Customer lifetime value */
  clv?: number
  /** No‑show count */
  no_show_count?: number
  /** Date of last appointment (ISO) */
  last_visit_date?: string
  /** Preferred service id */
  preferred_service_id?: string
}

export interface ZenotiGuestsResponse {
  guests: ZenotiGuest[]
  page_info: ZenotiPageInfo
}

// ── Appointments ────────────────────────────────────────────────

export interface ZenotiAppointment {
  appointment_id: string
  /** Group ID — bundles multi‑service appointments */
  appointment_group_id: string
  invoice_id: string
  center_id: string
  guest: {
    id: string
    first_name: string
    last_name: string
  }
  service: {
    id: string
    name: string
  }
  therapist: {
    id: string
    first_name: string
    last_name: string
  }
  room: {
    id: string
    name: string
  }
  start_time: string
  end_time: string
  /**
   * Zenoti status codes:
   *  0 = New / Booked,  1 = Confirmed,  2 = Checked‑in,
   *  4 = Completed (started), 10 = No‑show, -1 = Cancelled,
   *  -2 = Available
   */
  status: number
  /** Source of booking: 0 = Walk‑in, 1 = Phone, 2 = Online, 3 = App, 4 = API */
  booking_source: number
  notes: string
  price: ZenotiPrice
  created_date: string
  /** Custom fields set on the appointment */
  custom_data?: Record<string, unknown>
  progress?: {
    status: 'open' | 'started' | 'completed'
  }
}

export interface ZenotiAppointmentsResponse {
  appointments: ZenotiAppointment[]
  page_info: ZenotiPageInfo
}

// ── Invoices & Collections (Revenue) ────────────────────────────

export interface ZenotiInvoice {
  invoice_id: string
  receipt_no: string
  center_id: string
  guest_id: string
  invoice_date: string
  status: number
  items: ZenotiInvoiceItem[]
  total: { amount: number; currency_id: number }
  tax: { amount: number }
  tips: { amount: number }
  payments: ZenotiPayment[]
}

export interface ZenotiInvoiceItem {
  id: string
  type: 'service' | 'product' | 'package' | 'membership' | 'giftcard'
  name: string
  quantity: number
  price: { amount: number }
  tax: { amount: number }
  discount: { amount: number }
  net: { amount: number }
}

export interface ZenotiPayment {
  id: string
  mode: string
  amount: number
  transaction_id: string
  status: number
}

export interface ZenotiInvoiceResponse {
  invoice: ZenotiInvoice
}

export interface ZenotiCollection {
  date: string
  center_id: string
  total_revenue: number
  service_revenue: number
  product_revenue: number
  package_revenue: number
  membership_revenue: number
  gift_card_revenue: number
  tips: number
  tax: number
  total_transactions: number
  refunds: number
  net_revenue: number
}

export interface ZenotiCollectionsResponse {
  collections: ZenotiCollection[]
  page_info: ZenotiPageInfo
}

// ── Employees / Therapists ──────────────────────────────────────

export interface ZenotiEmployee {
  id: string
  personal_info: {
    first_name: string
    last_name: string
    email: string
    mobile_phone: { country_code: number; number: string }
    gender: number
  }
  center_id: string
  is_active: boolean
  job_title: string
  roles: string[]
  /** Performance metrics (from /v1/employees/performance) */
  performance?: ZenotiEmployeePerformance
}

export interface ZenotiEmployeePerformance {
  employee_id: string
  center_id: string
  total_appointments: number
  completed_appointments: number
  cancelled_appointments: number
  no_show_appointments: number
  total_revenue: number
  average_ticket: number
  utilization_rate: number
  rebooking_rate: number
  period_start: string
  period_end: string
}

export interface ZenotiEmployeesResponse {
  employees: ZenotiEmployee[]
  page_info: ZenotiPageInfo
}

export interface ZenotiEmployeePerformanceResponse {
  performance: ZenotiEmployeePerformance[]
}

// ── Sales Reports ───────────────────────────────────────────────

export interface ZenotiSalesReport {
  center_id: string
  center_name: string
  period: { start_date: string; end_date: string }
  summary: {
    total_revenue: number
    service_revenue: number
    product_revenue: number
    total_bookings: number
    total_guests_served: number
    average_ticket: number
    no_shows: number
    cancellations: number
  }
  daily_breakdown: ZenotiDailySales[]
}

export interface ZenotiDailySales {
  date: string
  revenue: number
  service_revenue?: number
  product_revenue?: number
  package_revenue?: number
  membership_revenue?: number
  gift_card_revenue?: number
  bookings: number
  package_bookings?: number
  no_shows: number
  cancellations: number
  new_clients: number
  utilization_rate: number
}

export interface ZenotiSalesReportResponse {
  report: ZenotiSalesReport
}

// ── Pagination ──────────────────────────────────────────────────

export interface ZenotiPageInfo {
  total: number
  page: number
  size: number
}

// ── Error ───────────────────────────────────────────────────────

export interface ZenotiError {
  code: string
  message: string
  field?: string
}

export interface ZenotiErrorResponse {
  errors: ZenotiError[]
  status: number
}

// ── Webhook Events ──────────────────────────────────────────────

export interface ZenotiWebhookEvent {
  event_type:
    | 'appointment.created'
    | 'appointment.updated'
    | 'appointment.cancelled'
    | 'appointment.noshow'
    | 'appointment.completed'
    | 'guest.created'
    | 'guest.updated'
    | 'invoice.created'
    | 'invoice.closed'
  timestamp: string
  center_id: string
  data: Record<string, unknown>
}
