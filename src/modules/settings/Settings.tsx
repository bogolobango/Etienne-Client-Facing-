import { motion } from 'framer-motion'
import { User, Bell, Shield, Palette, Zap, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        <h1 className="text-2xl font-semibold text-[#F1F5F9]">Settings</h1>
        <p className="text-[#94A3B8] mt-1">Manage your account and platform configuration</p>
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
              <div className="p-2 rounded-lg bg-[#7B61FF]/[0.06]">
                <Icon className="w-4 h-4 text-[#94A3B8]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#F1F5F9]">{section.title}</h3>
                <p className="text-xs text-[#64748B]">{section.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-[#7B61FF]/[0.08] bg-[#7B61FF]/[0.03]">
                  <span className="text-sm text-[#94A3B8]">{item.label}</span>
                  {'toggle' in item ? (
                    <div className="w-10 h-5 rounded-full bg-[#7B61FF] relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform" />
                    </div>
                  ) : 'status' in item ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#7B61FF]" />
                      <span className="text-sm text-[#7B61FF]">{item.value}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[#F1F5F9]">{item.value}</span>
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
