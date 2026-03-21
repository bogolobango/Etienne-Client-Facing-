// ---------------------------------------------------------------------------
// Package analytics — completion rates, deferred revenue, at-risk packages
// ---------------------------------------------------------------------------

import type { Appointment, Client } from '@/types'
import type { PackageAnalytics, PackageBreakdown } from './types'

function parseSessionInfo(session: string | undefined): { current: number; total: number } | null {
  if (!session) return null
  // Expected format: "2 of 6"
  const match = session.match(/^(\d+)\s+of\s+(\d+)$/i)
  if (!match) return null
  return { current: parseInt(match[1], 10), total: parseInt(match[2], 10) }
}

export function analyzePackages(
  appointments: Appointment[],
  _clients: Client[],
  locationFilter: string,
): PackageAnalytics {
  const filtered = locationFilter === 'all'
    ? appointments
    : appointments.filter((a) => a.locationId === locationFilter)

  const packageAppts = filtered.filter((a) => a.saleType === 'package' && a.packageId)

  if (packageAppts.length === 0) {
    return {
      byPackage: [],
      totalDeferred: 0,
      totalCompleted: 0,
      overallCompletionRate: 0,
      atRiskPackages: 0,
    }
  }

  // Group by packageId
  const byPkg = new Map<string, Appointment[]>()
  for (const a of packageAppts) {
    const pid = a.packageId!
    const list = byPkg.get(pid) ?? []
    list.push(a)
    byPkg.set(pid, list)
  }

  const breakdowns: PackageBreakdown[] = []
  let totalDeferred = 0
  let totalCompletedPackages = 0
  let atRiskPackages = 0

  for (const [packageId, appts] of byPkg) {
    appts.sort((a, b) => a.date.localeCompare(b.date))

    // Determine total sessions from packageSession field
    let totalSessions = 0
    let completedSessions = 0
    for (const a of appts) {
      const info = parseSessionInfo(a.packageSession)
      if (info && info.total > totalSessions) totalSessions = info.total
      if (a.status === 'completed') completedSessions++
    }

    // Fallback: if no session info, use count of appointments
    if (totalSessions === 0) totalSessions = appts.length

    const completionRate = totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 1000) / 10
      : 0

    // Deferred revenue: revenue from sessions not yet completed
    const remainingSessions = Math.max(0, totalSessions - completedSessions)
    const avgSessionRevenue = completedSessions > 0
      ? appts
          .filter((a) => a.status === 'completed')
          .reduce((s, a) => s + a.normalizedRevenue, 0) / completedSessions
      : 0
    const deferred = Math.round(remainingSessions * avgSessionRevenue)

    // Package name: use service name from first appointment
    const packageName = appts[0].service

    const isFullyComplete = completedSessions >= totalSessions
    if (isFullyComplete) totalCompletedPackages++

    // At-risk: started but incomplete and no recent activity (>30 days since last visit)
    const now = new Date()
    const lastApptDate = new Date(appts[appts.length - 1].date)
    const daysSinceLast = (now.getTime() - lastApptDate.getTime()) / 86_400_000
    if (!isFullyComplete && completedSessions > 0 && daysSinceLast > 30) {
      atRiskPackages++
    }

    breakdowns.push({
      packageId,
      packageName,
      totalSold: totalSessions,
      completionRate,
      avgSessionsUsed: completedSessions,
      deferredRevenue: deferred,
    })

    totalDeferred += deferred
  }

  breakdowns.sort((a, b) => b.deferredRevenue - a.deferredRevenue)

  const totalPackages = byPkg.size
  const overallCompletionRate = totalPackages > 0
    ? Math.round((totalCompletedPackages / totalPackages) * 1000) / 10
    : 0

  return {
    byPackage: breakdowns,
    totalDeferred,
    totalCompleted: totalCompletedPackages,
    overallCompletionRate,
    atRiskPackages,
  }
}
