import { motion } from 'framer-motion'
import { Calendar, Users, Clock, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { MetricCard } from '@/components/MetricCard'
import { AgentStatusBadge } from '@/components/AgentStatusBadge'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { agentStatuses, dailyMetrics, appointments, locations } from '@/data/seed'
import { cn, formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function SchedulingOverview() {
  const { role } = useAuthStore()
  const { selectedLocation } = useLocationStore()

  const schedAgents = agentStatuses.filter((a) => a.module === 'scheduling')

  const last30 = dailyMetrics.filter((m) => {
    const d = new Date(m.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) / 86400000 <= 30 &&
      (selectedLocation === 'all' || m.locationId === selectedLocation)
  })

  const avgUtil = last30.length ? last30.reduce((s, m) => s + m.utilizationRate, 0) / last30.length : 0
  const avgNoShow = last30.length ? last30.reduce((s, m) => s + m.noShowRate, 0) / last30.length : 0
  const avgRebook = last30.length ? last30.reduce((s, m) => s + m.rebookingRate, 0) / last30.length : 0
  const totalBookings = last30.reduce((s, m) => s + m.bookings, 0)

  const filteredAppts = selectedLocation === 'all'
    ? appointments
    : appointments.filter((a) => a.locationId === selectedLocation)

  const aiBooked = filteredAppts.filter((a) => a.bookedBy === 'ai').length
  const avgRevenuePerAppt = filteredAppts.length
    ? filteredAppts.reduce((s, a) => s + a.revenue, 0) / filteredAppts.length
    : 0

  // No-show trend over last 30 days
  const byDate = new Map<string, { noShowRate: number; count: number; utilization: number }>()
  last30.forEach((m) => {
    const existing = byDate.get(m.date) || { noShowRate: 0, count: 0, utilization: 0 }
    existing.noShowRate += m.noShowRate
    existing.utilization += m.utilizationRate
    existing.count += 1
    byDate.set(m.date, existing)
  })

  const trendData = Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      noShowRate: data.noShowRate / data.count,
      utilization: data.utilization / data.count,
    }))

  // High-risk appointments
  const highRisk = filteredAppts.filter((a) => a.noShowRisk === 'high' && a.status === 'confirmed').slice(0, 5)

  if (role === 'staff') {
    const todayAppts = filteredAppts
      .filter((a) => {
        const d = new Date(a.date)
        const now = new Date()
        return d.toDateString() === now.toDateString()
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#F1F5F9]">Today's Schedule</h1>
          <p className="text-[#94A3B8] mt-1">{todayAppts.length} appointments scheduled</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Today's Appointments" value={todayAppts.length} icon={<Calendar className="w-5 h-5" />} delay={0} />
          <MetricCard label="High Risk No-Shows" value={highRisk.length} icon={<AlertTriangle className="w-5 h-5" />} delay={1} />
          <MetricCard label="Waitlist Matches" value={3} icon={<Users className="w-5 h-5" />} delay={2} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#94A3B8]">Today's Timeline</h3>
            <Link to="/scheduling/calendar" className="text-sm text-[#00D4AA] hover:underline flex items-center gap-1">
              Full Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {(todayAppts.length > 0 ? todayAppts : filteredAppts.slice(0, 8)).map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 p-3 rounded-lg border border-[#7B61FF]/[0.08] bg-[#7B61FF]/[0.03]">
                <div className="text-sm font-mono text-[#94A3B8] w-20 shrink-0">
                  {appt.startTime}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#F1F5F9]">{appt.clientName}</p>
                  <p className="text-xs text-[#64748B]">{appt.service} · {appt.provider}</p>
                </div>
                <div className="flex items-center gap-2">
                  {appt.noShowRisk === 'high' && (
                    <span className="text-xs px-2 py-0.5 rounded-full text-[#FF6B6B] bg-[#FF6B6B]/10">High Risk</span>
                  )}
                  <span className="text-sm font-mono text-[#94A3B8]">{formatCurrency(appt.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#F1F5F9]">Smart Scheduling Engine</h1>
        <p className="text-[#94A3B8] mt-1">AI-powered appointment optimization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Utilization Rate"
          value={avgUtil}
          format="percent"
          trend={18.5}
          trendLabel="vs before"
          icon={<TrendingUp className="w-5 h-5" />}
          delay={0}
        />
        <MetricCard
          label="No-Show Rate"
          value={avgNoShow}
          format="percent"
          trend={-57.1}
          trendLabel="vs before"
          icon={<Users className="w-5 h-5" />}
          delay={1}
        />
        <MetricCard
          label="AI-Booked"
          value={aiBooked}
          trend={35.0}
          icon={<Calendar className="w-5 h-5" />}
          delay={2}
        />
        <MetricCard
          label="Revenue per Appt"
          value={avgRevenuePerAppt}
          format="currency"
          trend={8.2}
          icon={<Clock className="w-5 h-5" />}
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* No-Show Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6"
        >
          <h3 className="text-sm font-medium text-[#94A3B8] mb-4">No-Show Rate Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} interval={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(26, 31, 53, 0.95)', border: '1px solid rgba(123, 97, 255, 0.15)', borderRadius: '12px', color: '#F1F5F9' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'No-Show Rate']}
                />
                <Line type="monotone" dataKey="noShowRate" stroke="#FF6B6B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Utilization Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-premium p-6"
        >
          <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Utilization Rate Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} interval={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(26, 31, 53, 0.95)', border: '1px solid rgba(123, 97, 255, 0.15)', borderRadius: '12px', color: '#F1F5F9' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Utilization']}
                />
                <Line type="monotone" dataKey="utilization" stroke="#00D4AA" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* High Risk Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 card-premium p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#94A3B8]">High No-Show Risk</h3>
            <Link to="/scheduling/calendar" className="text-sm text-[#00D4AA] hover:underline flex items-center gap-1">
              View Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {highRisk.map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 p-3 rounded-lg border border-[#FF6B6B]/20 bg-[#FF6B6B]/5">
                <AlertTriangle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#F1F5F9]">{appt.clientName}</p>
                  <p className="text-xs text-[#64748B]">{appt.service} · {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {appt.startTime}</p>
                </div>
                <button className="px-3 py-1.5 text-xs bg-[#FFB547]/10 text-[#FFB547] rounded-lg hover:bg-[#FFB547]/20 transition-colors">
                  Send Reminder
                </button>
              </div>
            ))}
            {highRisk.length === 0 && (
              <p className="text-sm text-[#64748B] text-center py-4">No high-risk appointments</p>
            )}
          </div>
        </motion.div>

        {/* AI Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card-premium p-6"
        >
          <h3 className="text-sm font-medium text-[#94A3B8] mb-4">AI Agents</h3>
          <div className="space-y-2">
            {schedAgents.map((agent) => (
              <AgentStatusBadge key={agent.id} agent={agent} />
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-[#00D4AA]/5 border border-[#00D4AA]/20">
            <p className="text-xs text-[#00D4AA]">
              Rebooking rate: <span className="font-mono font-semibold">{avgRebook.toFixed(1)}%</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
