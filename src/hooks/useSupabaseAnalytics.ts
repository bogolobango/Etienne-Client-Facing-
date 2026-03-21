import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { AnalyticsResult } from '@/lib/analytics/types'

/**
 * Read pre-computed analytics from Supabase analytics_cache.
 * Returns null when Supabase is not configured or cache is empty.
 */
export function useSupabaseAnalytics(
  workspaceId: string | null,
  locationFilter: string
): { data: AnalyticsResult | null; isLoading: boolean } {
  const [data, setData] = useState<AnalyticsResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase || !workspaceId) {
      setData(null)
      return
    }

    let cancelled = false
    setIsLoading(true)

    supabase
      .from('analytics_cache')
      .select('result, computed_at')
      .eq('workspace_id', workspaceId)
      .eq('location_filter', locationFilter)
      .single()
      .then(({ data: row, error }) => {
        if (cancelled) return
        if (error || !row) {
          setData(null)
        } else {
          // The result is stored as JSONB — parse noShowScores back to Map
          const result = row.result as AnalyticsResult
          if (result.noShowScores && !(result.noShowScores instanceof Map)) {
            result.noShowScores = new Map(
              Object.entries(result.noShowScores as Record<string, unknown>)
            ) as AnalyticsResult['noShowScores']
          }
          setData(result)
        }
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [workspaceId, locationFilter])

  return { data, isLoading }
}
