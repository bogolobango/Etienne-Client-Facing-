import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { EIPDataProvider } from '@/contexts/EIPDataContext'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { DashboardHome } from '@/modules/dashboard/DashboardHome'
import { Performance } from '@/modules/performance/Performance'
import { AIAnalyst } from '@/modules/intelligence/AIAnalyst'
import { IntelligenceOverview } from '@/modules/intelligence/IntelligenceOverview'
import { PackageTruth } from '@/modules/intelligence/PackageTruth'
import { PredictiveAlerts } from '@/modules/intelligence/PredictiveAlerts'
import { AutomatedReports } from '@/modules/intelligence/AutomatedReports'
import { WhatIfSimulator } from '@/modules/intelligence/WhatIfSimulator'
import { GapAnalysis } from '@/modules/intelligence/GapAnalysis'
import { Settings } from '@/modules/settings/Settings'
import { useState } from 'react'
import { PasswordGate } from '@/components/PasswordGate'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AuthenticatedApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('eip-auth') === 'true')

  if (!authed) {
    return <PasswordGate onAuthenticated={() => setAuthed(true)} />
  }

  return (
    <Routes>
      <Route element={<ErrorBoundary><DashboardLayout /></ErrorBoundary>}>
        {/* Primary pages */}
        <Route path="/" element={<DashboardHome />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/gap-analysis" element={<GapAnalysis />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/integrations" element={<Settings />} />

        {/* Intelligence hub + sub-pages */}
        <Route path="/intelligence" element={<IntelligenceOverview />} />
        <Route path="/intelligence/analyst" element={<AIAnalyst />} />
        <Route path="/intelligence/packages" element={<PackageTruth />} />
        <Route path="/intelligence/alerts" element={<PredictiveAlerts />} />
        <Route path="/intelligence/reports" element={<AutomatedReports />} />
        <Route path="/intelligence/simulator" element={<WhatIfSimulator />} />

        {/* Redirects from old routes */}
        <Route path="/command-center" element={<Navigate to="/" replace />} />
        <Route path="/command-center/*" element={<Navigate to="/" replace />} />
        <Route path="/scheduling" element={<Navigate to="/performance" replace />} />
        <Route path="/scheduling/*" element={<Navigate to="/performance" replace />} />
        <Route path="/intelligence/scorecard" element={<Navigate to="/performance" replace />} />
        <Route path="/intelligence/gap-analysis" element={<Navigate to="/gap-analysis" replace />} />
        <Route path="/intelligence/providers" element={<Navigate to="/performance" replace />} />
        <Route path="/brands" element={<Navigate to="/performance" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EIPDataProvider>
          <AuthenticatedApp />
        </EIPDataProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
