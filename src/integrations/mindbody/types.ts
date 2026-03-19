// ============================================================================
// Mindbody API Types (Public API V6)
// API: REST
// Auth: Bearer token (API Key + Site ID + User Token)
// Docs: https://developers.mindbodyonline.com/
// Pricing: $11/location/mo, 1000 calls/day/location included
// ============================================================================

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
export interface MindbodyCredentials {
  apiKey: string
  siteId: string
  username: string
  password: string
}

export interface MindbodyTokenResponse {
  TokenType: string
  AccessToken: string
  ExpiresIn: number // seconds
}

// ---------------------------------------------------------------------------
// Site / Location
// ---------------------------------------------------------------------------
export interface MindbodySite {
  Id: number
  Name: string
  Description?: string
  LogoUrl?: string
  PageColor1?: string
  AcceptsVisa: boolean
  AcceptsMasterCard: boolean
  ContactEmail?: string
}

export interface MindbodyLocation {
  Id: number
  Name: string
  Address?: string
  Address2?: string
  City?: string
  StateProvCode?: string
  PostalCode?: string
  Phone?: string
  Latitude?: number
  Longitude?: number
  BusinessDescription?: string
  HasClasses: boolean
  PhoneExtension?: string
  TotalNumberOfRatings: number
  AverageRating: number
  TotalNumberOfDeals: number
}

// ---------------------------------------------------------------------------
// Service / Session Type
// ---------------------------------------------------------------------------
export interface MindbodyService {
  Id: string
  Name: string
  Price: number
  OnlinePrice: number
  TaxRate: number
  IsActive: boolean
  Count: number // session count for packages
  ProductId?: number
  ProgramId: number
  Category?: string
  CategoryId?: number
  Subcategory?: string
  SubcategoryId?: number
}

export interface MindbodySessionType {
  Id: number
  Name: string
  NumDeducted: number
  ProgramId: number
  DefaultTimeLength?: number
  Type: 'All' | 'Service' | 'Class' | 'Enrollment' | 'Appointment'
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------
export interface MindbodyClient {
  Id: string
  UniqueId: number
  FirstName: string
  LastName: string
  Email?: string
  MobilePhone?: string
  HomePhone?: string
  WorkPhone?: string
  AddressLine1?: string
  City?: string
  State?: string
  PostalCode?: string
  BirthDate?: string
  Gender?: string
  CreationDate: string
  FirstAppointmentDate?: string
  LastModifiedDateTime?: string
  IsCompany: boolean
  IsProspect: boolean
  Status: 'Active' | 'Declined' | 'Suspended' | 'Expired' | 'Terminated'
  AccountBalance: number
  ClientCreditCard?: MindbodyClientCreditCard
  ClientIndexes?: MindbodyClientIndex[]
  ClientRelationships?: MindbodyClientRelationship[]
  ReferredBy?: string
  Notes?: string
  PhotoUrl?: string
}

export interface MindbodyClientCreditCard {
  CardType: string
  LastFour: string
  ExpMonth: string
  ExpYear: string
}

export interface MindbodyClientIndex {
  Id: number
  ValueId: number
  IndexName: string
  IndexValue: string
}

export interface MindbodyClientRelationship {
  RelatedClientId: string
  Relationship: MindbodyRelationship
  RelationshipName: string
}

export interface MindbodyRelationship {
  Id: number
  RelationshipName1: string
  RelationshipName2: string
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------
export interface MindbodyStaff {
  Id: number
  FirstName: string
  LastName: string
  DisplayName?: string
  Email?: string
  MobilePhone?: string
  HomePhone?: string
  City?: string
  State?: string
  PostalCode?: string
  Bio?: string
  IsActive: boolean
  IsMale: boolean
  SortOrder?: number
  ImageUrl?: string
  AppointmentTrn?: boolean // accepts appointments
  ReservationTrn?: boolean // accepts class enrollments
  IndependentContractor: boolean
  AlwaysAllowDoubleBooking: boolean
}

// ---------------------------------------------------------------------------
// Appointment
// ---------------------------------------------------------------------------
export interface MindbodyAppointment {
  Id: number
  LocationId: number
  ClientId?: string
  Client?: {
    Id: string
    FirstName: string
    LastName: string
  }
  StaffId: number
  Staff?: {
    Id: number
    FirstName: string
    LastName: string
    DisplayName?: string
  }
  SessionType?: MindbodySessionType
  StartDateTime: string // ISO datetime
  EndDateTime: string // ISO datetime
  Duration: number // minutes
  Status: MindbodyAppointmentStatus
  Notes?: string
  StaffRequested: boolean
  ServiceId?: number
  ServiceName?: string
  Resources?: MindbodyResource[]
  AddOns?: MindbodyAddOn[]
  GenderPreference: 'None' | 'Male' | 'Female'
  IsWaitlist: boolean
  FirstAppointment: boolean
}

export type MindbodyAppointmentStatus =
  | 'Booked'
  | 'Confirmed'
  | 'Arrived'
  | 'InProgress'
  | 'Completed'
  | 'NoShow'
  | 'Cancelled'
  | 'LateCancelled'

export interface MindbodyResource {
  Id: number
  Name: string
}

export interface MindbodyAddOn {
  Id: number
  Name: string
  Price: number
}

// ---------------------------------------------------------------------------
// Visits (Client Visit History)
// ---------------------------------------------------------------------------
export interface MindbodyVisit {
  Id: number
  ClientId: string
  LocationId: number
  ClassId?: number
  AppointmentId?: number
  ServiceId?: number
  ServiceName?: string
  StaffId: number
  StaffName?: string
  StartDateTime: string
  EndDateTime: string
  LastModifiedDateTime?: string
  SignedIn: boolean
  MakeUp: boolean
  LateCancelled: boolean
  WebSignup: boolean
}

// ---------------------------------------------------------------------------
// Sales
// ---------------------------------------------------------------------------
export interface MindbodySale {
  SaleId: number
  SaleDate: string // ISO datetime
  SaleTime: string // HH:mm
  SaleDateTime: string // ISO datetime
  ClientId?: string
  LocationId: number
  Description: string
  Method: number
  MethodName?: string
  Type: 'Service' | 'Product' | 'Package' | 'Contract' | 'Tip' | 'GiftCard'
  Quantity: number
  Amount: number
  Discount: number
  Tax: number
  Total: number
  Returned: boolean
  PaymentRefId?: string
}

export interface MindbodyContract {
  Id: number
  Name: string
  Description?: string
  ClientId: string
  StartDate: string
  EndDate?: string
  AutopayStatus: 'Active' | 'Suspended' | 'Ended' | 'Cancelled'
  ContractPrice: number
  TotalPrice: number
  IsAutoRenewing: boolean
  AgreementDate: string
}

// ---------------------------------------------------------------------------
// Purchases (Products, Packages, Gift Cards)
// ---------------------------------------------------------------------------
export interface MindbodyProduct {
  Id: string
  GroupId: number
  Name: string
  Price: number
  OnlinePrice: number
  TaxRate: number
  ShortDesc?: string
  LongDesc?: string
  CategoryId?: number
  SubCategoryId?: number
  Color?: MindbodyColor
  Size?: MindbodySize
}

export interface MindbodyColor {
  Id: number
  Name: string
}

export interface MindbodySize {
  Id: number
  Name: string
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------
export interface MindbodyWebhookPayload {
  messageId: string
  eventId: string
  eventSchemaVersion: number
  eventInstanceOriginationDateTime: string // ISO datetime
  eventData: Record<string, unknown>
}

export type MindbodyWebhookEventType =
  | 'appointmentBooking.created'
  | 'appointmentBooking.updated'
  | 'appointmentBooking.cancelled'
  | 'classRoster.booked'
  | 'classRoster.cancelled'
  | 'clientContract.created'
  | 'clientContract.updated'
  | 'clientContract.cancelled'
  | 'clientMembership.created'
  | 'clientMembership.updated'
  | 'clientMembership.cancelled'
  | 'client.created'
  | 'client.updated'
  | 'client.deactivated'
  | 'sale.created'
  | 'sale.updated'

// ---------------------------------------------------------------------------
// API Response Envelope
// ---------------------------------------------------------------------------
export interface MindbodyPaginationResponse<T> {
  PaginationResponse: {
    RequestedLimit: number
    RequestedOffset: number
    PageSize: number
    TotalResults: number
  }
  [key: string]: T[] | MindbodyPaginationResponse<T>['PaginationResponse'] | undefined
}

export interface MindbodyApiError {
  Error: {
    Message: string
    Code: string
  }
}
