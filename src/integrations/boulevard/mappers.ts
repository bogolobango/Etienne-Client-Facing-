// ============================================================================
// Boulevard → Canonical Mappers
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
  BlvdAppointment,
  BlvdClient,
  BlvdLocation,
  BlvdOrder,
  BlvdService,
  BlvdStaff,
} from './types'

// Boulevard uses minor units (cents) — divide by 100 for dollars
function fromCents(cents: number): number {
  return cleanRevenue(cents / 100)
}

function mapAppointmentStatus(state: string): AppointmentStatus {
  const mapping: Record<string, AppointmentStatus> = {
    BOOKED: 'booked',
    CONFIRMED: 'confirmed',
    ARRIVED: 'checked_in',
    STARTED: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  }
  return mapping[state] || 'booked'
}

function mapBookingSource(bookedBy?: string): BookingSource {
  const mapping: Record<string, BookingSource> = {
    Client: 'online',
    Staff: 'staff',
    API: 'api',
  }
  return bookedBy ? mapping[bookedBy] || 'unknown' : 'unknown'
}

function inferServiceCategory(name: string, categoryName?: string): ServiceCategory {
  const lower = (categoryName || name).toLowerCase()
  if (/botox|filler|inject|neuro/i.test(lower)) return 'injectable'
  if (/laser|ipl|resurfac/i.test(lower)) return 'laser'
  if (/body|contour|sculpt|coolsculpt/i.test(lower)) return 'body'
  if (/facial|hydra|peel|micro/i.test(lower)) return 'facial'
  if (/skin|derm/i.test(lower)) return 'skin'
  if (/massage/i.test(lower)) return 'massage'
  if (/hair/i.test(lower)) return 'hair'
  if (/nail|mani|pedi/i.test(lower)) return 'nail'
  if (/wellness|iv|vitamin/i.test(lower)) return 'wellness'
  return 'other'
}

export function mapBlvdLocation(loc: BlvdLocation): CanonicalLocation {
  return {
    id: `blvd-${loc.id}`,
    externalId: loc.id,
    platform: 'boulevard',
    name: cleanString(loc.name),
    address: [loc.address.line1, loc.address.line2].filter(Boolean).join(', '),
    city: loc.address.city || undefined,
    state: loc.address.state || undefined,
    zip: loc.address.zip || undefined,
    phone: loc.businessPhone || undefined,
    email: loc.contactEmail || undefined,
    isActive: loc.isActive,
  }
}

export function mapBlvdService(svc: BlvdService, locationId: string): CanonicalService {
  const pricing = svc.pricingOptions[0]
  return {
    id: `blvd-${svc.id}`,
    externalId: svc.id,
    platform: 'boulevard',
    locationId,
    name: cleanString(svc.name),
    category: inferServiceCategory(svc.name, svc.category?.name),
    price: pricing ? fromCents(pricing.price) : 0,
    duration: svc.duration || pricing?.duration || 60,
    isActive: svc.isActive,
  }
}

export function mapBlvdClient(client: BlvdClient): CanonicalClient {
  return {
    id: `blvd-${client.id}`,
    externalId: client.id,
    platform: 'boulevard',
    firstName: cleanString(client.firstName),
    lastName: cleanString(client.lastName),
    email: client.email || undefined,
    phone: client.mobilePhone || client.homePhone || undefined,
    totalVisits: 0, // Boulevard doesn't expose this directly; enriched later
    lifetimeValue: 0, // enriched from orders
    noShowCount: 0, // enriched from appointments
    tags: client.tags?.map((t) => t.name),
    firstVisitDate: client.createdAt?.split('T')[0],
  }
}

export function mapBlvdAppointment(apt: BlvdAppointment): CanonicalAppointment {
  const startDate = new Date(apt.startAt)
  const endDate = new Date(apt.endAt)
  const firstService = apt.appointmentServices[0]
  const totalRevenue = apt.appointmentServices.reduce((s, svc) => s + svc.price, 0)

  return {
    id: `blvd-${apt.id}`,
    externalId: apt.id,
    platform: 'boulevard',
    locationId: apt.locationId,
    clientId: apt.clientId || undefined,
    clientName: apt.client ? `${apt.client.firstName} ${apt.client.lastName}`.trim() : 'Unknown',
    serviceId: firstService?.serviceId,
    serviceName: firstService?.serviceName || 'Unknown',
    providerId: firstService?.staffId,
    providerName: firstService?.staffName || 'Unknown',
    date: startDate.toISOString().split('T')[0],
    startTime: startDate.toTimeString().slice(0, 5),
    endTime: endDate.toTimeString().slice(0, 5),
    durationMinutes: apt.duration,
    status: mapAppointmentStatus(apt.state),
    bookingSource: mapBookingSource(apt.bookedBy),
    revenue: fromCents(totalRevenue),
  }
}

export function mapBlvdStaff(staff: BlvdStaff, locationId: string): CanonicalProvider {
  return {
    id: `blvd-${staff.id}`,
    externalId: staff.id,
    platform: 'boulevard',
    locationId,
    firstName: cleanString(staff.firstName),
    lastName: cleanString(staff.lastName),
    displayName: cleanString(staff.displayName),
    role: staff.role?.name,
    isActive: staff.isActive,
    email: staff.email || undefined,
    phone: staff.mobilePhone || undefined,
  }
}

export function mapBlvdOrder(order: BlvdOrder): CanonicalInvoice {
  return {
    id: `blvd-${order.id}`,
    externalId: order.id,
    platform: 'boulevard',
    locationId: order.locationId,
    clientId: order.clientId || undefined,
    appointmentId: order.appointmentId || undefined,
    date: order.createdAt.split('T')[0],
    items: order.lineItems.map((item) => ({
      id: item.id,
      type: item.itemType === 'SERVICE' ? 'service'
        : item.itemType === 'PRODUCT' ? 'product'
        : item.itemType === 'GIFT_CARD' ? 'gift_card'
        : item.itemType === 'PACKAGE' ? 'package'
        : item.itemType === 'MEMBERSHIP' ? 'membership'
        : 'other',
      name: item.name,
      quantity: cleanCount(item.quantity),
      unitPrice: fromCents(item.unitPrice),
      totalPrice: fromCents(item.totalPrice),
      discount: item.discountAmount ? fromCents(item.discountAmount) : undefined,
    })),
    subtotal: fromCents(order.summary.subtotal),
    tax: fromCents(order.summary.taxTotal),
    discount: fromCents(order.summary.discountTotal),
    total: fromCents(order.summary.grandTotal),
    status: order.state === 'CLOSED' ? 'paid' : order.state === 'VOIDED' ? 'void' : 'open',
    paymentMethod: order.payments[0]?.method === 'CREDIT_CARD' ? 'credit_card'
      : order.payments[0]?.method === 'CASH' ? 'cash'
      : order.payments[0]?.method === 'GIFT_CARD' ? 'gift_card'
      : 'other',
  }
}
