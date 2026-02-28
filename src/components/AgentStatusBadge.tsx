import { cn } from '@/lib/utils'
import type { AgentStatus } from '@/types'

interface AgentStatusBadgeProps {
  agent: AgentStatus
  compact?: boolean
}

const statusConfig = {
  online: {
    color: 'bg-[#10B981]',
    ring: 'ring-[#10B981]/20',
    label: 'Online',
    pulse: true,
  },
  idle: {
    color: 'bg-[#F59E0B]',
    ring: 'ring-[#F59E0B]/20',
    label: 'Idle',
    pulse: false,
  },
  error: {
    color: 'bg-[#EF4444]',
    ring: 'ring-[#EF4444]/20',
    label: 'Error',
    pulse: true,
  },
}

export function AgentStatusBadge({ agent, compact = false }: AgentStatusBadgeProps) {
  const config = statusConfig[agent.status]

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn('relative w-2 h-2 rounded-full', config.color)}>
          {config.pulse && (
            <div className={cn('absolute inset-0 rounded-full animate-ping', config.color, 'opacity-40')} />
          )}
        </div>
        <span className="text-sm text-[#6B7280]">{agent.name}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] hover:border-[#7C3AED]/[0.2] hover:bg-[#7C3AED]/[0.03] transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className={cn('relative w-2.5 h-2.5 rounded-full ring-4', config.color, config.ring)}>
          {config.pulse && (
            <div className={cn('absolute inset-0 rounded-full animate-ping', config.color, 'opacity-40')} />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-[#111827]">{agent.name}</p>
          <p className="text-xs text-[#9CA3AF]">{agent.type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-mono text-[#6B7280]">{agent.tasksHandled}</p>
        <p className="text-xs text-[#9CA3AF]">tasks</p>
      </div>
    </div>
  )
}
