import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, CheckCircle, RefreshCw, Copy, Sparkles, Gem, Globe, Calendar, Phone, DollarSign, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-1">Manage data connections and platform integrations</p>
      </div>

      {/* Connected — Zenoti Card */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Connected</h2>
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
                <p className="text-sm text-muted-foreground mt-0.5">Practice management — real-time bi-directional sync</p>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Organization</p>
              <p className="text-sm font-medium text-foreground mt-0.5">Etienne Intelligence</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Centers</p>
              <p className="text-sm font-medium text-foreground mt-0.5">5 of 5 synced</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">Last Sync <RefreshCw className="w-2.5 h-2.5" /></p>
              <p className="text-sm font-medium text-foreground mt-0.5">2 minutes ago</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Records</p>
              <p className="text-sm font-medium text-foreground mt-0.5">24,847 total</p>
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
                zenoti_key_••••_••••_glow
              </div>
              <button
                className="px-3 py-2 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                Rotate
              </button>
              <button
                onClick={handleCopy}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Bottom action buttons */}
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
            <button className="px-4 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              Re-sync Now
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
              Disconnect
            </button>
          </div>
        </motion.div>
      </div>

      {/* Available Integrations */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  )
}
