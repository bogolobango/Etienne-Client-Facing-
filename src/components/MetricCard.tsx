import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: number
  format?: 'currency' | 'number' | 'percent' | 'time'
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  delay?: number
  onClick?: () => void
}

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'time':
      if (value < 60) return `${Math.round(value)}s`
      if (value < 3600) return `${Math.floor(value / 60)}m ${Math.round(value % 60)}s`
      return `${(value / 3600).toFixed(1)}h`
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}

export function MetricCard({
  label,
  value,
  format = 'number',
  trend,
  trendLabel,
  icon,
  delay = 0,
  onClick,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return

    const duration = 1500
    const startTime = performance.now()
    let rafId: number

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(eased * value))

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [hasAnimated, value])

  const isPositiveTrend = trend !== undefined && trend >= 0
  const trendColor = isPositiveTrend ? 'text-[#00D4AA]' : 'text-[#FF6B6B]'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.08, ease: 'easeOut' }}
      onClick={onClick}
      className={cn(
        'card-premium relative overflow-hidden p-6',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-[1rem] bg-gradient-to-br from-[#7B61FF]/[0.03] to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#94A3B8] mb-1">{label}</p>
          <p className="text-3xl font-mono font-semibold tracking-tight text-[#F1F5F9] stat-number">
            {formatValue(displayValue, format)}
          </p>
          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2.5 text-sm', trendColor)}>
              {isPositiveTrend ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
              {trendLabel && (
                <span className="text-[#64748B] ml-1">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="icon-container-lg">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
