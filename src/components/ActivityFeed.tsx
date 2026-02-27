import { motion } from 'framer-motion'
import { Phone, MessageSquare, Calendar, AlertTriangle, DollarSign, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'call' | 'sms' | 'booking' | 'alert' | 'revenue' | 'web'
  message: string
  time: string
  location?: string
}

const iconMap = {
  call: Phone,
  sms: MessageSquare,
  booking: Calendar,
  alert: AlertTriangle,
  revenue: DollarSign,
  web: Globe,
}

const colorMap = {
  call: 'text-[#2D5BFF] bg-[#2D5BFF]/10',
  sms: 'text-[#00D4AA] bg-[#00D4AA]/10',
  booking: 'text-[#7B61FF] bg-[#7B61FF]/10',
  alert: 'text-[#FF8C42] bg-[#FF8C42]/10',
  revenue: 'text-[#00D4AA] bg-[#00D4AA]/10',
  web: 'text-[#2D5BFF] bg-[#2D5BFF]/10',
}

const defaultActivities: Activity[] = [
  { id: '1', type: 'call', message: 'AI answered after-hours call — booked Botox consultation', time: '2m ago', location: 'SoHo' },
  { id: '2', type: 'revenue', message: 'Revenue recovered: $850 from missed call follow-up', time: '5m ago', location: 'Williamsburg' },
  { id: '3', type: 'sms', message: 'AI sent appointment reminder — client confirmed', time: '8m ago', location: 'Hoboken' },
  { id: '4', type: 'booking', message: 'Waitlist fill: Hydrafacial slot filled from cancellation', time: '12m ago', location: 'SoHo' },
  { id: '5', type: 'alert', message: 'White Plains utilization dropping — 3 open slots tomorrow', time: '15m ago', location: 'White Plains' },
  { id: '6', type: 'call', message: 'Escalation: VIP client requesting specific provider', time: '18m ago', location: 'SoHo' },
  { id: '7', type: 'sms', message: 'No-show prevention: reminder sent to at-risk appointment', time: '22m ago', location: 'Stamford' },
  { id: '8', type: 'revenue', message: 'Upsell captured: client added Chemical Peel to visit', time: '28m ago', location: 'Hoboken' },
  { id: '9', type: 'web', message: 'Web chat converted to Dermal Filler booking', time: '35m ago', location: 'Williamsburg' },
  { id: '10', type: 'booking', message: 'AI optimized tomorrow\'s schedule — moved 2 appointments', time: '42m ago', location: 'SoHo' },
]

interface ActivityFeedProps {
  activities?: Activity[]
  maxItems?: number
}

export function ActivityFeed({ activities = defaultActivities, maxItems = 8 }: ActivityFeedProps) {
  const items = activities.slice(0, maxItems)

  return (
    <div className="space-y-1">
      {items.map((activity, index) => {
        const Icon = iconMap[activity.type]
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#7B61FF]/[0.03] transition-colors"
          >
            <div className={cn('p-1.5 rounded-lg mt-0.5', colorMap[activity.type])}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#F1F5F9] leading-snug">{activity.message}</p>
              <div className="flex items-center gap-2 mt-1">
                {activity.location && (
                  <span className="text-xs text-[#64748B]">{activity.location}</span>
                )}
                <span className="text-xs text-[#64748B]">·</span>
                <span className="text-xs text-[#64748B]">{activity.time}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
