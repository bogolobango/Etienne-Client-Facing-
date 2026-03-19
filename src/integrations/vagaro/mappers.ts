// ============================================================================
// Vagaro → Canonical Mappers
// ============================================================================

import type {
  CanonicalAppointment,
  CanonicalClient,
  CanonicalInvoice,
  CanonicalLocation,
  CanonicalProvider,
  CanonicalService,
  AppointmentStatus,
  BookingSource,
  ServiceCategory,
} from '../schema/canonical'
import { cleanRevenue, cleanString, cleanCount } from '../schema/validation'
import type {
  VagaroAppointment,
  VagaroCustomer,
  VagaroEmployee,
  VagaroLocation,
  VagaroService,
  VagaroTransaction,
} from './types'

function mapAppointmentStatus(status: string): AppointmentStatus {
  const mapping: Record<string, AppointmentStatus> = {
    Scheduled: 'booked',
    Confirmed: 'confirmed',
    CheckedIn: 'checked_in',
    Completed: 'completed',
    NoShow: 'no_show',
    Cancelled: 'cancelled',
    Rescheduled: 'rescheduled',
  }
  return mapping[status] || 'booked'
}

function mapBookingSource(source: string): BookingSource {
  const mapping: Record<string, BookingSource> = {
    Calendar: 'staff',
    Online: 'online',
    App: 'app',
    WalkIn: 'walk_in',
    Phone: 'phone',
    API: 'api',
  }
  return mapping[source] || 'unknown'
}

function inferServiceCategory(name: string, categoryName?: string): ServiceCategory {
  const lower = (categoryName || name).toLowerCase()
  if (/botox|filler|inject|neuro/i.test(lower)) return 'injectable'
  if (/laser|ipl|resurfac/i.test(lower)) return 'laser'
  if (/body|contour|sculpt/i.test(lower)) return 'body'
  if (/facial|hydra|peel|micro/i.test(lower)) return 'facial'
  if (/skin|derm/i.test(lower)) return 'skin'
  if (/massage/i.test(lower)) return 'massage'
  if (/hair|cut|color|style/i.test(lower)) return 'hair'
  if (/nail|mani|pedi/i.test(lower)) return 'nail'
  if (/wellness|iv|vitamin/i.test(lower)) return 'wellness'
  return 'other'
}

export function mapVagaroLocation(loc: VagaroLocation): CanonicalLocation {
  return {
    id: `vagaro-${loc.locationId}`,
    externalId: loc.locationId,
    platform: 'vagaro',
    name: cleanString(loc.locationName),
    address: [loc.address1, loc.address2].filter(Boolean).join(', ') || undefined,
    city: loc.city || undefined,
    state: loc.state || undefined,
    zip: loc.zipCode || undefined,
    phone: loc.phone || undefined,
    email: loc.email || undefined,
    timezone: loc.timezone || undefined,
    isActive: loc.isActive,
  }
}

export function mapVagaroService(svc: VagaroService, locationId: string): CanonicalService {
  return {
    id: `vagaro-${svc.serviceId}`,
    externalId: svc.serviceId,
    platform: 'vagaro',
    locationId,
    name: cleanString(svc.serviceName),
    category: inferServiceCategory(svc.serviceName, svc.categoryName),
    price: cleanRevenue(svc.price),
    duration: svc.duration,
    isActive: svc.isActive,
  }
}

export function mapVagaroCustomer(customer: VagaroCustomer): CanonicalClient {
  return {
    id: `vagaro-${customer.customerId}`,
    externalId: customer.customerId,
    platform: 'vagaro',
    firstName: cleanString(customer.firstName),
    lastName: cleanString(customer.lastName),
    email: customer.email || undefined,
    phone: customer.mobilePhone || customer.phone || undefined,
    totalVisits: cleanCount(customer.totalVisits),
    lifetimeValue: cleanRevenue(customer.totalSpent),
    lastVisitDate: customer.lastVisitDate || undefined,
    firstVisitDate: customer.createdDate?.split('T')[0],
    noShowCount: cleanCount(customer.noShowCount),
    tags: customer.tags,
  }
}

export function mapVagaroAppointment(apt: VagaroAppointment): CanonicalAppointment {
  return {
    id: `vagaro-${apt.appointmentId}`,
    externalId: apt.appointmentId,
    platform: 'vagaro',
    locationId: apt.locationId,
    clientId: apt.customerId || undefined,
    clientName: [apt.customerFirstName, apt.customerLastName].filter(Boolean).join(' ') || 'Unknown',
    serviceId: apt.serviceId,
    serviceName: cleanString(apt.serviceName),
    providerId: apt.employeeId,
    providerName: cleanString(apt.employeeName),
    date: apt.date,
    startTime: apt.startTime,
    endTime: apt.endTime,
    durationMinutes: apt.duration,
    status: mapAppointmentStatus(apt.status),
    bookingSource: mapBookingSource(apt.bookingSource),
    revenue: cleanRevenue(apt.price),
  }
}

export function mapVagaroEmployee(emp: VagaroEmployee, locationId: string): CanonicalProvider {
  return {
    id: `vagaro-${emp.employeeId}`,
    externalId: emp.employeeId,
    platform: 'vagaro',
    locationId,
    firstName: cleanString(emp.firstName),
    lastName: cleanString(emp.lastName),
    displayName: cleanString(emp.displayName),
    role: emp.role || emp.accessLevel,
    isActive: emp.isActive,
    email: emp.email || undefined,
    phone: emp.phone || undefined,
  }
}

export function mapVagaroTransaction(txn: VagaroTransaction): CanonicalInvoice {
  return {
    id: `vagaro-${txn.transactionId}`,
    externalId: txn.transactionId,
    platform: 'vagaro',
    locationId: txn.locationId,
    clientId: txn.customerId || undefined,
    appointmentId: txn.appointmentId || undefined,
    date: txn.date,
    items: txn.items.map((item) => ({
      id: item.itemId,
      type: item.type === 'Service' ? 'service'
        : item.type === 'Product' ? 'product'
        : item.type === 'GiftCard' ? 'gift_card'
        : item.type === 'Package' ? 'package'
        : item.type === 'Membership' ? 'membership'
        : 'other',
      name: item.name,
      quantity: cleanCount(item.quantity),
      unitPrice: cleanRevenue(item.price),
      totalPrice: cleanRevenue(item.total),
    })),
    subtotal: cleanRevenue(txn.subtotal),
    tax: cleanRevenue(txn.tax),
    discount: cleanRevenue(txn.discount),
    total: cleanRevenue(txn.total),
    status: txn.status === 'Completed' ? 'paid' : txn.status === 'Refunded' ? 'refunded' : 'void',
    paymentMethod: txn.paymentMethod === 'CreditCard' ? 'credit_card'
      : txn.paymentMethod === 'Cash' ? 'cash'
      : txn.paymentMethod === 'GiftCard' ? 'gift_card'
      : 'other',
  }
}
