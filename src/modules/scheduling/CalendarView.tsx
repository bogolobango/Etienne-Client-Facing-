import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarOff } from 'lucide-react'
import { useLocationStore } from '@/stores/useLocationStore'
import { appointments } from '@/data/seed'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const serviceColors: Record<string, string> = {
  'Botox': 'border-l-success bg-success/5',
  'Dermal Filler': 'border-l-primary bg-primary/5',
  'Hydrafacial': 'border-l-[var(--channel-voice)] bg-[var(--channel-voice)]/5',
  'Laser Hair Removal': 'border-l-warning bg-warning/5',
  'Chemical Peel': 'border-l-destructive bg-destructive/5',
  'Body Contouring': 'border-l-[#EC4899] bg-[#EC4899]/5',
}

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
]

export function CalendarView() {
  const { selectedLocation } = useLocationStore()
  const [dateOffset, setDateOffset] = useState(0)

  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + dateOffset)
  const currentDateStr = baseDate.toISOString().split('T')[0]

  const filteredAppts = appointments.filter((a) =>
    a.date === currentDateStr &&
    (selectedLocation === 'all' || a.locationId === selectedLocation)
  )

  // Get unique providers
  const providers = Array.from(new Set(filteredAppts.map((a) => a.provider)))
  // If no appointments for this day, show sample providers
  const displayProviders = providers.length > 0 ? providers : ['Dr. Sarah Chen', 'Dr. Michael Ross', 'Dr. Emily Park']

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Link to="/scheduling" className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">Calendar View</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{filteredAppts.length} appointments</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setDateOffset((d) => d - 1)}
            className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[120px] md:min-w-[140px] text-center">
            {baseDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => setDateOffset((d) => d + 1)}
            className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDateOffset(0)}
            className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors ml-2"
          >
            Today
          </button>
        </div>
      </div>

      {/* Service legend */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {Object.entries(serviceColors).map(([service, color]) => (
          <div key={service} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded-sm border-l-2', color)} />
            <span className="text-xs text-muted-foreground">{service}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card-premium overflow-hidden"
      >
       <div className="overflow-x-auto scroll-fade-x">
        {/* Provider headers */}
        <div className="grid border-b border-border min-w-[600px]" style={{ gridTemplateColumns: `80px repeat(${displayProviders.length}, 1fr)` }}>
          <div className="p-3 border-r border-border" />
          {displayProviders.map((provider) => (
            <div key={provider} className="p-3 border-r border-border last:border-r-0">
              <p className="text-sm font-medium text-foreground text-center truncate">{provider}</p>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="max-h-[calc(100vh-360px)] md:max-h-[calc(100vh-320px)] overflow-y-auto scroll-fade-y">
          {filteredAppts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarOff className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No appointments scheduled for this date</p>
            </div>
          )}
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid border-b border-border last:border-b-0 min-w-[600px]"
              style={{ gridTemplateColumns: `80px repeat(${displayProviders.length}, 1fr)` }}
            >
              <div className="p-2 border-r border-border flex items-start">
                <span className="text-xs text-muted-foreground font-mono">{time}</span>
              </div>
              {displayProviders.map((provider) => {
                const appt = filteredAppts.find(
                  (a) => a.provider === provider && a.startTime === time
                )
                return (
                  <div key={provider} className="p-1 border-r border-border last:border-r-0 min-h-[48px]">
                    {appt && (
                      <div
                        className={cn(
                          'p-2 rounded-md border-l-2 cursor-pointer transition-all duration-200 hover:shadow-elevation-sm hover:scale-[1.02]',
                          serviceColors[appt.service] || 'border-l-muted-foreground bg-primary/[0.06]'
                        )}
                      >
                        <p className="text-xs font-medium text-foreground truncate">{appt.clientName}</p>
                        <p className="text-xs text-muted-foreground truncate">{appt.service}</p>
                        {appt.noShowRisk === 'high' && (
                          <span className="text-[10px] text-destructive">⚠ High risk</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
       </div>
      </motion.div>
    </div>
  )
}
