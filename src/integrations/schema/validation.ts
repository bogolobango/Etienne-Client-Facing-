// ============================================================================
// Data Validation & Cleansing Utilities
// Runs on all ingested data regardless of source platform.
// ============================================================================

import type {
  CanonicalAppointment,
  CanonicalClient,
  CanonicalDailyMetrics,
  CanonicalInvoice,
  CanonicalLocation,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from './canonical'

// ---------------------------------------------------------------------------
// Cleansing Primitives
// ---------------------------------------------------------------------------

export function cleanRevenue(value: unknown): number {
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(num) || num < 0) return 0
  if (num > 500_000) return 500_000 // daily cap sanity check
  return Math.round(num * 100) / 100
}

export function cleanPercent(value: unknown): number {
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(num)) return 0
  return Math.min(100, Math.max(0, Math.round(num * 100) / 100))
}

export function cleanCount(value: unknown): number {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10)
  if (isNaN(num) || num < 0) return 0
  return Math.floor(num)
}

export function cleanString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

export function isValidDate(value: string): boolean {
  const d = new Date(value)
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(value)
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

// ---------------------------------------------------------------------------
// Record-Level Validators
// ---------------------------------------------------------------------------

function validateLocation(loc: CanonicalLocation): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!loc.name) errors.push({ field: 'name', message: 'Location name is required', record: loc.id })
  if (!loc.externalId) errors.push({ field: 'externalId', message: 'External ID is required', record: loc.id })

  if (loc.email && !isValidEmail(loc.email)) {
    warnings.push({ field: 'email', message: 'Invalid email format', value: loc.email, record: loc.id })
  }
  if (loc.phone && !isValidPhone(loc.phone)) {
    warnings.push({ field: 'phone', message: 'Invalid phone format', value: loc.phone, record: loc.id })
  }

  return { errors, warnings }
}

function validateAppointment(apt: CanonicalAppointment): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!apt.locationId) errors.push({ field: 'locationId', message: 'Location ID is required', record: apt.id })
  if (!apt.date || !isValidDate(apt.date)) errors.push({ field: 'date', message: 'Valid date is required', value: apt.date, record: apt.id })
  if (!apt.clientName) warnings.push({ field: 'clientName', message: 'Client name is missing', record: apt.id })
  if (!apt.serviceName) warnings.push({ field: 'serviceName', message: 'Service name is missing', record: apt.id })

  if (apt.revenue < 0) errors.push({ field: 'revenue', message: 'Revenue cannot be negative', value: apt.revenue, record: apt.id })
  if (apt.revenue > 50_000) warnings.push({ field: 'revenue', message: 'Unusually high revenue for single appointment', value: apt.revenue, record: apt.id })

  if (apt.durationMinutes <= 0 || apt.durationMinutes > 480) {
    warnings.push({ field: 'durationMinutes', message: 'Duration outside expected range (1-480 min)', value: apt.durationMinutes, record: apt.id })
  }

  return { errors, warnings }
}

function validateClient(client: CanonicalClient): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!client.firstName && !client.lastName) {
    errors.push({ field: 'name', message: 'Client must have at least a first or last name', record: client.id })
  }
  if (client.email && !isValidEmail(client.email)) {
    warnings.push({ field: 'email', message: 'Invalid email format', value: client.email, record: client.id })
  }
  if (client.lifetimeValue < 0) {
    errors.push({ field: 'lifetimeValue', message: 'Lifetime value cannot be negative', value: client.lifetimeValue, record: client.id })
  }
  if (client.lifetimeValue > 1_000_000) {
    warnings.push({ field: 'lifetimeValue', message: 'Unusually high lifetime value', value: client.lifetimeValue, record: client.id })
  }

  return { errors, warnings }
}

function validateDailyMetrics(dm: CanonicalDailyMetrics): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!dm.date || !isValidDate(dm.date)) {
    errors.push({ field: 'date', message: 'Valid date is required', value: dm.date })
  }
  if (!dm.locationId) {
    errors.push({ field: 'locationId', message: 'Location ID is required' })
  }
  if (dm.revenue < 0) {
    errors.push({ field: 'revenue', message: 'Revenue cannot be negative', value: dm.revenue })
  }
  if (dm.noShowRate > 100 || dm.noShowRate < 0) {
    errors.push({ field: 'noShowRate', message: 'No-show rate must be 0-100', value: dm.noShowRate })
  }
  if (dm.utilizationRate > 100 || dm.utilizationRate < 0) {
    errors.push({ field: 'utilizationRate', message: 'Utilization rate must be 0-100', value: dm.utilizationRate })
  }

  // Anomaly detection
  if (dm.revenue > 200_000) {
    warnings.push({ field: 'revenue', message: 'Unusually high daily revenue — verify data', value: dm.revenue })
  }
  if (dm.noShowRate > 50) {
    warnings.push({ field: 'noShowRate', message: 'No-show rate above 50% is unusual', value: dm.noShowRate })
  }
  if (dm.bookings > 200) {
    warnings.push({ field: 'bookings', message: 'Unusually high daily booking count', value: dm.bookings })
  }

  return { errors, warnings }
}

function validateInvoice(inv: CanonicalInvoice): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!inv.date || !isValidDate(inv.date)) {
    errors.push({ field: 'date', message: 'Valid date is required', value: inv.date, record: inv.id })
  }
  if (!inv.locationId) {
    errors.push({ field: 'locationId', message: 'Location ID is required', record: inv.id })
  }
  if (inv.total < 0) {
    errors.push({ field: 'total', message: 'Invoice total cannot be negative', value: inv.total, record: inv.id })
  }

  const itemTotal = inv.items.reduce((s, i) => s + i.totalPrice, 0)
  const expectedTotal = itemTotal - inv.discount + inv.tax
  if (Math.abs(inv.total - expectedTotal) > 1) {
    warnings.push({ field: 'total', message: `Invoice total ($${inv.total}) doesn't match items ($${expectedTotal.toFixed(2)})`, record: inv.id })
  }

  return { errors, warnings }
}

// ---------------------------------------------------------------------------
// Batch Validation
// ---------------------------------------------------------------------------

export interface DataBatch {
  locations?: CanonicalLocation[]
  appointments?: CanonicalAppointment[]
  clients?: CanonicalClient[]
  dailyMetrics?: CanonicalDailyMetrics[]
  invoices?: CanonicalInvoice[]
}

export function validateBatch(batch: DataBatch): ValidationResult {
  const allErrors: ValidationError[] = []
  const allWarnings: ValidationWarning[] = []
  let totalRecords = 0

  if (batch.locations) {
    totalRecords += batch.locations.length
    for (const loc of batch.locations) {
      const { errors, warnings } = validateLocation(loc)
      allErrors.push(...errors)
      allWarnings.push(...warnings)
    }
  }

  if (batch.appointments) {
    totalRecords += batch.appointments.length
    for (const apt of batch.appointments) {
      const { errors, warnings } = validateAppointment(apt)
      allErrors.push(...errors)
      allWarnings.push(...warnings)
    }
    // Cross-record: check for duplicate appointments
    const seen = new Set<string>()
    for (const apt of batch.appointments) {
      const key = `${apt.locationId}|${apt.date}|${apt.startTime}|${apt.clientName}`
      if (seen.has(key)) {
        allWarnings.push({ field: 'id', message: 'Possible duplicate appointment', record: apt.id })
      }
      seen.add(key)
    }
  }

  if (batch.clients) {
    totalRecords += batch.clients.length
    for (const client of batch.clients) {
      const { errors, warnings } = validateClient(client)
      allErrors.push(...errors)
      allWarnings.push(...warnings)
    }
  }

  if (batch.dailyMetrics) {
    totalRecords += batch.dailyMetrics.length
    for (const dm of batch.dailyMetrics) {
      const { errors, warnings } = validateDailyMetrics(dm)
      allErrors.push(...errors)
      allWarnings.push(...warnings)
    }
  }

  if (batch.invoices) {
    totalRecords += batch.invoices.length
    for (const inv of batch.invoices) {
      const { errors, warnings } = validateInvoice(inv)
      allErrors.push(...errors)
      allWarnings.push(...warnings)
    }
  }

  // Quality score: 100 - (errors * 5) - (warnings * 1), floored at 0
  const qualityScore = Math.max(0, Math.min(100,
    totalRecords === 0 ? 0 : 100 - (allErrors.length / totalRecords * 50) - (allWarnings.length / totalRecords * 10)
  ))

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    qualityScore: Math.round(qualityScore),
  }
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

export function deduplicateAppointments(appointments: CanonicalAppointment[]): CanonicalAppointment[] {
  const seen = new Map<string, CanonicalAppointment>()
  for (const apt of appointments) {
    const key = apt.externalId || `${apt.locationId}|${apt.date}|${apt.startTime}|${apt.clientName}|${apt.serviceName}`
    const existing = seen.get(key)
    // Keep the most recent / most complete record
    if (!existing || (apt.status === 'completed' && existing.status !== 'completed')) {
      seen.set(key, apt)
    }
  }
  return Array.from(seen.values())
}

export function deduplicateClients(clients: CanonicalClient[]): CanonicalClient[] {
  const seen = new Map<string, CanonicalClient>()
  for (const client of clients) {
    const key = client.externalId || `${client.email || ''}|${client.firstName}|${client.lastName}`
    const existing = seen.get(key)
    if (!existing || client.totalVisits > existing.totalVisits) {
      seen.set(key, client)
    }
  }
  return Array.from(seen.values())
}
