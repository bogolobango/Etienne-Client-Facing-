import { motion } from 'framer-motion'
import { ArrowRight, AlertTriangle } from 'lucide-react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { MetricCard } from '@/components/MetricCard'
import { AgentStatusBadge } from '@/components/AgentStatusBadge'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { agentStatuses, dailyMetrics, appointments } from '@/data/seed'
import { formatCurrency } from '@/lib/utils'
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
          <h1 className="text-2xl font-semibold text-foreground">Today's Schedule</h1>
          <p className="text-muted-foreground mt-1">{todayAppts.length} appointments scheduled</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <MetricCard label="Today's Appointments" value={todayAppts.length} delay={0} dataSource="Zenoti" />
          <MetricCard label="High Risk No-Shows" value={highRisk.length} delay={1} dataSource="Zenoti" />
          <MetricCard label="Waitlist Matches" value={3} delay={2} dataSource="Zenoti" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Today's Timeline</h3>
            <Link to="/scheduling/calendar" className="text-sm text-primary hover:underline flex items-center gap-1">
              Full Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {(todayAppts.length > 0 ? todayAppts : filteredAppts.slice(0, 8)).map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-primary/[0.06] hover:border-primary/20 hover:shadow-elevation-sm transition-all duration-200">
                <div className="text-sm font-mono text-muted-foreground w-20 shrink-0">
                  {appt.startTime}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{appt.clientName}</p>
                  <p className="text-xs text-muted-foreground">{appt.service} · {appt.provider}</p>
                </div>
                <div className="flex items-center gap-2">
                  {appt.noShowRisk === 'high' && (
                    <span className="text-xs px-2 py-0.5 rounded-full text-destructive bg-destructive/10">High Risk</span>
                  )}
                  <span className="text-sm font-mono text-muted-foreground">{formatCurrency(appt.revenue)}</span>
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
        <h1 className="text-2xl font-semibold text-foreground">Smart Scheduling Engine</h1>
        <p className="text-muted-foreground mt-1">AI-powered appointment optimization</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          label="Utilization Rate"
          value={avgUtil}
          format="percent"
          trend={18.5}
          trendLabel="vs before"
          delay={0}
          dataSource="Zenoti"
        />
        <MetricCard
          label="No-Show Rate"
          value={avgNoShow}
          format="percent"
          trend={-57.1}
          trendLabel="vs before"
          delay={1}
          dataSource="Zenoti"
        />
        <MetricCard
          label="AI-Booked"
          value={aiBooked}
          trend={35.0}
          delay={2}
          dataSource="Zenoti"
        />
        <MetricCard
          label="Revenue per Appt"
          value={avgRevenuePerAppt}
          format="currency"
          trend={8.2}
          delay={3}
          dataSource="Zenoti"
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
          <h3 className="text-sm font-medium text-muted-foreground mb-4">No-Show Rate Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} interval={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number = 0) => [`${value.toFixed(1)}%`, 'No-Show Rate']}
                />
                <Line type="monotone" dataKey="noShowRate" stroke="var(--destructive)" strokeWidth={2} dot={false} animationDuration={1500} animationEasing="ease-out" />
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
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Utilization Rate Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} interval={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number = 0) => [`${value.toFixed(1)}%`, 'Utilization']}
                />
                <Line type="monotone" dataKey="utilization" stroke="var(--chart-3)" strokeWidth={2} dot={false} animationDuration={1500} animationEasing="ease-out" />
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
            <h3 className="text-sm font-medium text-muted-foreground">High No-Show Risk</h3>
            <Link to="/scheduling/calendar" className="text-sm text-primary hover:underline flex items-center gap-1">
              View Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {highRisk.map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:border-destructive/40 hover:shadow-elevation-sm transition-all duration-200">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{appt.clientName}</p>
                  <p className="text-xs text-muted-foreground">{appt.service} · {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {appt.startTime}</p>
                </div>
                <button className="px-3 py-1.5 text-xs bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors">
                  Send Reminder
                </button>
              </div>
            ))}
            {highRisk.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No high-risk appointments</p>
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
          <h3 className="text-sm font-medium text-muted-foreground mb-4">AI Agents</h3>
          <div className="space-y-2">
            {schedAgents.map((agent) => (
              <AgentStatusBadge key={agent.id} agent={agent} />
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-primary">
              Rebooking rate: <span className="font-mono font-semibold">{avgRebook.toFixed(1)}%</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
