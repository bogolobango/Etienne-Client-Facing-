import { motion } from 'framer-motion'
import { User, Bell, Zap, Globe, CheckCircle, Database, Phone, CreditCard, Calendar, MessageSquare, BarChart3, Shield } from 'lucide-react'

const integrations = [
  { name: 'Phone System', description: 'VoIP call routing & recording', icon: Phone, connected: true },
  { name: 'SMS Provider', description: 'Twilio messaging gateway', icon: MessageSquare, connected: true },
  { name: 'Calendar Sync', description: 'Google Calendar integration', icon: Calendar, connected: true },
  { name: 'Payment Processor', description: 'Stripe payment gateway', icon: CreditCard, connected: true },
  { name: 'Analytics', description: 'Google Analytics 4', icon: BarChart3, connected: false },
  { name: 'HIPAA Vault', description: 'Encrypted data storage', icon: Shield, connected: false },
]

export function Settings() {
  const sections = [
    {
      icon: User,
      title: 'Profile',
      description: 'Manage your account details and preferences',
      items: [
        { label: 'Display Name', value: 'Jordan Mitchell' },
        { label: 'Email', value: 'jordan@glowupaesthetics.com' },
        { label: 'Role', value: 'Owner / Admin' },
      ],
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Configure alert preferences and channels',
      items: [
        { label: 'Email Notifications', value: 'Enabled', toggle: true },
        { label: 'SMS Alerts', value: 'Enabled', toggle: true },
        { label: 'Critical Escalations', value: 'Enabled', toggle: true },
        { label: 'Weekly Report', value: 'Enabled', toggle: true },
      ],
    },
    {
      icon: Zap,
      title: 'AI Configuration',
      description: 'Customize AI agent behavior and responses',
      items: [
        { label: 'Auto-Respond After Hours', value: 'Enabled', toggle: true },
        { label: 'AI Booking Confidence Threshold', value: '85%' },
        { label: 'Escalation Sensitivity', value: 'Medium' },
        { label: 'No-Show Risk Threshold', value: '65%' },
      ],
    },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and platform configuration</p>
      </div>

      {/* Zenoti Connected Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-6 border-primary/20"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">Zenoti</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                  <CheckCircle className="w-3 h-3" /> Connected
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Practice management system — real-time data sync</p>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            Configure
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium text-success mt-0.5">Live</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Centers Synced</p>
            <p className="text-sm font-medium text-foreground mt-0.5">5 locations</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Records Synced</p>
            <p className="text-sm font-medium text-foreground mt-0.5">24,847</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Sync</p>
            <p className="text-sm font-medium text-foreground mt-0.5">2 minutes ago</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-primary/[0.06] border border-border">
            <p className="text-xs text-muted-foreground">Appointments</p>
            <p className="text-sm font-mono font-semibold text-primary mt-0.5">Real-time</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/[0.06] border border-border">
            <p className="text-xs text-muted-foreground">Guest Profiles</p>
            <p className="text-sm font-mono font-semibold text-primary mt-0.5">Real-time</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/[0.06] border border-border">
            <p className="text-xs text-muted-foreground">Revenue Data</p>
            <p className="text-sm font-mono font-semibold text-primary mt-0.5">Real-time</p>
          </div>
        </div>
      </motion.div>

      {/* Available Integrations Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-premium p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/[0.06]">
            <Globe className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Integrations</h3>
            <p className="text-xs text-muted-foreground">Connected services and available connections</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {integrations.map((integration) => {
            const Icon = integration.icon
            return (
              <div
                key={integration.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-primary/[0.06] transition-colors duration-200 hover:border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                {integration.connected ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-xs text-success font-medium">Active</span>
                  </div>
                ) : (
                  <button className="px-3 py-1 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                    Connect
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Existing settings sections */}
      {sections.map((section, i) => {
        const Icon = section.icon
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 2) * 0.05 }}
            className="card-premium p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/[0.06]">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-border bg-primary/[0.06] transition-colors duration-200 hover:border-primary/20">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  {'toggle' in item ? (
                    <div className="w-10 h-5 rounded-full bg-primary relative cursor-pointer transition-colors duration-200">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-primary-foreground shadow-elevation-sm transition-all duration-200" />
                    </div>
                  ) : (
                    <span className="text-sm text-foreground">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
