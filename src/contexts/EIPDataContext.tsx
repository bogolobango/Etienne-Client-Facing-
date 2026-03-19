// ================================================================
// EIP Data Provider — single source of truth for all dashboard data.
//
// When Zenoti is connected, data comes from React Query hooks that
// call the Zenoti API via /api/zenoti-proxy. When disconnected,
// seed data is returned so the dashboard works in demo mode.
//
// Usage: replace `import { X } from '@/data/seed'` with
//        `const { X } = useEIPData()`
// ================================================================

import { createContext, useContext, type ReactNode } from 'react'
import { useZenotiStore } from '@/stores/useZenotiStore'
import {
  useLocations,
  useAppointments,
  useDailyMetrics,
  useClients,
} from '@/integrations/zenoti/hooks'

// Seed data — always available as fallback
import {
  locations as seedLocations,
  services as seedServices,
  agentStatuses as seedAgentStatuses,
  conversations as seedConversations,
  appointments as seedAppointments,
  dailyMetrics as seedDailyMetrics,
  clients as seedClients,
  alerts as seedAlerts,
  opportunities as seedOpportunities,
} from '@/data/seed'

import type {
  Location,
  Service,
  AgentStatus,
  Conversation,
  Appointment,
  DailyMetrics,
  Client,
  Alert,
  Opportunity,
} from '@/types'

// ── Context shape ───────────────────────────────────────────────

export interface EIPData {
  locations: Location[]
  services: Service[]
  agentStatuses: AgentStatus[]
  conversations: Conversation[]
  appointments: Appointment[]
  dailyMetrics: DailyMetrics[]
  clients: Client[]
  alerts: Alert[]
  opportunities: Opportunity[]
  /** True when at least one query is loading live data */
  isLoading: boolean
  /** True when connected to a real PMS */
  isLive: boolean
}

const defaultData: EIPData = {
  locations: seedLocations,
  services: seedServices,
  agentStatuses: seedAgentStatuses,
  conversations: seedConversations,
  appointments: seedAppointments,
  dailyMetrics: seedDailyMetrics,
  clients: seedClients,
  alerts: seedAlerts,
  opportunities: seedOpportunities,
  isLoading: false,
  isLive: false,
}

const EIPDataContext = createContext<EIPData>(defaultData)

// ── Provider ────────────────────────────────────────────────────

export function EIPDataProvider({ children }: { children: ReactNode }) {
  const isConnected = useZenotiStore((s) => s.isConnected)

  // These hooks return seed data via placeholderData when not connected
  const locationsQuery = useLocations()
  const appointmentsQuery = useAppointments({ daysBack: 30 })
  const metricsQuery = useDailyMetrics({ daysBack: 30 })
  const clientsQuery = useClients()

  const isLoading =
    isConnected &&
    (locationsQuery.isLoading ||
      appointmentsQuery.isLoading ||
      metricsQuery.isLoading ||
      clientsQuery.isLoading)

  const value: EIPData = {
    locations: locationsQuery.data ?? seedLocations,
    services: seedServices, // Zenoti services hook needs centerId — use seed for now
    agentStatuses: seedAgentStatuses, // EIP-internal, not from PMS
    conversations: seedConversations, // EIP-internal, not from PMS
    appointments: appointmentsQuery.data ?? seedAppointments,
    dailyMetrics: metricsQuery.data ?? seedDailyMetrics,
    clients: clientsQuery.data ?? seedClients,
    alerts: seedAlerts, // EIP-generated, not from PMS
    opportunities: seedOpportunities, // EIP-generated, not from PMS
    isLoading,
    isLive: isConnected,
  }

  return (
    <EIPDataContext.Provider value={value}>
      {children}
    </EIPDataContext.Provider>
  )
}

// ── Hook ────────────────────────────────────────────────────────

export function useEIPData(): EIPData {
  return useContext(EIPDataContext)
}
