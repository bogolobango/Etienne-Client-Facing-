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
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/integrations" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
