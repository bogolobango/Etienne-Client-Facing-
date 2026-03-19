import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { useLocationStore } from '@/stores/useLocationStore'
import { dailyMetrics } from '@/data/seed'
import { Link } from 'react-router-dom'

export function ChannelPerformance() {
  const { selectedLocation } = useLocationStore()

  const filtered = dailyMetrics.filter(
    (m) => selectedLocation === 'all' || m.locationId === selectedLocation
  )

  // Aggregate by date for response time trend
  const byDate = new Map<string, { responseTime: number; count: number; answered: number; missed: number; aiResolved: number; escalated: number }>()
  filtered.forEach((m) => {
    const existing = byDate.get(m.date) || { responseTime: 0, count: 0, answered: 0, missed: 0, aiResolved: 0, escalated: 0 }
    existing.responseTime += m.responseTimeAvg
    existing.count += 1
    existing.answered += m.callsAnswered
    existing.missed += m.callsMissed
    existing.aiResolved += m.aiResolved
    existing.escalated += m.escalated
    byDate.set(m.date, existing)
  })

  const sortedDates = Array.from(byDate.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  const responseTimeData = sortedDates.map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    responseTime: data.responseTime / data.count,
  }))

  const callData = sortedDates.slice(-30).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    answered: data.answered,
    missed: data.missed,
  }))

  const resolutionData = sortedDates.slice(-30).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    aiResolved: data.aiResolved,
    escalated: data.escalated,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/command-center" className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Channel Performance</h1>
          <p className="text-muted-foreground mt-0.5">Response time and resolution analytics</p>
        </div>
      </div>

      {/* Response Time Trend (90 days) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-4 sm:p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Avg Response Time (90-Day Trend)</h3>
        <div className="h-[200px] sm:h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={responseTimeData}>
              <defs>
                <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--channel-voice)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--channel-voice)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} interval={14} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(v) => v < 60 ? `${Math.round(v)}s` : `${(v / 60).toFixed(0)}m`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number = 0) => [value < 60 ? `${Math.round(value)}s` : `${(value / 60).toFixed(1)}m`, 'Avg Response']}
              />
              <Area type="monotone" dataKey="responseTime" stroke="var(--channel-voice)" strokeWidth={2} fill="url(#responseGrad)" animationDuration={1500} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calls Answered vs Missed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium p-4 sm:p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Calls: Answered vs Missed</h3>
          <div className="h-[180px] sm:h-[220px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} interval={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="answered" fill="var(--chart-3)" radius={[3, 3, 0, 0]} name="Answered" animationDuration={1500} animationEasing="ease-out" />
                <Bar dataKey="missed" fill="var(--destructive)" radius={[3, 3, 0, 0]} name="Missed" animationDuration={1500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Resolution vs Escalation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-premium p-4 sm:p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">AI Resolved vs Escalated</h3>
          <div className="h-[180px] sm:h-[220px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolutionData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} interval={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="aiResolved" stroke="var(--chart-3)" strokeWidth={2} dot={false} name="AI Resolved" animationDuration={1500} animationEasing="ease-out" />
                <Line type="monotone" dataKey="escalated" stroke="var(--warning)" strokeWidth={2} dot={false} name="Escalated" animationDuration={1500} animationEasing="ease-out" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
