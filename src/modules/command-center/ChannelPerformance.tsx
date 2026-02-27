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
        <Link to="/command-center" className="p-2 rounded-lg hover:bg-[#7B61FF]/[0.05] text-[#94A3B8] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#F1F5F9]">Channel Performance</h1>
          <p className="text-[#94A3B8] mt-0.5">Response time and resolution analytics</p>
        </div>
      </div>

      {/* Response Time Trend (90 days) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-6"
      >
        <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Avg Response Time (90-Day Trend)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={responseTimeData}>
              <defs>
                <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} interval={14} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(v) => v < 60 ? `${Math.round(v)}s` : `${(v / 60).toFixed(0)}m`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(26, 31, 53, 0.95)', border: '1px solid rgba(123, 97, 255, 0.15)', borderRadius: '12px', color: '#F1F5F9' }}
                formatter={(value: number = 0) => [value < 60 ? `${Math.round(value)}s` : `${(value / 60).toFixed(1)}m`, 'Avg Response']}
              />
              <Area type="monotone" dataKey="responseTime" stroke="#3B82F6" strokeWidth={2} fill="url(#responseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Calls Answered vs Missed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium p-6"
        >
          <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Calls: Answered vs Missed</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} interval={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(26, 31, 53, 0.95)', border: '1px solid rgba(123, 97, 255, 0.15)', borderRadius: '12px', color: '#F1F5F9' }} />
                <Bar dataKey="answered" fill="#00D4AA" radius={[3, 3, 0, 0]} name="Answered" />
                <Bar dataKey="missed" fill="#FF6B6B" radius={[3, 3, 0, 0]} name="Missed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Resolution vs Escalation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-premium p-6"
        >
          <h3 className="text-sm font-medium text-[#94A3B8] mb-4">AI Resolved vs Escalated</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolutionData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} interval={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(26, 31, 53, 0.95)', border: '1px solid rgba(123, 97, 255, 0.15)', borderRadius: '12px', color: '#F1F5F9' }} />
                <Line type="monotone" dataKey="aiResolved" stroke="#00D4AA" strokeWidth={2} dot={false} name="AI Resolved" />
                <Line type="monotone" dataKey="escalated" stroke="#FFB547" strokeWidth={2} dot={false} name="Escalated" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
