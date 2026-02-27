import { motion } from 'framer-motion'
import { Phone, Calendar, Brain, TrendingUp, Users, Clock, AlertTriangle, DollarSign } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { MetricCard } from '@/components/MetricCard'
import { AgentStatusBadge } from '@/components/AgentStatusBadge'
import { ActivityFeed } from '@/components/ActivityFeed'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { locations, agentStatuses, dailyMetrics, alerts } from '@/data/seed'
import { cn, formatCurrency } from '@/lib/utils'

function getFilteredMetrics(locationId: string) {
  const filtered = locationId === 'all'
    ? dailyMetrics
    : dailyMetrics.filter((m) => m.locationId === locationId)

  const last30 = filtered.filter((m) => {
    const d = new Date(m.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) / 86400000 <= 30
  })

  const prev30 = filtered.filter((m) => {
    const d = new Date(m.date)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / 86400000
    return diff > 30 && diff <= 60
  })

  const sum = (arr: typeof last30, key: keyof typeof last30[0]) =>
    arr.reduce((s, m) => s + (m[key] as number), 0)
  const avg = (arr: typeof last30, key: keyof typeof last30[0]) =>
    arr.length ? sum(arr, key) / arr.length : 0

  const currentRevenue = sum(last30, 'revenue')
  const prevRevenue = sum(prev30, 'revenue')
  const revenueTrend = prevRevenue ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0

  const currentNoShow = avg(last30, 'noShowRate')
  const prevNoShow = avg(prev30, 'noShowRate')
  const noShowTrend = prevNoShow ? ((currentNoShow - prevNoShow) / prevNoShow) * 100 : 0

  const currentResponseTime = avg(last30, 'responseTimeAvg')
  const prevResponseTime = avg(prev30, 'responseTimeAvg')
  const responseTrend = prevResponseTime
    ? ((currentResponseTime - prevResponseTime) / prevResponseTime) * 100
    : 0

  const currentUtil = avg(last30, 'utilizationRate')
  const prevUtil = avg(prev30, 'utilizationRate')
  const utilTrend = prevUtil ? ((currentUtil - prevUtil) / prevUtil) * 100 : 0

  return {
    revenue: Math.round(currentRevenue),
    revenueTrend,
    noShowRate: currentNoShow,
    noShowTrend,
    responseTime: currentResponseTime,
    responseTrend,
    utilization: currentUtil,
    utilTrend,
    totalBookings: sum(last30, 'bookings'),
    newClients: sum(last30, 'newClients'),
    revenueRecovered: sum(last30, 'revenueRecovered'),
    aiResolved: sum(last30, 'aiResolved'),
  }
}

function getRevenueChartData(locationId: string) {
  const filtered = locationId === 'all'
    ? dailyMetrics
    : dailyMetrics.filter((m) => m.locationId === locationId)

  const byDate = new Map<string, number>()
  filtered.forEach((m) => {
    byDate.set(m.date, (byDate.get(m.date) || 0) + m.revenue)
  })

  return Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
    }))
}

export function DashboardHome() {
  const { role } = useAuthStore()
  const { selectedLocation } = useLocationStore()
  const metrics = getFilteredMetrics(selectedLocation)
  const chartData = getRevenueChartData(selectedLocation)
  const activeAlerts = alerts.filter((a) => !a.dismissed).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#F1F5F9]">
          {role === 'owner' ? 'Business Overview' : 'Today\'s Dashboard'}
        </h1>
        <p className="text-[#94A3B8] mt-1">
          {role === 'owner'
            ? `${selectedLocation === 'all' ? 'All locations' : locations.find(l => l.id === selectedLocation)?.name} — Last 30 days`
            : 'Your tasks and performance today'}
        </p>
      </div>

      {/* Owner View */}
      {role === 'owner' ? (
        <>
          {/* Hero Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Revenue"
              value={metrics.revenue}
              format="currency"
              trend={metrics.revenueTrend}
              trendLabel="vs prev period"
              icon={<DollarSign className="w-5 h-5" />}
              delay={0}
            />
            <MetricCard
              label="Revenue Recovered"
              value={metrics.revenueRecovered}
              format="currency"
              trend={42.5}
              trendLabel="by AI"
              icon={<TrendingUp className="w-5 h-5" />}
              delay={1}
            />
            <MetricCard
              label="No-Show Rate"
              value={metrics.noShowRate}
              format="percent"
              trend={metrics.noShowTrend}
              trendLabel="vs prev period"
              icon={<Users className="w-5 h-5" />}
              delay={2}
            />
            <MetricCard
              label="Avg Response Time"
              value={metrics.responseTime}
              format="time"
              trend={metrics.responseTrend}
              trendLabel="vs prev period"
              icon={<Clock className="w-5 h-5" />}
              delay={3}
            />
          </div>

          {/* Revenue Chart + Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 card-premium p-6"
            >
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Revenue Trend (30 days)</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00D4AA" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00D4AA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(26, 31, 53, 0.95)',
                        border: '1px solid rgba(123, 97, 255, 0.15)',
                        borderRadius: '12px',
                        color: '#F1F5F9',
                        backdropFilter: 'blur(12px)',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#00D4AA"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-premium p-6"
            >
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4">AI Opportunities</h3>
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors cursor-pointer',
                      alert.type === 'critical'
                        ? 'border-[#FF6B6B]/20 bg-[#FF6B6B]/5 hover:border-[#FF6B6B]/40'
                        : alert.type === 'warning'
                        ? 'border-[#FFB547]/20 bg-[#FFB547]/5 hover:border-[#FFB547]/40'
                        : 'border-[#00D4AA]/20 bg-[#00D4AA]/5 hover:border-[#00D4AA]/40'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className={cn(
                          'w-4 h-4 mt-0.5 shrink-0',
                          alert.type === 'critical'
                            ? 'text-[#FF6B6B]'
                            : alert.type === 'warning'
                            ? 'text-[#FFB547]'
                            : 'text-[#00D4AA]'
                        )}
                      />
                      <div>
                        <p className="text-sm text-[#F1F5F9] leading-snug">{alert.title}</p>
                        <p className="text-xs text-[#64748B] mt-1">
                          Impact: {formatCurrency(alert.impact)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Module Health + Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Module Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="card-premium p-6"
            >
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4">AI Agents</h3>
              <div className="space-y-2">
                {agentStatuses.map((agent) => (
                  <AgentStatusBadge key={agent.id} agent={agent} />
                ))}
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 card-premium p-6"
            >
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Live Activity</h3>
              <ActivityFeed />
            </motion.div>
          </div>

          {/* Location Comparison */}
          {selectedLocation === 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="card-premium p-6"
            >
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Location Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {locations.map((loc) => {
                  const locMetrics = getFilteredMetrics(loc.id)
                  return (
                    <div
                      key={loc.id}
                      className="p-4 rounded-lg border border-[#7B61FF]/[0.08] bg-[#7B61FF]/[0.03] hover:border-[#7B61FF]/[0.2] transition-all duration-200"
                    >
                      <p className="text-sm font-medium text-[#F1F5F9]">{loc.name}</p>
                      <p className="text-xs text-[#64748B]">{loc.city}, {loc.state}</p>
                      <p className="text-xl font-mono font-semibold text-[#F1F5F9] mt-3">
                        {formatCurrency(locMetrics.revenue)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#64748B]">Util:</span>
                        <span className="text-xs font-mono text-[#00D4AA]">
                          {locMetrics.utilization.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </>
      ) : (
        /* Staff View */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Your Bookings Today"
              value={8}
              format="number"
              icon={<Calendar className="w-5 h-5" />}
              delay={0}
            />
            <MetricCard
              label="Conversion Rate"
              value={78}
              format="percent"
              trend={5.2}
              icon={<TrendingUp className="w-5 h-5" />}
              delay={1}
            />
            <MetricCard
              label="Pending Follow-ups"
              value={5}
              format="number"
              icon={<Phone className="w-5 h-5" />}
              delay={2}
            />
            <MetricCard
              label="AI Suggestions"
              value={3}
              format="number"
              icon={<Brain className="w-5 h-5" />}
              delay={3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Today's Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-premium p-6"
            >
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Today's Tasks</h3>
              <div className="space-y-3">
                {[
                  { task: 'Follow up with Sarah M. — interested in Body Contouring', priority: 'urgent' },
                  { task: 'Confirm 3 PM Botox appointment with James R.', priority: 'pending' },
                  { task: 'Review AI-generated treatment recommendations', priority: 'ai_handling' },
                  { task: 'Call back Maria L. — asked about package pricing', priority: 'pending' },
                  { task: 'Check in on waitlist patients for tomorrow', priority: 'ai_handling' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#7B61FF]/[0.08] bg-[#7B61FF]/[0.03]">
                    <div className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      item.priority === 'urgent' ? 'bg-[#FF6B6B]' :
                      item.priority === 'pending' ? 'bg-[#FFB547]' : 'bg-[#00D4AA]'
                    )} />
                    <p className="text-sm text-[#F1F5F9]">{item.task}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-premium p-6"
            >
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4">Recent Activity</h3>
              <ActivityFeed maxItems={6} />
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
