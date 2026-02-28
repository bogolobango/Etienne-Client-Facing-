// ================================================================
// Zenoti API Endpoint Methods
// Read‑only data sync: Centers → Appointments → Guests → Invoices
// Based on https://docs.zenoti.com/reference
// ================================================================

import { zenotiRequest } from './client'
import type {
  ZenotiCentersResponse,
  ZenotiCenter,
  ZenotiServicesResponse,
  ZenotiService,
  ZenotiGuestsResponse,
  ZenotiGuest,
  ZenotiAppointmentsResponse,
  ZenotiAppointment,
  ZenotiInvoiceResponse,
  ZenotiInvoice,
  ZenotiCollectionsResponse,
  ZenotiCollection,
  ZenotiEmployeesResponse,
  ZenotiEmployee,
  ZenotiEmployeePerformanceResponse,
  ZenotiEmployeePerformance,
  ZenotiSalesReportResponse,
  ZenotiSalesReport,
} from './types'

// ── Centers ─────────────────────────────────────────────────────

/** List all centers (locations) in the organization */
export async function listCenters(): Promise<ZenotiCenter[]> {
  const res = await zenotiRequest<ZenotiCentersResponse>('/v1/centers')
  return res.centers
}

/** Get details for a single center */
export async function getCenter(centerId: string): Promise<ZenotiCenter> {
  return zenotiRequest<ZenotiCenter>(`/v1/centers/${centerId}`)
}

// ── Services ────────────────────────────────────────────────────

/** List all services offered at a specific center */
export async function listServices(
  centerId: string,
): Promise<ZenotiService[]> {
  const res = await zenotiRequest<ZenotiServicesResponse>(
    `/v1/centers/${centerId}/services`,
  )
  return res.services
}

/** Get a single service's details */
export async function getService(
  centerId: string,
  serviceId: string,
): Promise<ZenotiService> {
  return zenotiRequest<ZenotiService>(
    `/v1/centers/${centerId}/services/${serviceId}`,
  )
}

// ── Guests (Clients) ────────────────────────────────────────────

export interface GuestSearchParams {
  centerId: string
  /** Text search on name / email / phone */
  query?: string
  page?: number
  size?: number
}

/** Search guests at a center */
export async function searchGuests(
  params: GuestSearchParams,
): Promise<ZenotiGuest[]> {
  const res = await zenotiRequest<ZenotiGuestsResponse>(
    `/v1/centers/${params.centerId}/guests`,
    {
      params: {
        q: params.query,
        page: params.page ?? 1,
        size: params.size ?? 100,
      },
    },
  )
  return res.guests
}

/** Get a single guest's profile */
export async function getGuest(guestId: string): Promise<ZenotiGuest> {
  return zenotiRequest<ZenotiGuest>(`/v1/guests/${guestId}`)
}

/** List past appointments for a guest */
export async function listGuestAppointments(
  guestId: string,
  opts?: { startDate?: string; endDate?: string; page?: number; size?: number },
): Promise<ZenotiAppointment[]> {
  const res = await zenotiRequest<ZenotiAppointmentsResponse>(
    `/v1/guests/${guestId}/appointments`,
    {
      params: {
        start_date: opts?.startDate,
        end_date: opts?.endDate,
        page: opts?.page ?? 1,
        size: opts?.size ?? 100,
      },
    },
  )
  return res.appointments
}

// ── Appointments ────────────────────────────────────────────────

export interface AppointmentListParams {
  centerId: string
  startDate: string
  endDate: string
  /** Filter by status: 0=Booked, 1=Confirmed, 2=CheckedIn, 4=Completed, 10=NoShow, -1=Cancelled */
  status?: number
  page?: number
  size?: number
}

/**
 * List appointments for a center within a date range.
 * Primary endpoint for the EIP scheduling dashboard.
 */
export async function listAppointments(
  params: AppointmentListParams,
): Promise<ZenotiAppointment[]> {
  const res = await zenotiRequest<ZenotiAppointmentsResponse>(
    '/v1/appointments',
    {
      params: {
        center_id: params.centerId,
        start_date: params.startDate,
        end_date: params.endDate,
        status: params.status,
        page: params.page ?? 1,
        size: params.size ?? 200,
      },
    },
  )
  return res.appointments
}

/** Get a single appointment's full details */
export async function getAppointment(
  appointmentId: string,
): Promise<ZenotiAppointment> {
  return zenotiRequest<ZenotiAppointment>(
    `/v1/appointments/${appointmentId}`,
  )
}

// ── Invoices & Revenue ──────────────────────────────────────────

/** Retrieve full invoice details (items, payments, taxes) */
export async function getInvoice(invoiceId: string): Promise<ZenotiInvoice> {
  const res = await zenotiRequest<ZenotiInvoiceResponse>(
    `/v1/invoices/${invoiceId}`,
    {
      params: {
        // Request expanded data: items + payments
        expand: 'InvoiceItems,Transactions',
      },
    },
  )
  return res.invoice
}

export interface CollectionsParams {
  centerId: string
  startDate: string
  endDate: string
}

/** Revenue collections for a center over a date range */
export async function listCollections(
  params: CollectionsParams,
): Promise<ZenotiCollection[]> {
  const res = await zenotiRequest<ZenotiCollectionsResponse>(
    `/v1/collections/center/${params.centerId}`,
    {
      params: {
        start_date: params.startDate,
        end_date: params.endDate,
      },
    },
  )
  return res.collections
}

// ── Employees / Providers ───────────────────────────────────────

/** List employees at a center */
export async function listEmployees(
  centerId: string,
  opts?: { page?: number; size?: number },
): Promise<ZenotiEmployee[]> {
  const res = await zenotiRequest<ZenotiEmployeesResponse>(
    `/v1/centers/${centerId}/employees`,
    {
      params: {
        page: opts?.page ?? 1,
        size: opts?.size ?? 100,
      },
    },
  )
  return res.employees
}

/** Get employee performance metrics for a date range */
export async function getEmployeePerformance(
  centerId: string,
  startDate: string,
  endDate: string,
): Promise<ZenotiEmployeePerformance[]> {
  const res = await zenotiRequest<ZenotiEmployeePerformanceResponse>(
    '/v1/employees/performance',
    {
      params: {
        center_id: centerId,
        start_date: startDate,
        end_date: endDate,
      },
    },
  )
  return res.performance
}

/** Get employee sales data */
export async function getEmployeeSales(
  centerId: string,
  startDate: string,
  endDate: string,
): Promise<ZenotiEmployeePerformance[]> {
  const res = await zenotiRequest<ZenotiEmployeePerformanceResponse>(
    '/v1/employees/sales',
    {
      params: {
        center_id: centerId,
        start_date: startDate,
        end_date: endDate,
      },
    },
  )
  return res.performance
}

// ── Sales Reports ───────────────────────────────────────────────

export interface SalesReportParams {
  centerId: string
  startDate: string
  endDate: string
}

/**
 * Aggregated sales report for a center.
 * Powers the EIP Revenue Scorecard and DailyMetrics.
 */
export async function getSalesReport(
  params: SalesReportParams,
): Promise<ZenotiSalesReport> {
  const res = await zenotiRequest<ZenotiSalesReportResponse>(
    '/v2/sales/salesreport',
    {
      params: {
        center_id: params.centerId,
        start_date: params.startDate,
        end_date: params.endDate,
      },
    },
  )
  return res.report
}

// ── Bulk fetch helpers ──────────────────────────────────────────

/**
 * Fetch appointments across ALL centers for a date range.
 * Used by the EIP dashboard when locationFilter === 'all'.
 */
export async function listAppointmentsAllCenters(
  startDate: string,
  endDate: string,
): Promise<ZenotiAppointment[]> {
  const centers = await listCenters()
  const results = await Promise.all(
    centers.map((c) =>
      listAppointments({ centerId: c.id, startDate, endDate }),
    ),
  )
  return results.flat()
}

/**
 * Fetch daily sales reports across ALL centers for a date range.
 * Powers the "all locations" aggregate view in the dashboard.
 */
export async function getSalesReportsAllCenters(
  startDate: string,
  endDate: string,
): Promise<ZenotiSalesReport[]> {
  const centers = await listCenters()
  const results = await Promise.all(
    centers.map((c) =>
      getSalesReport({ centerId: c.id, startDate, endDate }),
    ),
  )
  return results
}
