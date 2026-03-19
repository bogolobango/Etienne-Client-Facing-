import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { DashboardHome } from '@/modules/dashboard/DashboardHome'
import { CommandCenterOverview } from '@/modules/command-center/CommandCenterOverview'
import { ConversationInbox } from '@/modules/command-center/ConversationInbox'
import { ChannelPerformance } from '@/modules/command-center/ChannelPerformance'
import { SchedulingOverview } from '@/modules/scheduling/SchedulingOverview'
import { CalendarView } from '@/modules/scheduling/CalendarView'
import { UtilizationDashboard } from '@/modules/scheduling/UtilizationDashboard'
import { IntelligenceOverview } from '@/modules/intelligence/IntelligenceOverview'
import { RevenueScorecard } from '@/modules/intelligence/RevenueScorecard'
import { AIAnalyst } from '@/modules/intelligence/AIAnalyst'
import { Reports } from '@/modules/intelligence/Reports'
import { GapAnalysis } from '@/modules/intelligence/GapAnalysis'
import { ProviderPnL } from '@/modules/intelligence/ProviderPnL'
import { RevenueEngine } from '@/modules/intelligence/RevenueEngine'
import { PackageTruth } from '@/modules/intelligence/PackageTruth'
import { AutomatedReports } from '@/modules/intelligence/AutomatedReports'
import { PredictiveAlerts } from '@/modules/intelligence/PredictiveAlerts'
import { WhatIfSimulator } from '@/modules/intelligence/WhatIfSimulator'
import { NetworkBenchmarks } from '@/modules/intelligence/NetworkBenchmarks'
import { BrandOverview } from '@/modules/brands/BrandOverview'
import { Settings } from '@/modules/settings/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/command-center" element={<CommandCenterOverview />} />
          <Route path="/command-center/inbox" element={<ConversationInbox />} />
          <Route path="/command-center/performance" element={<ChannelPerformance />} />
          <Route path="/scheduling" element={<SchedulingOverview />} />
          <Route path="/scheduling/calendar" element={<CalendarView />} />
          <Route path="/scheduling/utilization" element={<UtilizationDashboard />} />
          <Route path="/intelligence" element={<IntelligenceOverview />} />
          <Route path="/intelligence/scorecard" element={<RevenueScorecard />} />
          <Route path="/intelligence/analyst" element={<AIAnalyst />} />
          <Route path="/intelligence/reports" element={<Reports />} />
          <Route path="/intelligence/gap-analysis" element={<GapAnalysis />} />
          <Route path="/intelligence/providers" element={<ProviderPnL />} />
          <Route path="/intelligence/revenue-engine" element={<RevenueEngine />} />
          <Route path="/intelligence/packages" element={<PackageTruth />} />
          <Route path="/intelligence/automated-reports" element={<AutomatedReports />} />
          <Route path="/intelligence/predictive-alerts" element={<PredictiveAlerts />} />
          <Route path="/intelligence/simulator" element={<WhatIfSimulator />} />
          <Route path="/intelligence/benchmarks" element={<NetworkBenchmarks />} />
          <Route path="/brands" element={<BrandOverview />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/integrations" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
