import { AppShellPage } from "../layout/AppShellPage";
import { OnboardingBanner } from "../features/dashboard/OnboardingBanner";
import { DashboardKpiGrid } from "../features/dashboard/DashboardKpiGrid";
import { BusinessOverviewPanel } from "../features/dashboard/BusinessOverviewPanel";
import { EmptyStatePanel } from "../features/dashboard/EmptyStatePanel";
import { PendingApprovalsPanel } from "../features/dashboard/PendingApprovalsPanel";
import { ProjectProgressPanel } from "../features/dashboard/ProjectProgressPanel";
import { ActivityTimeline } from "../features/dashboard/ActivityTimeline";
import { useToast } from "../components/ui/Toast";
import { currentUser } from "../mocks/user";
import { mainKpis, businessKpis, approvals, projectProgress, recentActivity } from "../mocks/dashboard";
import { formatVietnameseDate, getGreeting } from "../utils/date";

/**
 * DashboardPage
 * Trang Bảng điều hành tổng quan — dùng khung dùng chung `AppShellPage`.
 * Thẻ HTML gốc: toàn bộ <body> của trang "Bảng điều hành · Vela AI".
 */
export function DashboardPage() {
  const { showToast } = useToast();
  const now = new Date();

  return (
    <AppShellPage initialNavId="dashboard">
      <div className="page-head">
        <h1>
          {getGreeting(now)}, {currentUser.name} 👋
        </h1>
        <p className="page-sub">
          {formatVietnameseDate(now)} · {currentUser.role}
        </p>
      </div>

      <OnboardingBanner onStart={() => showToast("Đang mở hướng dẫn nhập việc...", "default")} />

      <DashboardKpiGrid items={mainKpis} emphasized />

      <BusinessOverviewPanel monthLabel="07/2026" kpis={businessKpis} />

      <div className="dash-grid">
        <EmptyStatePanel
          heading="✅ Việc của tôi"
          linkLabel="Xem tất cả ›"
          href="/tasks"
          emptyText="Không có việc nào đang mở 🎉"
        />
        <EmptyStatePanel
          heading="📅 Cuộc họp sắp tới"
          linkLabel="Mở lịch ›"
          href="/calendar"
          emptyText="Không có cuộc họp nào."
        />
        <PendingApprovalsPanel items={approvals} />
        <ProjectProgressPanel items={projectProgress} />
        <ActivityTimeline items={recentActivity} />
      </div>
    </AppShellPage>
  );
}
