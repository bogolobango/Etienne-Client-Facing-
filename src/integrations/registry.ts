// ============================================================================
// Integration Registry — Central hub for all PMS platform integrations
// ============================================================================

import { PLATFORM_CONFIGS, type PlatformType, type PlatformConfig } from './schema/canonical'

// Re-export everything for convenience
export { PLATFORM_CONFIGS } from './schema/canonical'
export type { PlatformType, PlatformConfig } from './schema/canonical'

// ---------------------------------------------------------------------------
// Platform metadata for UI rendering
// ---------------------------------------------------------------------------
export interface PlatformUIConfig {
  platform: PlatformType
  displayName: string
  description: string
  logo: string // path or URL to logo
  color: string // brand color hex
  tier: 'free' | 'paid' | 'enterprise'
  setupComplexity: 'low' | 'medium' | 'high'
  dataRefreshInterval: number // minutes
  supportedEntities: string[]
}

export const PLATFORM_UI_CONFIGS: Record<PlatformType, PlatformUIConfig> = {
  zenoti: {
    platform: 'zenoti',
    displayName: 'Zenoti',
    description: 'Enterprise salon & spa management with advanced analytics',
    logo: '/integrations/zenoti.svg',
    color: '#6366F1',
    tier: 'enterprise',
    setupComplexity: 'medium',
    dataRefreshInterval: 5,
    supportedEntities: ['locations', 'services', 'clients', 'appointments', 'invoices', 'employees', 'dailyMetrics'],
  },
  boulevard: {
    platform: 'boulevard',
    displayName: 'Boulevard',
    description: 'Intelligent scheduling & POS for salons, spas, and med spas',
    logo: '/integrations/boulevard.svg',
    color: '#000000',
    tier: 'enterprise',
    setupComplexity: 'medium',
    dataRefreshInterval: 5,
    supportedEntities: ['locations', 'services', 'clients', 'appointments', 'staff', 'orders'],
  },
  vagaro: {
    platform: 'vagaro',
    displayName: 'Vagaro',
    description: 'Beauty, fitness & wellness business management',
    logo: '/integrations/vagaro.svg',
    color: '#FF6B35',
    tier: 'paid',
    setupComplexity: 'low',
    dataRefreshInterval: 10,
    supportedEntities: ['locations', 'services', 'clients', 'appointments', 'employees', 'transactions'],
  },
  meevo: {
    platform: 'meevo',
    displayName: 'Meevo',
    description: 'Salon, spa & med spa management with Daily Data Stream',
    logo: '/integrations/meevo.svg',
    color: '#2563EB',
    tier: 'paid',
    setupComplexity: 'medium',
    dataRefreshInterval: 15,
    supportedEntities: ['locations', 'services', 'clients', 'appointments', 'employees', 'sales', 'packages', 'memberships'],
  },
  mindbody: {
    platform: 'mindbody',
    displayName: 'Mindbody',
    description: 'Health, beauty & wellness business management platform',
    logo: '/integrations/mindbody.svg',
    color: '#00B2A9',
    tier: 'paid',
    setupComplexity: 'high',
    dataRefreshInterval: 10,
    supportedEntities: ['locations', 'services', 'clients', 'appointments', 'staff', 'sales', 'contracts'],
  },
}

// ---------------------------------------------------------------------------
// Credential schemas (for settings UI form generation)
// ---------------------------------------------------------------------------
export interface CredentialField {
  key: string
  label: string
  type: 'text' | 'password' | 'url'
  placeholder: string
  required: boolean
  helpText?: string
}

export const CREDENTIAL_FIELDS: Record<PlatformType, CredentialField[]> = {
  zenoti: [
    { key: 'accountName', label: 'Account Name', type: 'text', placeholder: 'your-account', required: true, helpText: 'Found in your Zenoti URL: {account}.zenoti.com' },
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-...', required: true },
    { key: 'appId', label: 'App ID', type: 'text', placeholder: 'app-id', required: true },
    { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'secret-key', required: true },
  ],
  boulevard: [
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'blvd-...', required: true, helpText: 'From Boulevard Developer Portal' },
    { key: 'businessId', label: 'Business ID', type: 'text', placeholder: 'business-id', required: true },
  ],
  vagaro: [
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'vg-...', required: true, helpText: 'Contact Vagaro Enterprise Sales for API access' },
    { key: 'businessId', label: 'Business ID', type: 'text', placeholder: 'business-id', required: true },
  ],
  meevo: [
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'meevo-...', required: true, helpText: 'From Meevo Developer Tools' },
    { key: 'accountId', label: 'Account ID', type: 'text', placeholder: 'account-id', required: true },
  ],
  mindbody: [
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'mb-...', required: true, helpText: 'From Mindbody Developer Portal' },
    { key: 'siteId', label: 'Site ID', type: 'text', placeholder: '-99', required: true, helpText: 'Your Mindbody site ID (numeric)' },
    { key: 'username', label: 'Staff Username', type: 'text', placeholder: 'owner@example.com', required: true },
    { key: 'password', label: 'Staff Password', type: 'password', placeholder: '••••••••', required: true },
  ],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getPlatformConfig(platform: PlatformType): PlatformConfig {
  return PLATFORM_CONFIGS[platform]
}

export function getPlatformUIConfig(platform: PlatformType): PlatformUIConfig {
  return PLATFORM_UI_CONFIGS[platform]
}

export function getCredentialFields(platform: PlatformType): CredentialField[] {
  return CREDENTIAL_FIELDS[platform]
}

export function getAllPlatforms(): PlatformType[] {
  return Object.keys(PLATFORM_CONFIGS) as PlatformType[]
}

export function getSupportedPlatforms(): PlatformType[] {
  return getAllPlatforms() // All platforms have schemas; live API clients built per-platform
}
