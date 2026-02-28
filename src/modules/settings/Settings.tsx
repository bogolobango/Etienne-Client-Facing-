import { motion } from 'framer-motion'
import { User, Bell, Zap, Globe } from 'lucide-react'

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
    {
      icon: Globe,
      title: 'Integrations',
      description: 'Connected services and API keys',
      items: [
        { label: 'Phone System', value: 'Connected', status: 'online' },
        { label: 'SMS Provider', value: 'Connected', status: 'online' },
        { label: 'Calendar Sync', value: 'Connected', status: 'online' },
        { label: 'Payment Processor', value: 'Connected', status: 'online' },
      ],
    },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and platform configuration</p>
      </div>

      {sections.map((section, i) => {
        const Icon = section.icon
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
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
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-border bg-primary/[0.03]">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  {'toggle' in item ? (
                    <div className="w-10 h-5 rounded-full bg-primary relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-primary-foreground transition-transform" />
                    </div>
                  ) : 'status' in item ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-primary">{item.value}</span>
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
