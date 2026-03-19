import { motion } from 'framer-motion'
import { Phone, MessageSquare, Calendar, AlertTriangle, DollarSign, Globe, Inbox } from 'lucide-react'
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
  call: 'text-[var(--chart-4)] bg-[var(--chart-4)]/10',
  sms: 'text-[var(--channel-voice)] bg-[var(--channel-voice)]/10',
  booking: 'text-primary bg-primary/10',
  alert: 'text-warning bg-warning/10',
  revenue: 'text-success bg-success/10',
  web: 'text-[var(--chart-4)] bg-[var(--chart-4)]/10',
}

const defaultActivities: Activity[] = [
  { id: '1', type: 'call', message: 'After-hours inquiry detected — response time: 8 seconds (vs. 4.2 hr avg)', time: '2m ago', location: 'SoHo' },
  { id: '2', type: 'revenue', message: 'Revenue gap identified: $850 from delayed lead follow-up', time: '5m ago', location: 'Williamsburg' },
  { id: '3', type: 'sms', message: 'Appointment reminder tracked — client confirmed within 3 min', time: '8m ago', location: 'Hoboken' },
  { id: '4', type: 'booking', message: 'Waitlist conversion tracked: Hydrafacial slot filled from cancellation', time: '12m ago', location: 'SoHo' },
  { id: '5', type: 'alert', message: 'White Plains utilization dropping — 3 open slots tomorrow', time: '15m ago', location: 'White Plains' },
  { id: '6', type: 'call', message: 'Escalation flagged: VIP client requesting specific provider', time: '18m ago', location: 'SoHo' },
  { id: '7', type: 'sms', message: 'No-show risk detected: at-risk appointment flagged for follow-up', time: '22m ago', location: 'Stamford' },
  { id: '8', type: 'revenue', message: 'Upsell opportunity logged: Chemical Peel added to visit', time: '28m ago', location: 'Hoboken' },
  { id: '9', type: 'web', message: 'Web inquiry converted to Dermal Filler booking', time: '35m ago', location: 'Williamsburg' },
  { id: '10', type: 'booking', message: 'Schedule optimization detected — 2 appointments consolidated', time: '42m ago', location: 'SoHo' },
]

interface ActivityFeedProps {
  activities?: Activity[]
  maxItems?: number
}

export function ActivityFeed({ activities = defaultActivities, maxItems = 8 }: ActivityFeedProps) {
  const items = activities.slice(0, maxItems)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Inbox className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    )
  }

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
            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-primary/[0.06] transition-colors"
          >
            <div className={cn('p-1.5 rounded-lg mt-0.5', colorMap[activity.type])}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-foreground leading-snug">{activity.message}</p>
              <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                {activity.location && (
                  <span className="text-xs text-muted-foreground">{activity.location}</span>
                )}
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
