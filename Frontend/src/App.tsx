import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { AssistantPage } from "./app/AssistantPage";
import { LoginPage } from "./app/LoginPage";
import { RegisterPage } from "./app/RegisterPage";
import { DashboardPage } from "./app/DashboardPage";
import { TasksPage } from "./app/TasksPage";
import { ProjectsPage } from "./app/ProjectsPage";
import { CalendarPage } from "./app/CalendarPage";
import { GenericPage } from "./app/GenericPage";

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/:pageId" element={<GenericPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
