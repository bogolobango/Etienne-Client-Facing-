export * from './canonical'
export type {
  CanonicalLocation,
  CanonicalService,
  CanonicalClient,
  CanonicalAppointment,
  CanonicalProvider,
  CanonicalInvoice,
  CanonicalInvoiceItem,
  CanonicalDailyMetrics,
  CanonicalWebhookEvent,
  PlatformConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  IngestionJob,
} from './canonical'
export { PLATFORM_CONFIGS } from './canonical'
export {
  validateBatch,
  deduplicateAppointments,
  deduplicateClients,
  cleanRevenue,
  cleanPercent,
  cleanCount,
  cleanString,
  isValidDate,
  isValidEmail,
  isValidPhone,
} from './validation'
export type { DataBatch } from './validation'
