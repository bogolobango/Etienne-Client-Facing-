import { cn } from '@/lib/utils'
import type { AgentStatus } from '@/types'

interface AgentStatusBadgeProps {
  agent: AgentStatus
  compact?: boolean
}

const statusConfig = {
  online: {
    color: 'bg-success',
    ring: 'ring-success/20',
    label: 'Online',
    pulse: true,
  },
  idle: {
    color: 'bg-warning',
    ring: 'ring-warning/20',
    label: 'Idle',
    pulse: false,
  },
  error: {
    color: 'bg-destructive',
    ring: 'ring-destructive/20',
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
        <span className="text-sm text-muted-foreground">{agent.name}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary hover:border-primary/20 hover:bg-primary/[0.06] transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className={cn('relative w-2.5 h-2.5 rounded-full ring-4', config.color, config.ring)}>
          {config.pulse && (
            <div className={cn('absolute inset-0 rounded-full animate-ping', config.color, 'opacity-40')} />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{agent.name}</p>
          <p className="text-xs text-muted-foreground">{agent.type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-mono text-muted-foreground">{agent.tasksHandled}</p>
        <p className="text-xs text-muted-foreground">tasks</p>
      </div>
    </div>
  )
}
