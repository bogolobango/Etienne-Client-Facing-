import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database, CheckCircle, RefreshCw, XCircle, Loader2,
  Sparkles, Gem, Globe, Calendar, Phone, DollarSign, ArrowRight, Unplug, Plug, Building2, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useZenotiStore, maskApiKey, type ZenotiCredentials } from '@/stores/useZenotiStore'
import { useClientStore } from '@/stores/useClientStore'

const dataSyncedTags = ['Appointments', 'Guests', 'Invoices', 'Services', 'Opportunities']

const availableIntegrations = [
  { name: 'Boulevard', icon: Sparkles, description: 'Luxury salon & spa management', status: 'available' as const, color: 'text-purple-400' },
  { name: 'Mangomint', icon: Gem, description: 'Top-rated salon & spa software', status: 'available' as const, color: 'text-emerald-400' },
  { name: 'Pabau', icon: Globe, description: 'Clinic management platform', status: 'coming_soon' as const, color: 'text-blue-400' },
  { name: 'Google Calendar', icon: Calendar, description: 'Sync provider schedules', status: 'available' as const, color: 'text-yellow-400' },
  { name: 'Twilio', icon: Phone, description: 'Voice & SMS communication', status: 'available' as const, color: 'text-red-400' },
  { name: 'QuickBooks', icon: DollarSign, description: 'Accounting & financial sync', status: 'coming_soon' as const, color: 'text-green-400' },
]

export function Settings() {
  const {
    isConnected,
    credentials,
    lastSyncAt,
    centerCount,
    centerNames,
    syncStatus,
    lastError,
    connect,
    disconnect,
    setSyncStatus,
    setLastSync,
  } = useZenotiStore()

  const { clientName, setClientName } = useClientStore()
  const [editingName, setEditingName] = useState(clientName)

  // Form state for new connection
  const [showForm, setShowForm] = useState(false)
  const [baseUrl, setBaseUrl] = useState('https://api.zenoti.com')
  const [apiKey, setApiKey] = useState('')
  const [accountName, setAccountName] = useState('')
  const [testing, setTesting] = useState(false)
  const [testError, setTestError] = useState<string | null>(null)

  // Test connection and connect
  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setTestError('API key is required')
      return
    }

    setTesting(true)
    setTestError(null)

    try {
      // Test connection via the proxy
      const res = await fetch('/api/zenoti-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-zenoti-base-url': baseUrl,
          'x-zenoti-api-key': apiKey.trim(),
        },
        body: JSON.stringify({ path: '/v1/centers', method: 'GET' }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error || err.details?.errors?.[0]?.message || `Connection failed (${res.status})`)
      }

      const data = await res.json()
      const centers = data.centers ?? []

      const creds: ZenotiCredentials = {
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        maskedKey: maskApiKey(apiKey.trim()),
        accountName: accountName.trim() || 'Connected Organization',
      }

      connect(creds, centers.length, centers.map((c: { name?: string; display_name?: string }) => c.display_name || c.name || 'Unknown'))

      // Reset form
      setShowForm(false)
      setApiKey('')
      setAccountName('')
    } catch (err) {
      setTestError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setTesting(false)
    }
  }

  // Re-sync data
  const handleResync = async () => {
    if (!credentials) return
    setSyncStatus('syncing')

    try {
      const res = await fetch('/api/zenoti-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-zenoti-base-url': credentials.baseUrl,
          'x-zenoti-api-key': credentials.apiKey,
        },
        body: JSON.stringify({ path: '/v1/centers', method: 'GET' }),
      })

      if (!res.ok) throw new Error('Sync failed')

      const data = await res.json()
      setLastSync(new Date().toISOString(), data.centers?.length ?? centerCount)
    } catch (err) {
      setSyncStatus('error', err instanceof Error ? err.message : 'Sync failed')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowForm(false)
  }

  const timeSinceSync = lastSyncAt
    ? formatTimeSince(lastSyncAt)
    : 'Never'

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-1">Manage data connections and platform integrations</p>
      </div>

      {/* Client Configuration */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Client Configuration
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-4 sm:p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Practice Name</h3>
              <p className="text-sm text-muted-foreground">This name appears in all reports and the AI Analyst</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="e.g. Skinney MedSpa"
              className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
            <button
              onClick={() => { if (editingName.trim()) setClientName(editingName.trim()) }}
              disabled={editingName.trim() === clientName}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
            >
              Save
            </button>
          </div>
        </motion.div>
      </div>

      {/* Zenoti Connection Card */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {isConnected ? 'Connected' : 'Practice Management System'}
        </h2>

        {isConnected && credentials ? (
          /* ── Connected State ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-4 sm:p-6 border-primary/20"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">Zenoti</h3>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                      <CheckCircle className="w-3 h-3" /> Connected
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">Practice management — real-time data sync</p>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Organization</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{credentials.accountName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Centers</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{centerCount} synced</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Last Sync <RefreshCw className={cn('w-2.5 h-2.5', syncStatus === 'syncing' && 'animate-spin')} />
                </p>
                <p className="text-sm font-medium text-foreground mt-0.5">{timeSinceSync}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Locations</p>
                <div className="text-sm font-medium text-foreground mt-0.5">
                  {centerNames.length > 0 ? centerNames.slice(0, 3).join(', ') : `${centerCount} centers`}
                  {centerNames.length > 3 && ` +${centerNames.length - 3} more`}
                </div>
              </div>
            </div>

            {/* Data Synced tags */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Data Synced</p>
              <div className="flex flex-wrap gap-2">
                {dataSyncedTags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* API Key row */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">API Key</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border font-mono text-sm text-muted-foreground">
                  {credentials.maskedKey}
                </div>
              </div>
            </div>

            {/* Error display */}
            {lastError && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                {lastError}
              </div>
            )}

            {/* Bottom action buttons */}
            <div className="flex items-center gap-2 sm:gap-3 mt-5 pt-4 border-t border-border flex-wrap">
              <button
                onClick={handleResync}
                disabled={syncStatus === 'syncing'}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', syncStatus === 'syncing' && 'animate-spin')} />
                {syncStatus === 'syncing' ? 'Syncing...' : 'Re-sync Now'}
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
              >
                <Unplug className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── Disconnected State — Show connect form ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-4 sm:p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-muted border border-border">
                <Database className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Zenoti</h3>
                <p className="text-sm text-muted-foreground">Connect your Zenoti account to sync real client data</p>
              </div>
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plug className="w-3.5 h-3.5" />
                Connect Zenoti
              </button>
            ) : (
              <div className="space-y-4 mt-4 pt-4 border-t border-border">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    API Key <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Zenoti API key"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Found in Zenoti Admin &gt; Setup &gt; API Keys
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Skinney MedSpa"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.zenoti.com"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default works for US data centers. Change for EU/AU.
                  </p>
                </div>

                {testError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    {testError}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleConnect}
                    disabled={testing || !apiKey.trim()}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Plug className="w-3.5 h-3.5" />
                        Test & Connect
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setTestError(null) }}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Available Integrations */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Available Integrations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {availableIntegrations.map((integration, i) => {
            const Icon = integration.icon
            return (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card-premium p-5 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('p-2 rounded-lg bg-primary/[0.06] border border-border')}>
                    <Icon className={cn('w-5 h-5', integration.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-border">
                  {integration.status === 'available' ? (
                    <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                      Connect <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={() => { sessionStorage.removeItem('eip-auth'); window.location.reload() }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────

function formatTimeSince(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}
