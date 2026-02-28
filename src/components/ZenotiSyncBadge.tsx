import { useState } from 'react'

export function ZenotiSyncBadge() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 text-xs cursor-default">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="text-muted-foreground">Zenoti</span>
        <span className="text-success font-medium">Synced</span>
      </div>

      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-border bg-popover p-3 shadow-elevation-lg z-50">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last sync</span>
              <span className="text-foreground font-medium">2 minutes ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Centers</span>
              <span className="text-foreground font-medium">5 connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Records</span>
              <span className="text-foreground font-medium">24,847 synced</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next sync</span>
              <span className="text-foreground font-medium">in 58 seconds</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
