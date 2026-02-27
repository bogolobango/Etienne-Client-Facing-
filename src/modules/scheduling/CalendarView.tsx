import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocationStore } from '@/stores/useLocationStore'
import { appointments } from '@/data/seed'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const serviceColors: Record<string, string> = {
  'Botox': 'border-l-[#00D4AA] bg-[#00D4AA]/5',
  'Dermal Filler': 'border-l-[#8B5CF6] bg-[#8B5CF6]/5',
  'Hydrafacial': 'border-l-[#3B82F6] bg-[#3B82F6]/5',
  'Laser Hair Removal': 'border-l-[#FFB547] bg-[#FFB547]/5',
  'Chemical Peel': 'border-l-[#FF6B6B] bg-[#FF6B6B]/5',
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
      <div className="flex items-center gap-3">
        <Link to="/scheduling" className="p-2 rounded-lg hover:bg-[#7B61FF]/[0.05] text-[#94A3B8] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-[#F1F5F9]">Calendar View</h1>
          <p className="text-[#94A3B8] mt-0.5">{filteredAppts.length} appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateOffset((d) => d - 1)}
            className="p-2 rounded-lg hover:bg-[#7B61FF]/[0.05] text-[#94A3B8] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[#F1F5F9] min-w-[140px] text-center">
            {baseDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => setDateOffset((d) => d + 1)}
            className="p-2 rounded-lg hover:bg-[#7B61FF]/[0.05] text-[#94A3B8] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDateOffset(0)}
            className="px-3 py-1.5 text-xs bg-[#7B61FF]/10 text-[#7B61FF] rounded-lg hover:bg-[#7B61FF]/20 transition-colors ml-2"
          >
            Today
          </button>
        </div>
      </div>

      {/* Service legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(serviceColors).map(([service, color]) => (
          <div key={service} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded-sm border-l-2', color)} />
            <span className="text-xs text-[#94A3B8]">{service}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card-premium overflow-hidden"
      >
        {/* Provider headers */}
        <div className="grid border-b border-[#7B61FF]/[0.08]" style={{ gridTemplateColumns: `80px repeat(${displayProviders.length}, 1fr)` }}>
          <div className="p-3 border-r border-[#7B61FF]/[0.08]" />
          {displayProviders.map((provider) => (
            <div key={provider} className="p-3 border-r border-[#7B61FF]/[0.08] last:border-r-0">
              <p className="text-sm font-medium text-[#F1F5F9] text-center truncate">{provider}</p>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid border-b border-[#7B61FF]/[0.08] last:border-b-0"
              style={{ gridTemplateColumns: `80px repeat(${displayProviders.length}, 1fr)` }}
            >
              <div className="p-2 border-r border-[#7B61FF]/[0.08] flex items-start">
                <span className="text-xs text-[#64748B] font-mono">{time}</span>
              </div>
              {displayProviders.map((provider) => {
                const appt = filteredAppts.find(
                  (a) => a.provider === provider && a.startTime === time
                )
                return (
                  <div key={provider} className="p-1 border-r border-[#7B61FF]/[0.08] last:border-r-0 min-h-[48px]">
                    {appt && (
                      <div
                        className={cn(
                          'p-2 rounded-md border-l-2 cursor-pointer hover:opacity-80 transition-opacity',
                          serviceColors[appt.service] || 'border-l-[#94A3B8] bg-[#7B61FF]/[0.03]'
                        )}
                      >
                        <p className="text-xs font-medium text-[#F1F5F9] truncate">{appt.clientName}</p>
                        <p className="text-xs text-[#64748B] truncate">{appt.service}</p>
                        {appt.noShowRisk === 'high' && (
                          <span className="text-[10px] text-[#FF6B6B]">⚠ High risk</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
