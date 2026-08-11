import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { TaskHeader, type TaskTopTab } from "../features/tasks/TaskHeader";
import { TaskGroupTabs, type TaskGroup } from "../features/tasks/TaskGroupTabs";
import { TaskChecklist } from "../features/tasks/TaskChecklist";
import { QuickAddTask } from "../features/tasks/QuickAddTask";
import { TaskFiltersBar } from "../features/tasks/TaskFiltersBar";
import { TaskFilterChips, type TaskFlagFilter } from "../features/tasks/TaskFilterChips";
import { TaskTable } from "../features/tasks/TaskTable";
import { ProposalApprovalList } from "../features/proposals/ProposalApprovalList";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../auth/AuthContext";
import { getCompaniesTree } from "../api/companies";
import { createTask, updateTask, getMyTasks, getDepartmentTasks } from "../api/tasks";
import { listProposals, decideProposal, type Proposal } from "../api/proposals";
import { flattenTasks, flattenProjects, fromFlatTask, type TaskItem, type ProjectOption } from "../features/tasks/types";

export function TasksPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const canApproveProposals = employee?.companies?.[0]?.can_approve_proposals ?? false;
  const { showToast } = useToast();

  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
  const [myTasks, setMyTasks] = useState<TaskItem[]>([]);
  const [deptTasks, setDeptTasks] = useState<TaskItem[]>([]);
  const [deptLoaded, setDeptLoaded] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const [topTab, setTopTab] = useState<TaskTopTab>(searchParams.get("tab") === "approvals" ? "approvals" : "tasks");
  const [group, setGroup] = useState<TaskGroup>("all");
  const [flagFilter, setFlagFilter] = useState<TaskFlagFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [pendingProposals, setPendingProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    Promise.all([getCompaniesTree(companyId), getMyTasks(companyId), listProposals(companyId, "pending")])
      .then(([tree, mine, proposals]) => {
        if (!isMounted) return;
        setAllTasks(flattenTasks(tree));
        setProjects(flattenProjects(tree));
        setMyTasks(mine.map(fromFlatTask));
        setPendingProposals(proposals);
      })
      .catch(() => showToast("Không tải được danh sách công việc", "danger"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [companyId, showToast]);

  useEffect(() => {
    if (!companyId || group !== "dept" || deptLoaded) return;
    setGroupLoading(true);
    getDepartmentTasks(companyId)
      .then((rows) => {
        setDeptTasks(rows.map(fromFlatTask));
        setDeptLoaded(true);
      })
      .catch(() => showToast("Không tải được công việc của phòng ban", "danger"))
      .finally(() => setGroupLoading(false));
  }, [companyId, group, deptLoaded, showToast]);

  const groupTasks = group === "all" ? allTasks : group === "mine" ? myTasks : deptTasks;

  const filteredTasks = useMemo(() => {
    return groupTasks.filter((t) => {
      const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProject = !projectFilter || t.projectId === projectFilter;
      const matchesFlag = flagFilter !== "overdue" || !!t.overdueDays;
      return matchesSearch && matchesProject && matchesFlag;
    });
  }, [groupTasks, searchQuery, projectFilter, flagFilter]);

  const checklistTasks = useMemo(() => {
    return myTasks
      .filter((t) => !t.completed)
      .sort((a, b) => (a.dueDateIso ?? "9999").localeCompare(b.dueDateIso ?? "9999"))
      .slice(0, 6);
  }, [myTasks]);

  function handleSelectChip(chip: TaskFlagFilter) {
    if (chip === "all" || chip === "overdue") {
      setFlagFilter(chip);
      return;
    }
    const label = chip === "flag" ? "Gắn cờ" : chip === "problem" ? "Có vấn đề" : "AI tự động hoá được";
    showToast(`Lọc theo "${label}" đang được phát triển`, "default");
  }

  const patchTaskEverywhere = useCallback((taskId: string, patch: Partial<TaskItem>) => {
    const apply = (list: TaskItem[]) => list.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
    setAllTasks(apply);
    setMyTasks(apply);
    setDeptTasks(apply);
  }, []);

  function handleToggleChecklist(task: TaskItem) {
    patchTaskEverywhere(task.id, { completed: true });
    updateTask(task.id, { is_completed: true, status: "Hoàn thành" }).catch(() => {
      patchTaskEverywhere(task.id, { completed: false });
      showToast("Cập nhật công việc thất bại", "danger");
    });
  }

  async function handleCreateTask(name: string, projectId: string) {
    try {
      await createTask({ project_id: projectId, name });
      const project = projects.find((p) => p.id === projectId) ?? null;
      const nextTree = await getCompaniesTree(companyId || undefined);
      setAllTasks(flattenTasks(nextTree));
      showToast(
        project ? `Đã thêm "${name}" vào ${project.name}. Gợi ý subtask AI sẽ có ở bản cập nhật sau.` : "Đã tạo công việc",
        "success"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không tạo được công việc", "danger");
    }
  }

  async function handleDecideProposal(proposal: Proposal, decision: "approved" | "rejected") {
    const snapshot = pendingProposals;
    setPendingProposals((prev) => prev.filter((p) => p.id !== proposal.id));
    try {
      await decideProposal(proposal.id, decision);
      showToast(
        decision === "approved" ? `Đã duyệt "${proposal.title}"` : `Đã từ chối "${proposal.title}"`,
        decision === "approved" ? "success" : "default"
      );
    } catch (err) {
      setPendingProposals(snapshot);
      showToast(err instanceof Error ? err.message : "Không xử lý được đề xuất", "danger");
    }
  }

  if (!companyId) {
    return (
      <AppShellPage initialNavId="tasks">
        <TaskHeader activeTab={topTab} onChangeTab={setTopTab} />
        <Panel>Bạn chưa thuộc công ty nào nên chưa thể xem công việc.</Panel>
      </AppShellPage>
    );
  }

  return (
    <AppShellPage initialNavId="tasks">
      <TaskHeader activeTab={topTab} onChangeTab={setTopTab} pendingApprovalsCount={pendingProposals.length} />

      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Đang tải dữ liệu từ máy chủ...
        </div>
      ) : topTab === "approvals" ? (
        <Panel title={`Đề xuất chờ duyệt (${pendingProposals.length})`}>
          <ProposalApprovalList
            proposals={pendingProposals}
            onApprove={(p) => handleDecideProposal(p, "approved")}
            onReject={(p) => handleDecideProposal(p, "rejected")}
            canApprove={canApproveProposals}
          />
        </Panel>
      ) : (
        <>
          <TaskGroupTabs active={group} onChange={setGroup} />

          <TaskChecklist
            tasks={checklistTasks}
            onToggle={handleToggleChecklist}
            onFlagProblem={() => showToast('Đánh dấu "Có vấn đề" đang được phát triển', "default")}
          />

          <QuickAddTask projects={projects} onCreate={handleCreateTask} />

          <TaskFiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            projects={projects}
            projectFilter={projectFilter}
            onProjectFilterChange={setProjectFilter}
          />

          <TaskFilterChips active={flagFilter} onSelect={handleSelectChip} />

          {groupLoading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              Đang tải dữ liệu từ máy chủ...
            </div>
          ) : (
            <TaskTable
              tasks={filteredTasks}
              onSelectTask={(task) => showToast(`Xem "${task.title}" trong trang Dự án → Phân công`, "default")}
              onFlag={() => showToast("Gắn cờ công việc đang được phát triển", "default")}
              onProblem={() => showToast('Đánh dấu "Có vấn đề" đang được phát triển', "default")}
              onAutomate={() => showToast("Tự động hoá bằng AI đang được phát triển", "default")}
            />
          )}
        </>
      )}
    </AppShellPage>
  );
}
