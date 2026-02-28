import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useLocationStore } from '@/stores/useLocationStore'
import { dailyMetrics, locations } from '@/data/seed'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM']

function getHeatmapColor(value: number): string {
  if (value >= 80) return 'bg-success'
  if (value >= 65) return 'bg-success/60'
  if (value >= 50) return 'bg-warning/60'
  if (value >= 30) return 'bg-warning/30'
  return 'bg-primary/[0.06]'
}

// Deterministic heatmap data
function generateHeatmapData(): number[][] {
  const base = [
    [65, 72, 78, 82, 85, 80, 75, 68, 55],
    [58, 68, 75, 80, 78, 72, 70, 62, 48],
    [70, 78, 85, 88, 82, 78, 72, 65, 52],
    [62, 72, 80, 85, 82, 76, 70, 60, 45],
    [75, 82, 88, 90, 85, 80, 75, 68, 55],
    [80, 85, 90, 88, 82, 75, 65, 50, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]
  return base
}

export function UtilizationDashboard() {
  const { selectedLocation } = useLocationStore()
  const heatmapData = generateHeatmapData()

  const last30 = dailyMetrics.filter((m) => {
    const d = new Date(m.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) / 86400000 <= 30
  })

  // Location comparison
  const locationUtilization = locations.map((loc) => {
    const locMetrics = last30.filter((m) => m.locationId === loc.id)
    const avgUtil = locMetrics.length
      ? locMetrics.reduce((s, m) => s + m.utilizationRate, 0) / locMetrics.length
      : 0
    return {
      name: loc.name,
      utilization: Math.round(avgUtil),
      rooms: loc.rooms,
    }
  })

  // Revenue per provider hour
  const revenuePerHour = locations.map((loc) => {
    const locMetrics = last30.filter((m) => m.locationId === loc.id)
    const totalRevenue = locMetrics.reduce((s, m) => s + m.revenue, 0)
    const totalHours = loc.providers * 8 * 30
    return {
      name: loc.name,
      revenuePerHour: Math.round(totalRevenue / totalHours),
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/scheduling" className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Utilization Dashboard</h1>
          <p className="text-muted-foreground mt-0.5">Treatment room and provider utilization</p>
        </div>
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Capacity Heatmap — {selectedLocation === 'all' ? 'All Locations' : locations.find(l => l.id === selectedLocation)?.name}
        </h3>

        <div className="overflow-x-auto scroll-fade-x">
          <div className="min-w-[500px]">
            {/* Hour headers */}
            <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '60px repeat(9, 1fr)' }}>
              <div />
              {hours.map((h) => (
                <div key={h} className="text-center text-xs text-muted-foreground">{h}</div>
              ))}
            </div>

            {/* Heatmap rows */}
            {days.map((day, dayIdx) => (
              <div key={day} className="grid gap-1 mb-1" style={{ gridTemplateColumns: '60px repeat(9, 1fr)' }}>
                <div className="flex items-center text-xs text-muted-foreground">{day}</div>
                {heatmapData[dayIdx].map((value, hourIdx) => (
                  <motion.div
                    key={hourIdx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (dayIdx * 9 + hourIdx) * 0.01 }}
                    className={cn(
                      'h-10 rounded-md flex items-center justify-center text-xs font-mono transition-colors',
                      value === 0 ? 'bg-primary/[0.03] text-muted-foreground' : getHeatmapColor(value),
                      value >= 65 ? 'text-white font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {value > 0 ? `${value}%` : '—'}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="flex gap-1">
            {['bg-primary/[0.06]', 'bg-warning/30', 'bg-warning/60', 'bg-success/60', 'bg-success'].map((color, i) => (
              <div key={i} className={cn('w-8 h-4 rounded-sm', color)} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Location Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Utilization by Location</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationUtilization} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number = 0) => [`${value}%`, 'Utilization']}
                />
                <Bar dataKey="utilization" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue per Provider Hour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-premium p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue per Provider Hour</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenuePerHour} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number = 0) => [`$${value}/hr`, 'Revenue']}
                />
                <Bar dataKey="revenuePerHour" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
