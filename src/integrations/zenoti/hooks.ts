// ================================================================
// React Query Hooks — Zenoti data, mapped to EIP domain types
//
// Each hook returns EIP‑typed data and falls back to seed data
// when the Zenoti connection is inactive, so the dashboard works
// identically in demo mode and live mode.
// ================================================================

import { useQuery } from '@tanstack/react-query'
import { useZenotiStore } from '@/stores/useZenotiStore'

// Zenoti API
import * as api from './endpoints'

// Mappers
import {
  mapCenters,
  mapServices,
  mapAppointments,
  mapGuests,
  mapSalesReport,
} from './mappers'

// Seed data (demo fallback)
import {
  locations as seedLocations,
  services as seedServices,
  appointments as seedAppointments,
  clients as seedClients,
  dailyMetrics as seedDailyMetrics,
} from '@/data/seed'

// EIP types
import type {
  Location,
  Service,
  Appointment,
  Client,
  DailyMetrics,
} from '@/types'

// ── Date helpers ────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// ── Stale times ─────────────────────────────────────────────────

/** Centers rarely change — cache for 30 min */
const STALE_LONG = 30 * 60 * 1000
/** Appointments / metrics — cache for 5 min */
const STALE_MEDIUM = 5 * 60 * 1000
/** Clients — cache for 10 min */
const STALE_SHORT = 10 * 60 * 1000

// ── Locations (Centers) ─────────────────────────────────────────

export function useLocations() {
  const connected = useZenotiStore((s) => s.isConnected)

  return useQuery<Location[]>({
    queryKey: ['zenoti', 'locations'],
    queryFn: async () => {
      const raw = await api.listCenters()
      return mapCenters(raw)
    },
    enabled: connected,
    staleTime: STALE_LONG,
    placeholderData: seedLocations,
  })
}

// ── Services ────────────────────────────────────────────────────

export function useServices(centerId?: string) {
  const connected = useZenotiStore((s) => s.isConnected)

  return useQuery<Service[]>({
    queryKey: ['zenoti', 'services', centerId],
    queryFn: async () => {
      if (!centerId) return seedServices
      const raw = await api.listServices(centerId)
      return mapServices(raw)
    },
    enabled: connected && !!centerId,
    staleTime: STALE_LONG,
    placeholderData: seedServices,
  })
}

// ── Appointments ────────────────────────────────────────────────

export interface UseAppointmentsOpts {
  centerId?: string
  /** Number of days back from today. Default = 30 */
  daysBack?: number
}

export function useAppointments(opts: UseAppointmentsOpts = {}) {
  const connected = useZenotiStore((s) => s.isConnected)
  const { centerId, daysBack = 30 } = opts
  const startDate = daysAgoISO(daysBack)
  const endDate = todayISO()

  return useQuery<Appointment[]>({
    queryKey: ['zenoti', 'appointments', centerId ?? 'all', startDate],
    queryFn: async () => {
      const raw = centerId
        ? await api.listAppointments({ centerId, startDate, endDate })
        : await api.listAppointmentsAllCenters(startDate, endDate)
      return mapAppointments(raw)
    },
    enabled: connected,
    staleTime: STALE_MEDIUM,
    placeholderData: seedAppointments,
  })
}

// ── Clients (Guests) ────────────────────────────────────────────

export function useClients(centerId?: string) {
  const connected = useZenotiStore((s) => s.isConnected)

  return useQuery<Client[]>({
    queryKey: ['zenoti', 'clients', centerId ?? 'all'],
    queryFn: async () => {
      if (!centerId) return seedClients
      const raw = await api.searchGuests({ centerId, size: 200 })
      return mapGuests(raw)
    },
    enabled: connected && !!centerId,
    staleTime: STALE_SHORT,
    placeholderData: seedClients,
  })
}

// ── Daily Metrics (Sales Reports) ───────────────────────────────

export interface UseDailyMetricsOpts {
  centerId?: string
  /** Number of days back from today. Default = 30 */
  daysBack?: number
}

export function useDailyMetrics(opts: UseDailyMetricsOpts = {}) {
  const connected = useZenotiStore((s) => s.isConnected)
  const { centerId, daysBack = 30 } = opts
  const startDate = daysAgoISO(daysBack)
  const endDate = todayISO()

  return useQuery<DailyMetrics[]>({
    queryKey: ['zenoti', 'dailyMetrics', centerId ?? 'all', startDate],
    queryFn: async () => {
      if (centerId) {
        const report = await api.getSalesReport({
          centerId,
          startDate,
          endDate,
        })
        return mapSalesReport(report)
      }
      // All centers — aggregate
      const reports = await api.getSalesReportsAllCenters(startDate, endDate)
      return reports.flatMap(mapSalesReport)
    },
    enabled: connected,
    staleTime: STALE_MEDIUM,
    placeholderData: seedDailyMetrics,
  })
}

// ── Connection test ─────────────────────────────────────────────

/**
 * Lightweight query that just hits /v1/centers to verify
 * the Zenoti credentials are valid. Used by the Settings page
 * "Test Connection" button.
 */
export function useZenotiConnectionTest() {
  return useQuery({
    queryKey: ['zenoti', 'connectionTest'],
    queryFn: async () => {
      const centers = await api.listCenters()
      return {
        success: true,
        centerCount: centers.length,
        centerNames: centers.map((c) => c.name),
      }
    },
    enabled: false, // Only run when explicitly refetched
    retry: false,
  })
}
