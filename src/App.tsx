import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { EIPDataProvider } from '@/contexts/EIPDataContext'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { DashboardHome } from '@/modules/dashboard/DashboardHome'
import { Performance } from '@/modules/performance/Performance'
import { AIAnalyst } from '@/modules/intelligence/AIAnalyst'
import { GapAnalysis } from '@/modules/intelligence/GapAnalysis'
import { Settings } from '@/modules/settings/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EIPDataProvider>
          <Routes>
            <Route element={<ErrorBoundary><DashboardLayout /></ErrorBoundary>}>
              {/* Primary 5-page structure */}
              <Route path="/" element={<DashboardHome />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/intelligence" element={<AIAnalyst />} />
              <Route path="/gap-analysis" element={<GapAnalysis />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/integrations" element={<Settings />} />

              {/* Redirects from old routes */}
              <Route path="/command-center" element={<Navigate to="/" replace />} />
              <Route path="/command-center/*" element={<Navigate to="/" replace />} />
              <Route path="/scheduling" element={<Navigate to="/performance" replace />} />
              <Route path="/scheduling/*" element={<Navigate to="/performance" replace />} />
              <Route path="/intelligence/analyst" element={<Navigate to="/intelligence" replace />} />
              <Route path="/intelligence/scorecard" element={<Navigate to="/performance" replace />} />
              <Route path="/intelligence/gap-analysis" element={<Navigate to="/gap-analysis" replace />} />
              <Route path="/intelligence/providers" element={<Navigate to="/performance" replace />} />
              <Route path="/intelligence/*" element={<Navigate to="/intelligence" replace />} />
              <Route path="/brands" element={<Navigate to="/performance" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </EIPDataProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
