import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { AssistantPage } from "./app/AssistantPage";
import { LoginPage } from "./app/LoginPage";
import { RegisterPage } from "./app/RegisterPage";
import { DashboardPage } from "./app/DashboardPage";
import { TasksPage } from "./app/TasksPage";
import { ProjectsPage } from "./app/ProjectsPage";
import { CalendarPage } from "./app/CalendarPage";
import { EventsPage } from "./app/EventsPage";
import { MeetingRecorderPage } from "./features/meetings/MeetingRecorderPage";
import { WikiPage } from "./app/WikiPage";
import { OkrPage } from "./app/OkrPage";
import { TimeTrackingPage } from "./app/TimeTrackingPage";
import { TemplatesPage } from "./app/TemplatesPage";
import { LeaderboardPage } from "./app/LeaderboardPage";
import { HonorPage } from "./app/HonorPage";
import { PayrollPage } from "./app/PayrollPage";
import { PerformancePage } from "./app/PerformancePage";
import { RecruitmentPage } from "./app/RecruitmentPage";
import { ConnectionsPage } from "./app/ConnectionsPage";
import { SettingsPage } from "./app/SettingsPage";
import { LeavePage } from "./app/LeavePage";
import { OffboardingPage } from "./app/OffboardingPage";
import { ProfilePage } from "./app/ProfilePage";
import { DocumentsPage } from "./app/DocumentsPage";
import { AiFinancePage } from "./app/AiFinancePage";
import { LevelsPage } from "./app/LevelsPage";
import { ProposalsPage } from "./app/ProposalsPage";
import { StatisticsPage } from "./app/StatisticsPage";
import { ReportsPage } from "./app/ReportsPage";
import { AutomationsPage } from "./app/AutomationsPage";
import { TimeAttendancePage } from "./app/TimeAttendancePage";
import { GenericPage } from "./app/GenericPage";

import { ClientsPage } from "./app/ClientsPage";
import { PeoplePage } from "./app/PeoplePage";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/meetings/recorder" element={<MeetingRecorderPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/wiki" element={<WikiPage />} />
            <Route path="/okr" element={<OkrPage />} />
            <Route path="/time" element={<TimeTrackingPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/honor" element={<HonorPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/recruitment" element={<RecruitmentPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/offboarding" element={<OffboardingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/ai-finance" element={<AiFinancePage />} />
            <Route path="/levels" element={<LevelsPage />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/automations" element={<AutomationsPage />} />
            <Route path="/time-attendance" element={<TimeAttendancePage />} />
            <Route path="/:pageId" element={<GenericPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
