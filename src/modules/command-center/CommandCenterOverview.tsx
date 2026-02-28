import { motion } from 'framer-motion'
import { Phone, MessageSquare, Globe, Share2, ArrowRight, Clock, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { MetricCard } from '@/components/MetricCard'
import { AgentStatusBadge } from '@/components/AgentStatusBadge'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { agentStatuses, dailyMetrics, conversations } from '@/data/seed'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function CommandCenterOverview() {
  const { role } = useAuthStore()
  const { selectedLocation } = useLocationStore()

  const ccAgents = agentStatuses.filter((a) => a.module === 'command-center')

  const filteredConvos = selectedLocation === 'all'
    ? conversations
    : conversations.filter((c) => c.locationId === selectedLocation)

  const totalConvos = filteredConvos.length
  const aiResolved = filteredConvos.filter((c) => c.status === 'ai_resolved').length
  const escalated = filteredConvos.filter((c) => c.status === 'escalated').length
  const afterHoursSaves = filteredConvos.filter((c) => c.afterHours && c.resolved).length

  const channelData = [
    { name: 'Voice', value: filteredConvos.filter((c) => c.channel === 'voice').length, color: '#3B82F6' },
    { name: 'SMS', value: filteredConvos.filter((c) => c.channel === 'sms').length, color: '#3B82F6' },
    { name: 'Web', value: filteredConvos.filter((c) => c.channel === 'web').length, color: '#7C3AED' },
    { name: 'Social', value: filteredConvos.filter((c) => c.channel === 'social').length, color: '#F59E0B' },
  ]

  const resolutionData = [
    { name: 'AI Resolved', value: aiResolved, color: '#7C3AED' },
    { name: 'Escalated', value: escalated, color: '#F59E0B' },
    { name: 'Abandoned', value: filteredConvos.filter((c) => c.status === 'abandoned').length, color: '#EF4444' },
  ]

  const last30 = dailyMetrics.filter((m) => {
    const d = new Date(m.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) / 86400000 <= 30 &&
      (selectedLocation === 'all' || m.locationId === selectedLocation)
  })

  const avgResponseTime = last30.length
    ? last30.reduce((s, m) => s + m.responseTimeAvg, 0) / last30.length
    : 0
  const totalRecovered = last30.reduce((s, m) => s + m.revenueRecovered, 0)

  const weeklyData = (() => {
    const weeks: { week: string; answered: number; missed: number }[] = []
    for (let w = 3; w >= 0; w--) {
      const weekMetrics = last30.filter((m) => {
        const d = new Date(m.date)
        const now = new Date()
        const daysDiff = (now.getTime() - d.getTime()) / 86400000
        return daysDiff >= w * 7 && daysDiff < (w + 1) * 7
      })
      weeks.push({
        week: `Week ${4 - w}`,
        answered: weekMetrics.reduce((s, m) => s + m.callsAnswered, 0),
        missed: weekMetrics.reduce((s, m) => s + m.callsMissed, 0),
      })
    }
    return weeks
  })()

  if (role === 'staff') {
    const activeConvos = filteredConvos.filter((c) => c.status === 'in_progress' || c.status === 'escalated')

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">Conversation Queue</h1>
          <p className="text-[#6B7280] mt-1">Live conversations needing attention</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Active Conversations" value={activeConvos.length} icon={<MessageSquare className="w-5 h-5" />} delay={0} />
          <MetricCard label="Avg Response Time" value={avgResponseTime} format="time" icon={<Clock className="w-5 h-5" />} delay={1} />
          <MetricCard label="AI Handling" value={aiResolved} icon={<CheckCircle className="w-5 h-5" />} delay={2} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Live Queue</h3>
            <Link to="/command-center/inbox" className="text-sm text-[#7C3AED] hover:underline flex items-center gap-1">
              View Inbox <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {activeConvos.slice(0, 8).map((convo) => (
              <div
                key={convo.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[#7C3AED]/[0.08] bg-[#7C3AED]/[0.03] hover:border-[#7C3AED]/[0.2] transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    convo.priority === 'urgent' ? 'bg-[#EF4444]' :
                    convo.priority === 'pending' ? 'bg-[#F59E0B]' : 'bg-[#7C3AED]'
                  )} />
                  <div>
                    <p className="text-sm font-medium text-[#111827]">{convo.clientName}</p>
                    <p className="text-xs text-[#9CA3AF] line-clamp-1">{convo.summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {convo.channel === 'voice' && <Phone className="w-3.5 h-3.5 text-[#3B82F6]" />}
                  {convo.channel === 'sms' && <MessageSquare className="w-3.5 h-3.5 text-[#3B82F6]" />}
                  {convo.channel === 'web' && <Globe className="w-3.5 h-3.5 text-[#7C3AED]" />}
                  {convo.channel === 'social' && <Share2 className="w-3.5 h-3.5 text-[#F59E0B]" />}
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
        <h1 className="text-2xl font-semibold text-[#111827]">Voice & Text Command Center</h1>
        <p className="text-[#6B7280] mt-1">AI-powered communication across all channels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Conversations"
          value={totalConvos}
          trend={18.5}
          trendLabel="this month"
          icon={<MessageSquare className="w-5 h-5" />}
          delay={0}
        />
        <MetricCard
          label="Avg Response Time"
          value={avgResponseTime}
          format="time"
          trend={-85.2}
          trendLabel="vs before"
          icon={<Clock className="w-5 h-5" />}
          delay={1}
        />
        <MetricCard
          label="AI Resolution Rate"
          value={totalConvos ? (aiResolved / totalConvos) * 100 : 0}
          format="percent"
          trend={12.3}
          icon={<CheckCircle className="w-5 h-5" />}
          delay={2}
        />
        <MetricCard
          label="Revenue Recovered"
          value={totalRecovered}
          format="currency"
          trend={42.0}
          icon={<Phone className="w-5 h-5" />}
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Channel Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6"
        >
          <h3 className="text-sm font-medium text-[#6B7280] mb-4">Channel Breakdown</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(124, 58, 237, 0.15)',
                    borderRadius: '12px',
                    color: '#111827',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {channelData.map((ch) => (
              <div key={ch.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                <span className="text-xs text-[#6B7280]">{ch.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resolution Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-premium p-6"
        >
          <h3 className="text-sm font-medium text-[#6B7280] mb-4">Resolution Breakdown</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolutionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {resolutionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(124, 58, 237, 0.15)',
                    borderRadius: '12px',
                    color: '#111827',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {resolutionData.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-xs text-[#6B7280]">{r.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6"
        >
          <h3 className="text-sm font-medium text-[#6B7280] mb-4">AI Agents</h3>
          <div className="space-y-2">
            {ccAgents.map((agent) => (
              <AgentStatusBadge key={agent.id} agent={agent} />
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-[#7C3AED]/5 border border-[#7C3AED]/20">
            <p className="text-xs text-[#7C3AED]">
              After-hours saves this month: <span className="font-mono font-semibold">{afterHoursSaves}</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Calls Answered vs Missed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card-premium p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[#6B7280]">Calls Answered vs Missed (Weekly)</h3>
          <Link to="/command-center/performance" className="text-sm text-[#7C3AED] hover:underline flex items-center gap-1">
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(124, 58, 237, 0.15)',
                  borderRadius: '12px',
                  color: '#111827',
                }}
              />
              <Bar dataKey="answered" fill="#10B981" radius={[4, 4, 0, 0]} name="Answered" />
              <Bar dataKey="missed" fill="#EF4444" radius={[4, 4, 0, 0]} name="Missed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
