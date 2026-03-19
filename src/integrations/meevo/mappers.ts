// ============================================================================
// Meevo → Canonical Mappers
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
  MeevoAppointment,
  MeevoClient,
  MeevoEmployee,
  MeevoLocation,
  MeevoSale,
  MeevoService,
} from './types'

function mapAppointmentStatus(status: string): AppointmentStatus {
  const mapping: Record<string, AppointmentStatus> = {
    Booked: 'booked',
    Confirmed: 'confirmed',
    CheckedIn: 'checked_in',
    InProgress: 'in_progress',
    Completed: 'completed',
    NoShow: 'no_show',
    Cancelled: 'cancelled',
  }
  return mapping[status] || 'booked'
}

function mapBookingSource(source: string): BookingSource {
  const mapping: Record<string, BookingSource> = {
    Staff: 'staff',
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

export function mapMeevoLocation(loc: MeevoLocation): CanonicalLocation {
  return {
    id: `meevo-${loc.locationId}`,
    externalId: loc.locationId,
    platform: 'meevo',
    name: cleanString(loc.locationName),
    address: loc.address ? [loc.address.street1, loc.address.street2].filter(Boolean).join(', ') : undefined,
    city: loc.address?.city || undefined,
    state: loc.address?.state || undefined,
    zip: loc.address?.zip || undefined,
    phone: loc.phone || undefined,
    email: loc.email || undefined,
    timezone: loc.timezone || undefined,
    isActive: loc.isActive,
  }
}

export function mapMeevoService(svc: MeevoService, locationId: string): CanonicalService {
  return {
    id: `meevo-${svc.serviceId}`,
    externalId: svc.serviceId,
    platform: 'meevo',
    locationId,
    name: cleanString(svc.serviceName),
    category: inferServiceCategory(svc.serviceName, svc.categoryName),
    price: cleanRevenue(svc.price),
    duration: svc.duration,
    isActive: svc.isActive,
  }
}

export function mapMeevoClient(client: MeevoClient): CanonicalClient {
  return {
    id: `meevo-${client.clientId}`,
    externalId: client.clientId,
    platform: 'meevo',
    firstName: cleanString(client.firstName),
    lastName: cleanString(client.lastName),
    email: client.email || undefined,
    phone: client.cellPhone || client.homePhone || undefined,
    totalVisits: cleanCount(client.totalVisits),
    lifetimeValue: cleanRevenue(client.totalRevenue),
    lastVisitDate: client.lastVisitDate || undefined,
    firstVisitDate: client.createdDate?.split('T')[0],
    noShowCount: cleanCount(client.noShowCount),
  }
}

export function mapMeevoAppointment(apt: MeevoAppointment): CanonicalAppointment {
  return {
    id: `meevo-${apt.appointmentId}`,
    externalId: apt.appointmentId,
    platform: 'meevo',
    locationId: apt.locationId,
    clientId: apt.clientId || undefined,
    clientName: [apt.clientFirstName, apt.clientLastName].filter(Boolean).join(' ') || 'Unknown',
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
    room: apt.roomId || undefined,
  }
}

export function mapMeevoEmployee(emp: MeevoEmployee, locationId: string): CanonicalProvider {
  return {
    id: `meevo-${emp.employeeId}`,
    externalId: emp.employeeId,
    platform: 'meevo',
    locationId,
    firstName: cleanString(emp.firstName),
    lastName: cleanString(emp.lastName),
    displayName: cleanString(emp.displayName),
    role: emp.role,
    isActive: emp.isActive,
    email: emp.email || undefined,
    phone: emp.phone || undefined,
  }
}

export function mapMeevoSale(sale: MeevoSale): CanonicalInvoice {
  return {
    id: `meevo-${sale.saleId}`,
    externalId: sale.saleId,
    platform: 'meevo',
    locationId: sale.locationId,
    clientId: sale.clientId || undefined,
    appointmentId: sale.appointmentId || undefined,
    date: sale.date,
    items: sale.items.map((item) => ({
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
      discount: item.discount ? cleanRevenue(item.discount) : undefined,
    })),
    subtotal: cleanRevenue(sale.subtotal),
    tax: cleanRevenue(sale.tax),
    discount: cleanRevenue(sale.discount),
    total: cleanRevenue(sale.total),
    status: sale.status === 'Closed' ? 'paid'
      : sale.status === 'Refunded' ? 'refunded'
      : sale.status === 'Voided' ? 'void'
      : 'open',
    paymentMethod: sale.paymentMethods[0]?.method === 'CreditCard' ? 'credit_card'
      : sale.paymentMethods[0]?.method === 'Cash' ? 'cash'
      : sale.paymentMethods[0]?.method === 'GiftCard' ? 'gift_card'
      : 'other',
  }
}
