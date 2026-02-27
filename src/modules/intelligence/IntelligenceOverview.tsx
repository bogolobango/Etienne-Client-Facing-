import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Target, Brain, ArrowRight, BarChart3, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { MetricCard } from '@/components/MetricCard'
import { AgentStatusBadge } from '@/components/AgentStatusBadge'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { agentStatuses, dailyMetrics, locations, alerts } from '@/data/seed'
import { cn, formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function IntelligenceOverview() {
  const { role } = useAuthStore()
  const { selectedLocation } = useLocationStore()

  const intelAgents = agentStatuses.filter((a) => a.module === 'intelligence')

  const last30 = dailyMetrics.filter((m) => {
    const d = new Date(m.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) / 86400000 <= 30 &&
      (selectedLocation === 'all' || m.locationId === selectedLocation)
  })

  const totalRevenue = last30.reduce((s, m) => s + m.revenue, 0)
  const totalRecovered = last30.reduce((s, m) => s + m.revenueRecovered, 0)
  const totalNewClients = last30.reduce((s, m) => s + m.newClients, 0)
  const avgNoShowRate = last30.length ? last30.reduce((s, m) => s + m.noShowRate, 0) / last30.length : 0

  // Revenue breakdown
  const noShowPrevention = Math.round(totalRecovered * 0.35)
  const missedCallRecovery = Math.round(totalRecovered * 0.45)
  const upsellCapture = Math.round(totalRecovered * 0.20)

  // Location comparison
  const locationRevenue = locations.map((loc) => {
    const locMetrics = last30.filter((m) => m.locationId === loc.id)
    return {
      name: loc.name,
      revenue: locMetrics.reduce((s, m) => s + m.revenue, 0),
      recovered: locMetrics.reduce((s, m) => s + m.revenueRecovered, 0),
    }
  })

  // Revenue trend
  const byDate = new Map<string, number>()
  last30.forEach((m) => {
    byDate.set(m.date, (byDate.get(m.date) || 0) + m.revenue)
  })
  const revenueTrend = Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
    }))

  const topOpportunities = alerts
    .filter((a) => a.type === 'opportunity' && !a.dismissed)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5)

  if (role === 'staff') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#F1F5F9]">Your Performance</h1>
          <p className="text-[#94A3B8] mt-1">Today's snapshot and AI suggestions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Bookings Handled" value={12} trend={8.5} icon={<BarChart3 className="w-5 h-5" />} delay={0} />
          <MetricCard label="Conversion Rate" value={82} format="percent" trend={3.2} icon={<Target className="w-5 h-5" />} delay={1} />
          <MetricCard label="Revenue Generated" value={5850} format="currency" trend={12.0} icon={<DollarSign className="w-5 h-5" />} delay={2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/[0.06] bg-[#1A1F35] p-6"
          >
            <h3 className="text-sm font-medium text-[#94A3B8] mb-4">AI Suggested Actions</h3>
            <div className="space-y-3">
              {[
                'Call Jennifer M. — showed interest in Body Contouring package last visit',
                'Follow up on 3 pending Hydrafacial consultations from this week',
                'Suggest Chemical Peel add-on to tomorrow\'s Botox clients',
              ].map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[#8B5CF6]/20 bg-[#8B5CF6]/5">
                  <Brain className="w-4 h-4 text-[#8B5CF6] mt-0.5 shrink-0" />
                  <p className="text-sm text-[#F1F5F9]">{action}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-white/[0.06] bg-[#1A1F35] p-6"
          >
            <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Team Leaderboard</h3>
            <div className="space-y-3">
              {[
                { name: 'Sarah C.', bookings: 15, revenue: 7200 },
                { name: 'You', bookings: 12, revenue: 5850 },
                { name: 'Michael R.', bookings: 11, revenue: 5400 },
                { name: 'Emily P.', bookings: 9, revenue: 4100 },
              ].map((person, i) => (
                <div key={i} className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  person.name === 'You' ? 'border border-[#00D4AA]/20 bg-[#00D4AA]/5' : 'border border-white/[0.06] bg-white/[0.02]'
                )}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-[#64748B] w-4">#{i + 1}</span>
                    <span className={cn('text-sm font-medium', person.name === 'You' ? 'text-[#00D4AA]' : 'text-[#F1F5F9]')}>{person.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-[#F1F5F9]">{formatCurrency(person.revenue)}</p>
                    <p className="text-xs text-[#64748B]">{person.bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#F1F5F9]">Revenue Intelligence Hub</h1>
        <p className="text-[#94A3B8] mt-1">AI-powered revenue analytics and insights</p>
      </div>

      {/* Hero Metric */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#00D4AA]/20 bg-gradient-to-r from-[#00D4AA]/5 to-transparent p-8"
      >
        <p className="text-sm text-[#00D4AA] font-medium mb-2">Revenue Recovered This Month</p>
        <p className="text-5xl font-mono font-bold text-[#F1F5F9] tracking-tight">{formatCurrency(totalRecovered)}</p>
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-xs text-[#64748B]">Missed Call Recovery</p>
            <p className="text-lg font-mono text-[#F1F5F9]">{formatCurrency(missedCallRecovery)}</p>
          </div>
          <div>
            <p className="text-xs text-[#64748B]">No-Show Prevention</p>
            <p className="text-lg font-mono text-[#F1F5F9]">{formatCurrency(noShowPrevention)}</p>
          </div>
          <div>
            <p className="text-xs text-[#64748B]">Upsell Capture</p>
            <p className="text-lg font-mono text-[#F1F5F9]">{formatCurrency(upsellCapture)}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Revenue"
          value={totalRevenue}
          format="currency"
          trend={15.8}
          trendLabel="vs prev month"
          icon={<DollarSign className="w-5 h-5" />}
          delay={1}
        />
        <MetricCard
          label="New Clients"
          value={totalNewClients}
          trend={22.5}
          icon={<Users className="w-5 h-5" />}
          delay={2}
        />
        <MetricCard
          label="No-Show Savings"
          value={avgNoShowRate}
          format="percent"
          trend={-57.1}
          trendLabel="reduction"
          icon={<Target className="w-5 h-5" />}
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Location Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-[#1A1F35] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#94A3B8]">Location Revenue Comparison</h3>
            <Link to="/intelligence/scorecard" className="text-sm text-[#00D4AA] hover:underline flex items-center gap-1">
              Full Scorecard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationRevenue}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1F35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F1F5F9' }}
                  formatter={(value: number) => [formatCurrency(value)]}
                />
                <Bar dataKey="revenue" fill="#00D4AA" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="recovered" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Recovered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-white/[0.06] bg-[#1A1F35] p-6"
        >
          <h3 className="text-sm font-medium text-[#94A3B8] mb-4">AI Opportunities</h3>
          <div className="space-y-3">
            {topOpportunities.map((opp) => (
              <div key={opp.id} className="p-3 rounded-lg border border-[#00D4AA]/20 bg-[#00D4AA]/5 cursor-pointer hover:border-[#00D4AA]/40 transition-colors">
                <p className="text-sm text-[#F1F5F9] leading-snug">{opp.title}</p>
                <p className="text-xs text-[#64748B] mt-1">Potential: {formatCurrency(opp.impact)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Agents + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/[0.06] bg-[#1A1F35] p-6"
        >
          <h3 className="text-sm font-medium text-[#94A3B8] mb-4">AI Agents</h3>
          <div className="space-y-2">
            {intelAgents.map((agent) => (
              <AgentStatusBadge key={agent.id} agent={agent} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-6 cursor-pointer hover:border-[#8B5CF6]/40 transition-colors"
        >
          <Link to="/intelligence/analyst" className="block">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-6 h-6 text-[#8B5CF6]" />
              <h3 className="text-lg font-medium text-[#F1F5F9]">Ask the AI Analyst</h3>
            </div>
            <p className="text-sm text-[#94A3B8] mb-4">
              Get instant answers about your business performance. Ask questions like:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Why did revenue change?',
                'Which location is underperforming?',
                'What should I focus on?',
                'Compare my locations',
              ].map((q) => (
                <span key={q} className="px-3 py-1.5 text-xs bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full border border-[#8B5CF6]/20">
                  {q}
                </span>
              ))}
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
