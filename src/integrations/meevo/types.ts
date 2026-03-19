// ============================================================================
// Meevo 2 API Types
// API: REST (Public API + Daily Data Stream)
// Auth: API Key + Account ID
// Docs: https://www.meevo.com/developer-tools
// Note: DDS provides 7-day change history for appointments, sales, client/employee data
// ============================================================================

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
export interface MeevoCredentials {
  apiKey: string
  accountId: string
}

// ---------------------------------------------------------------------------
// Business / Location
// ---------------------------------------------------------------------------
export interface MeevoBusiness {
  businessId: string
  businessName: string
  locations: MeevoLocation[]
}

export interface MeevoLocation {
  locationId: string
  locationName: string
  address?: MeevoAddress
  phone?: string
  email?: string
  timezone?: string
  isActive: boolean
}

export interface MeevoAddress {
  street1?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export interface MeevoService {
  serviceId: string
  serviceName: string
  categoryId?: string
  categoryName?: string
  price: number
  duration: number // minutes
  isActive: boolean
  description?: string
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------
export interface MeevoClient {
  clientId: string
  firstName: string
  lastName: string
  email?: string
  homePhone?: string
  cellPhone?: string
  dateOfBirth?: string
  gender?: string
  address?: MeevoAddress
  createdDate: string
  lastVisitDate?: string
  totalVisits: number
  totalRevenue: number
  noShowCount: number
  membershipIds?: string[]
  packageIds?: string[]
  notes?: string
}

// ---------------------------------------------------------------------------
// Employee
// ---------------------------------------------------------------------------
export interface MeevoEmployee {
  employeeId: string
  firstName: string
  lastName: string
  displayName: string
  email?: string
  phone?: string
  role: MeevoEmployeeRole
  locationIds: string[]
  isActive: boolean
  employmentType?: 'FullTime' | 'PartTime' | 'Contractor'
  includeInPayroll: boolean
}

export type MeevoEmployeeRole =
  | 'Owner'
  | 'Manager'
  | 'ServiceProvider'
  | 'FrontDesk'
  | 'Other'

// ---------------------------------------------------------------------------
// Appointment
// ---------------------------------------------------------------------------
export interface MeevoAppointment {
  appointmentId: string
  locationId: string
  clientId?: string
  clientFirstName?: string
  clientLastName?: string
  employeeId: string
  employeeName: string
  serviceId: string
  serviceName: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  duration: number // minutes
  status: MeevoAppointmentStatus
  bookingSource: MeevoBookingSource
  price: number
  roomId?: string
  notes?: string
  createdAt: string
  modifiedAt?: string
}

export type MeevoAppointmentStatus =
  | 'Booked'
  | 'Confirmed'
  | 'CheckedIn'
  | 'InProgress'
  | 'Completed'
  | 'NoShow'
  | 'Cancelled'

export type MeevoBookingSource =
  | 'Staff'
  | 'Online'
  | 'App'
  | 'WalkIn'
  | 'Phone'
  | 'API'

// ---------------------------------------------------------------------------
// Sale / Invoice
// ---------------------------------------------------------------------------
export interface MeevoSale {
  saleId: string
  locationId: string
  clientId?: string
  appointmentId?: string
  date: string
  items: MeevoSaleItem[]
  subtotal: number
  tax: number
  discount: number
  tip: number
  total: number
  paymentMethods: MeevoPaymentEntry[]
  status: 'Open' | 'Closed' | 'Voided' | 'Refunded'
}

export interface MeevoSaleItem {
  itemId: string
  type: 'Service' | 'Product' | 'Package' | 'Membership' | 'GiftCard'
  name: string
  quantity: number
  price: number
  total: number
  discount?: number
  employeeId?: string
}

export interface MeevoPaymentEntry {
  method: 'CreditCard' | 'Cash' | 'GiftCard' | 'Check' | 'AccountCredit' | 'Other'
  amount: number
}

// ---------------------------------------------------------------------------
// Client Liabilities (Packages, Memberships, Gift Cards)
// ---------------------------------------------------------------------------
export interface MeevoPackage {
  packageId: string
  packageName: string
  clientId: string
  purchaseDate: string
  expirationDate?: string
  totalSessions: number
  usedSessions: number
  remainingSessions: number
  totalValue: number
}

export interface MeevoMembership {
  membershipId: string
  membershipName: string
  clientId: string
  startDate: string
  endDate?: string
  status: 'Active' | 'Frozen' | 'Cancelled' | 'Expired'
  recurringPrice: number
  billingFrequency: 'Monthly' | 'Quarterly' | 'Annually'
}

export interface MeevoGiftCard {
  giftCardId: string
  code: string
  originalBalance: number
  currentBalance: number
  purchaseDate: string
  expirationDate?: string
  status: 'Active' | 'Used' | 'Expired'
}

// ---------------------------------------------------------------------------
// Daily Data Stream (DDS)
// ---------------------------------------------------------------------------
export interface MeevoDDSResponse<T> {
  changes: MeevoDDSChange<T>[]
  lastSyncTimestamp: string // ISO datetime
  hasMore: boolean
}

export interface MeevoDDSChange<T> {
  changeType: 'Added' | 'Updated' | 'Deleted'
  timestamp: string // ISO datetime
  record: T
}

// DDS entity types
export type MeevoDDSAppointment = MeevoDDSResponse<MeevoAppointment>
export type MeevoDDSSale = MeevoDDSResponse<MeevoSale>
export type MeevoDDSClient = MeevoDDSResponse<MeevoClient>
export type MeevoDDSEmployee = MeevoDDSResponse<MeevoEmployee>

// ---------------------------------------------------------------------------
// API Response Envelope
// ---------------------------------------------------------------------------
export interface MeevoApiResponse<T> {
  success: boolean
  data: T
  pagination?: {
    page: number
    pageSize: number
    totalCount: number
  }
  error?: {
    code: string
    message: string
    details?: string
  }
}
