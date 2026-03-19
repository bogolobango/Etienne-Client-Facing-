// ============================================================================
// Mindbody → Canonical Mappers
// ============================================================================

import type {
  CanonicalAppointment,
  CanonicalClient,
  CanonicalInvoice,
  CanonicalLocation,
  CanonicalProvider,
  CanonicalService,
  AppointmentStatus,
  ServiceCategory,
} from '../schema/canonical'
import { cleanRevenue, cleanString, cleanCount } from '../schema/validation'
import type {
  MindbodyAppointment,
  MindbodyClient,
  MindbodyLocation,
  MindbodySale,
  MindbodyService,
  MindbodyStaff,
} from './types'

function mapAppointmentStatus(status: string): AppointmentStatus {
  const mapping: Record<string, AppointmentStatus> = {
    Booked: 'booked',
    Confirmed: 'confirmed',
    Arrived: 'checked_in',
    InProgress: 'in_progress',
    Completed: 'completed',
    NoShow: 'no_show',
    Cancelled: 'cancelled',
    LateCancelled: 'cancelled',
  }
  return mapping[status] || 'booked'
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
  if (/wellness|iv|vitamin|yoga|pilates|fitness/i.test(lower)) return 'wellness'
  return 'other'
}

export function mapMindbodyLocation(loc: MindbodyLocation): CanonicalLocation {
  return {
    id: `mb-${loc.Id}`,
    externalId: String(loc.Id),
    platform: 'mindbody',
    name: cleanString(loc.Name),
    address: [loc.Address, loc.Address2].filter(Boolean).join(', ') || undefined,
    city: loc.City || undefined,
    state: loc.StateProvCode || undefined,
    zip: loc.PostalCode || undefined,
    phone: loc.Phone || undefined,
    isActive: true, // Mindbody doesn't expose isActive directly
  }
}

export function mapMindbodyService(svc: MindbodyService, locationId: string): CanonicalService {
  return {
    id: `mb-${svc.Id}`,
    externalId: svc.Id,
    platform: 'mindbody',
    locationId,
    name: cleanString(svc.Name),
    category: inferServiceCategory(svc.Name, svc.Category),
    price: cleanRevenue(svc.Price),
    duration: svc.Count || 60, // Mindbody uses session count; default to 60 min
    isActive: svc.IsActive,
  }
}

export function mapMindbodyClient(client: MindbodyClient): CanonicalClient {
  return {
    id: `mb-${client.Id}`,
    externalId: client.Id,
    platform: 'mindbody',
    firstName: cleanString(client.FirstName),
    lastName: cleanString(client.LastName),
    email: client.Email || undefined,
    phone: client.MobilePhone || client.HomePhone || client.WorkPhone || undefined,
    totalVisits: 0, // Enriched from visits endpoint
    lifetimeValue: 0, // Enriched from sales
    firstVisitDate: client.FirstAppointmentDate?.split('T')[0],
    noShowCount: 0, // Enriched from visit history
    tags: client.ClientIndexes?.map((idx) => `${idx.IndexName}: ${idx.IndexValue}`),
  }
}

export function mapMindbodyAppointment(apt: MindbodyAppointment): CanonicalAppointment {
  const start = new Date(apt.StartDateTime)
  const end = new Date(apt.EndDateTime)

  return {
    id: `mb-${apt.Id}`,
    externalId: String(apt.Id),
    platform: 'mindbody',
    locationId: String(apt.LocationId),
    clientId: apt.ClientId || undefined,
    clientName: apt.Client
      ? `${apt.Client.FirstName} ${apt.Client.LastName}`.trim()
      : 'Unknown',
    serviceId: apt.ServiceId ? String(apt.ServiceId) : undefined,
    serviceName: apt.ServiceName || apt.SessionType?.Name || 'Unknown',
    providerId: String(apt.StaffId),
    providerName: apt.Staff
      ? apt.Staff.DisplayName || `${apt.Staff.FirstName} ${apt.Staff.LastName}`.trim()
      : 'Unknown',
    date: start.toISOString().split('T')[0],
    startTime: start.toTimeString().slice(0, 5),
    endTime: end.toTimeString().slice(0, 5),
    durationMinutes: apt.Duration,
    status: mapAppointmentStatus(apt.Status),
    bookingSource: apt.StaffRequested ? 'staff' : apt.FirstAppointment ? 'online' : 'unknown',
    revenue: 0, // Enriched from sales
    room: apt.Resources?.[0]?.Name || undefined,
    noShowRisk: apt.FirstAppointment ? 'medium' : 'low', // First-timers have higher risk
  }
}

export function mapMindbodyStaff(staff: MindbodyStaff, locationId: string): CanonicalProvider {
  return {
    id: `mb-${staff.Id}`,
    externalId: String(staff.Id),
    platform: 'mindbody',
    locationId,
    firstName: cleanString(staff.FirstName),
    lastName: cleanString(staff.LastName),
    displayName: cleanString(staff.DisplayName || `${staff.FirstName} ${staff.LastName}`),
    role: staff.IndependentContractor ? 'contractor' : undefined,
    isActive: staff.IsActive,
    email: staff.Email || undefined,
    phone: staff.MobilePhone || staff.HomePhone || undefined,
  }
}

export function mapMindbodySales(sales: MindbodySale[], locationId: string): CanonicalInvoice[] {
  // Group sales by SaleId (Mindbody returns individual line items)
  const grouped = new Map<number, MindbodySale[]>()
  for (const sale of sales) {
    const group = grouped.get(sale.SaleId) || []
    group.push(sale)
    grouped.set(sale.SaleId, group)
  }

  return Array.from(grouped.entries()).map(([saleId, items]) => {
    const first = items[0]
    return {
      id: `mb-${saleId}`,
      externalId: String(saleId),
      platform: 'mindbody' as const,
      locationId,
      clientId: first.ClientId || undefined,
      date: first.SaleDate.split('T')[0],
      items: items.map((item, idx) => ({
        id: `${saleId}-${idx}`,
        type: item.Type === 'Service' ? 'service' as const
          : item.Type === 'Product' ? 'product' as const
          : item.Type === 'Package' ? 'package' as const
          : item.Type === 'GiftCard' ? 'gift_card' as const
          : item.Type === 'Tip' ? 'tip' as const
          : 'other' as const,
        name: item.Description,
        quantity: cleanCount(item.Quantity),
        unitPrice: cleanRevenue(item.Amount / (item.Quantity || 1)),
        totalPrice: cleanRevenue(item.Total),
        discount: item.Discount ? cleanRevenue(item.Discount) : undefined,
      })),
      subtotal: cleanRevenue(items.reduce((s, i) => s + i.Amount, 0)),
      tax: cleanRevenue(items.reduce((s, i) => s + i.Tax, 0)),
      discount: cleanRevenue(items.reduce((s, i) => s + i.Discount, 0)),
      total: cleanRevenue(items.reduce((s, i) => s + i.Total, 0)),
      status: first.Returned ? 'refunded' as const : 'paid' as const,
      paymentMethod: 'other' as const,
    }
  })
}
