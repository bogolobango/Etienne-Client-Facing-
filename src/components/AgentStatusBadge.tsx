import { cn } from '@/lib/utils'
import type { AgentStatus } from '@/types'

interface AgentStatusBadgeProps {
  agent: AgentStatus
  compact?: boolean
}

const statusConfig = {
  online: {
    color: 'bg-[#7B61FF]',
    ring: 'ring-[#7B61FF]/20',
    label: 'Online',
    pulse: true,
  },
  idle: {
    color: 'bg-[#FFB547]',
    ring: 'ring-[#FFB547]/20',
    label: 'Idle',
    pulse: false,
  },
  error: {
    color: 'bg-[#FF6B6B]',
    ring: 'ring-[#FF6B6B]/20',
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
        <span className="text-sm text-[#94A3B8]">{agent.name}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-[#7B61FF]/[0.08] bg-[#7B61FF]/[0.03] hover:border-[#7B61FF]/[0.2] hover:bg-[#7B61FF]/[0.06] transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className={cn('relative w-2.5 h-2.5 rounded-full ring-4', config.color, config.ring)}>
          {config.pulse && (
            <div className={cn('absolute inset-0 rounded-full animate-ping', config.color, 'opacity-40')} />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-[#F1F5F9]">{agent.name}</p>
          <p className="text-xs text-[#64748B]">{agent.type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-mono text-[#94A3B8]">{agent.tasksHandled}</p>
        <p className="text-xs text-[#64748B]">tasks</p>
      </div>
    </div>
  )
}
