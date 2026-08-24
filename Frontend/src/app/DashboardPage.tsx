import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShellPage } from "../layout/AppShellPage";
import { OnboardingBanner } from "../features/dashboard/OnboardingBanner";
import { DashboardKpiGrid } from "../features/dashboard/DashboardKpiGrid";
import { BusinessOverviewPanel } from "../features/dashboard/BusinessOverviewPanel";
import { EmptyStatePanel } from "../features/dashboard/EmptyStatePanel";
import { PendingApprovalsPanel } from "../features/dashboard/PendingApprovalsPanel";
import { ProjectProgressPanel } from "../features/dashboard/ProjectProgressPanel";
import { ActivityTimeline } from "../features/dashboard/ActivityTimeline";
import { currentUser } from "../mocks/user";
import { businessKpisHardcoded } from "../mocks/dashboard";
import { formatVietnameseDate, getGreeting } from "../utils/date";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ui/Toast";
import { getProjectOptions } from "../api/projects";
import { getMyTasks, getTasksList } from "../api/tasks";
import { getEvents } from "../api/events";
import { listProposals, formatAmountVi, type Proposal } from "../api/proposals";
import { getRecentActivity, type ActivityEntry } from "../api/activity";
import { fromFlatTask, type TaskItem, type ProjectOption } from "../features/tasks/types";
import type { ApprovalItem, DashboardKpiItem, ProjectProgressItem, ActivityItem } from "../types/dashboard";

interface MeetingEvent {
  id: string;
  type: string;
  title: string;
  event_date: string;
  start_time: string | null;
}

const RUNNING_STATUSES_EXCLUDED = new Set(["Hoàn thành", "Tạm dừng"]);

function todayIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}

/**
 * DashboardPage
 * Trang Bảng điều hành tổng quan — dùng khung dùng chung `AppShellPage`.
 * KPI cá nhân + panel Chờ duyệt/Tiến độ dự án/Hoạt động gần đây lấy dữ liệu
 * thật; 4 KPI kinh doanh CRM (Khách hàng/Leads/Hợp đồng) vẫn hardcode — xem
 * mocks/dashboard.ts (Phase 3 chưa làm).
 * Thẻ HTML gốc: toàn bộ <body> của trang "Bảng điều hành · Vela AI".
 */
export function DashboardPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const canApproveProposals = employee?.companies?.[0]?.can_approve_proposals ?? false;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const now = useMemo(() => new Date(), []);

  const name = employee?.full_name || currentUser.name;
  const role = employee?.position_title || currentUser.role;

  const [loading, setLoading] = useState(true);
  const [myTasks, setMyTasks] = useState<TaskItem[]>([]);
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [meetings, setMeetings] = useState<MeetingEvent[]>([]);
  const [pendingProposals, setPendingProposals] = useState<Proposal[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    Promise.all([
      getMyTasks(companyId),
      getTasksList("all", { company_id: companyId, limit: 200 }),
      getProjectOptions(companyId),
      getEvents(now.getFullYear(), now.getMonth() + 1, companyId),
      listProposals(companyId, "pending"),
      getRecentActivity(companyId, 8),
    ])
      .then(([mine, allRes, projList, events, proposals, acts]) => {
        if (!isMounted) return;
        setMyTasks(mine.map(fromFlatTask));
        setAllTasks(allRes.results.map(fromFlatTask));
        setProjects(projList.map((p) => ({ id: p.id, name: p.name, status: p.status ?? undefined })));
        setMeetings(events as MeetingEvent[]);
        setPendingProposals(proposals);
        setActivity(acts);
      })
      .catch(() => showToast("Không tải được dữ liệu bảng điều hành", "danger"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [companyId, now, showToast]);

  const todayStr = todayIso(now);

  const overdueMine = myTasks.filter((t) => !!t.overdueDays).length;
  const dueTodayMine = myTasks.filter((t) => !t.completed && t.dueDateIso === todayStr).length;
  const upcomingMeetingsMine = meetings
    .filter((e) => e.type === "meeting" && e.event_date >= todayStr)
    .sort((a, b) => (a.event_date + (a.start_time ?? "")).localeCompare(b.event_date + (b.start_time ?? "")));
  const pendingApprovalsForMe = canApproveProposals ? pendingProposals.length : 0;

  const mainKpis: DashboardKpiItem[] = [
    { id: "late", icon: "⏰", iconBg: "#EF444418", iconColor: "#EF4444", value: overdueMine, label: "Việc trễ hạn", href: "/tasks" },
    { id: "due-today", icon: "📌", iconBg: "#F59E0B18", iconColor: "#F59E0B", value: dueTodayMine, label: "Đến hạn hôm nay", href: "/tasks" },
    { id: "meetings", icon: "📅", iconBg: "#4F6EF718", iconColor: "#4F6EF7", value: upcomingMeetingsMine.length, label: "Họp sắp tới", href: "/calendar" },
    // Đếm theo số dự án (folder) thật đang có trong tab "Dự án" của công ty — không lọc theo cá nhân,
    // để khớp đúng số hiển thị bên trang Dự án → Thư mục.
    { id: "projects", icon: "🗂️", iconBg: "#8B5CF618", iconColor: "#8B5CF6", value: projects.length, label: "Dự án", href: "/projects" },
    { id: "approvals", icon: "🖐️", iconBg: "#10B98118", iconColor: "#10B981", value: pendingApprovalsForMe, label: "Chờ duyệt", href: "/tasks?tab=approvals" },
  ];

  const runningProjects = projects.filter((p) => !RUNNING_STATUSES_EXCLUDED.has(p.status ?? "")).length;
  const doneThisMonth = allTasks.filter(
    (t) => t.completed && t.completedAtIso && new Date(t.completedAtIso).getFullYear() === now.getFullYear() && new Date(t.completedAtIso).getMonth() === now.getMonth()
  ).length;

  const businessKpis: DashboardKpiItem[] = [
    ...businessKpisHardcoded,
    { id: "running-projects", icon: "🗂️", iconBg: "#4F6EF718", iconColor: "#4F6EF7", value: runningProjects, label: "Dự án đang chạy", href: "/projects" },
    { id: "tasks-done", icon: "✅", iconBg: "#06B6D418", iconColor: "#06B6D4", value: doneThisMonth, label: "Việc xong tháng này", href: "/tasks" },
  ];

  const approvalItems: ApprovalItem[] = pendingProposals
    .slice(0, 5)
    .map((p) => ({ id: p.id, title: p.title, amount: formatAmountVi(p.amount) }));

  const progressByProject = new Map<string, { name: string; color: string; total: number; done: number }>();
  for (const t of allTasks) {
    if (!t.projectId || !t.projectName) continue;
    const entry = progressByProject.get(t.projectId) ?? { name: t.projectName, color: t.projectColor, total: 0, done: 0 };
    entry.total += 1;
    if (t.completed) entry.done += 1;
    progressByProject.set(t.projectId, entry);
  }
  const projectProgress: ProjectProgressItem[] = Array.from(progressByProject.entries())
    .map(([id, v]) => ({ id, title: v.name, percent: v.total ? Math.round((v.done / v.total) * 100) : 0, color: v.color }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);

  const myTaskItems = myTasks
    .filter((t) => !t.completed)
    .sort((a, b) => (a.dueDateIso ?? "9999").localeCompare(b.dueDateIso ?? "9999"))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      label: t.title,
      meta: t.overdueDays ? `Trễ ${t.overdueDays} ngày` : t.dueDateLabel ?? undefined,
    }));

  const meetingItems = upcomingMeetingsMine.slice(0, 5).map((e) => ({
    id: e.id,
    label: e.title,
    meta: new Date(e.event_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) + (e.start_time ? ` ${e.start_time.slice(0, 5)}` : ""),
  }));

  const activityItems: ActivityItem[] = activity.map((a) => ({
    id: a.id,
    name: a.actor_name,
    avatarUrl: a.actor_avatar_url,
    action: a.description,
    time: formatActivityTime(a.created_at),
  }));

  return (
    <AppShellPage initialNavId="dashboard">
      <div className="page-head">
        <h1>
          {getGreeting(now)}, {name} 👋
        </h1>
        <p className="page-sub">
          {formatVietnameseDate(now)} · {role}
        </p>
      </div>

      <OnboardingBanner onStart={() => navigate("/onboarding")} />

      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Đang tải dữ liệu từ máy chủ...
        </div>
      ) : (
        <>
          <DashboardKpiGrid items={mainKpis} emphasized />

          <BusinessOverviewPanel monthLabel={now.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })} kpis={businessKpis} />

          <div className="dash-grid">
            <EmptyStatePanel
              heading="✅ Việc của tôi"
              linkLabel="Xem tất cả ›"
              href="/tasks"
              emptyText="Không có việc nào đang mở 🎉"
              items={myTaskItems}
            />
            <EmptyStatePanel
              heading="📅 Cuộc họp sắp tới"
              linkLabel="Mở lịch ›"
              href="/calendar"
              emptyText="Không có cuộc họp nào."
              items={meetingItems}
            />
            <PendingApprovalsPanel items={approvalItems} href="/tasks?tab=approvals" />
            <ProjectProgressPanel items={projectProgress} href="/projects" />
            <ActivityTimeline items={activityItems} />
          </div>
        </>
      )}
    </AppShellPage>
  );
}
