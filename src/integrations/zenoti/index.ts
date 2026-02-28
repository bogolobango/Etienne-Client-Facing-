// ================================================================
// Zenoti Integration — Barrel Export
// ================================================================

// Client & auth
export {
  zenotiRequest,
  getAccessToken,
  clearAccessToken,
  ZenotiApiError,
  ZenotiAuthError,
  type ZenotiConfig,
} from './client'

// API endpoint methods
export {
  listCenters,
  getCenter,
  listServices,
  getService,
  searchGuests,
  getGuest,
  listGuestAppointments,
  listAppointments,
  getAppointment,
  getInvoice,
  listCollections,
  listEmployees,
  getEmployeePerformance,
  getEmployeeSales,
  getSalesReport,
  listAppointmentsAllCenters,
  getSalesReportsAllCenters,
} from './endpoints'

// Data mappers (Zenoti → EIP types)
export {
  mapCenter,
  mapCenters,
  mapService,
  mapServices,
  mapAppointment,
  mapAppointments,
  mapGuest,
  mapGuests,
  mapDailySales,
  mapSalesReport,
  mapCollection,
  mapCollections,
} from './mappers'

// React Query hooks
export {
  useLocations,
  useServices,
  useAppointments,
  useClients,
  useDailyMetrics,
  useZenotiConnectionTest,
} from './hooks'

// Types
export type * from './types'
