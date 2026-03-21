import { useMemo } from 'react'
import { useEIPData } from '@/contexts/EIPDataContext'
import { useLocationStore } from '@/stores/useLocationStore'
import { computeAllAnalytics } from '@/lib/analytics'
import { providers } from '@/data/providers'
import type { AnalyticsResult } from '@/lib/analytics/types'

export function useAnalytics(): AnalyticsResult {
  const { appointments, clients, dailyMetrics, locations, services } = useEIPData()
  const { selectedLocation } = useLocationStore()

  return useMemo(
    () =>
      computeAllAnalytics(
        appointments,
        clients,
        dailyMetrics,
        locations,
        services,
        providers,
        selectedLocation
      ),
    [appointments, clients, dailyMetrics, locations, services, selectedLocation]
  )
}
