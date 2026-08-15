import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useDebounce } from "../hooks/useDebounce";
import { getCompaniesTree, getDepartments, type DepartmentOption } from "../api/companies";
import { createTask, updateTask, getTasksList } from "../api/tasks";
import { listProposals, decideProposal, type Proposal } from "../api/proposals";
import {
  flattenProjects,
  fromFlatTask,
  type TaskItem,
  type ProjectOption,
  type TaskSortKey,
  type TaskSortDir,
} from "../features/tasks/types";

export function TasksPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const canApproveProposals = employee?.companies?.[0]?.can_approve_proposals ?? false;
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 10;

  const [checklistTasks, setChecklistTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const [searchParams] = useSearchParams();
  const [topTab, setTopTab] = useState<TaskTopTab>(searchParams.get("tab") === "approvals" ? "approvals" : "tasks");
  const [group, setGroup] = useState<TaskGroup>("all");
  const [flagFilter, setFlagFilter] = useState<TaskFlagFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [sortKey, setSortKey] = useState<TaskSortKey>("due_date");
  const [sortDir, setSortDir] = useState<TaskSortDir>("asc");
  const ordering = `${sortKey}_${sortDir}`;
  const [projectFilter, setProjectFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [pendingProposals, setPendingProposals] = useState<Proposal[]>([]);

  // Tải danh sách dự án, phòng ban & đề xuất chờ duyệt 1 lần ban đầu
  useEffect(() => {
    if (!companyId) return;
    Promise.all([
      getCompaniesTree(companyId),
      getDepartments(companyId),
      listProposals(companyId, "pending"),
      getTasksList("mine", { company_id: companyId, limit: 6, status: "Cần làm" }),
    ])
      .then(([tree, depts, proposals, mineRes]) => {
        setProjects(flattenProjects(tree));
        setDepartments(depts);
        setPendingProposals(proposals);
        setChecklistTasks(mineRes.results.map(fromFlatTask));
      })
      .catch(() => showToast("Không tải được thông tin dự án", "danger"));
  }, [companyId, showToast]);

  // Hàm fetch danh sách công việc chính với Phân trang (Limit & Offset)
  const fetchTasks = useCallback(
    async (targetOffset: number, isAppend: boolean) => {
      if (!companyId) return;
      if (isAppend) setLoadingMore(true);
      else setLoading(true);

      const endpoint = group === "all" ? "all" : group === "mine" ? "mine" : "department";
      try {
        const res = await getTasksList(endpoint, {
          company_id: companyId,
          search: debouncedSearch,
          ordering: ordering,
          project_id: projectFilter || undefined,
          department_id: departmentFilter || undefined,
          limit: LIMIT,
          offset: targetOffset,
        });

        const newItems = res.results.map(fromFlatTask);
        if (isAppend) {
          setTasks((prev) => [...prev, ...newItems]);
        } else {
          setTasks(newItems);
        }

        setTotalTasks(res.total);
        setHasMore(res.has_more);
        setOffset(targetOffset);
      } catch {
        showToast("Không tải được danh sách công việc", "danger");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [companyId, group, debouncedSearch, ordering, projectFilter, departmentFilter, showToast]
  );

  // Khi thay đổi bất kỳ bộ lọc nào (Group, Status, Sắp xếp, Search, Dự án) -> Reset offset về 0 và load mới 10 cái
  useEffect(() => {
    fetchTasks(0, false);
  }, [fetchTasks]);

  // Load thêm 10 task tiếp theo khi cuộn/bấm Load More
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    fetchTasks(offset + LIMIT, true);
  }, [fetchTasks, loadingMore, hasMore, offset]);

  // Tự động kích hoạt tải thêm khi cuộn xuống gần cuối trang (IntersectionObserver)
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "150px" }
    );

    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, loadingMore, handleLoadMore]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesFlag = flagFilter !== "overdue" || !!t.overdueDays;
      return matchesFlag;
    });
  }, [tasks, flagFilter]);

  function handleSort(key: TaskSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleSelectChip(chip: TaskFlagFilter) {
    if (chip === "all" || chip === "overdue") {
      setFlagFilter(chip);
      return;
    }
    const label = chip === "flag" ? "Gắn cờ" : chip === "problem" ? "Có vấn đề" : "AI tự động hoá được";
    showToast(`Lọc theo "${label}" đang được phát triển`, "default");
  }

  function handleToggleChecklist(task: TaskItem) {
    setChecklistTasks((prev) => prev.filter((t) => t.id !== task.id));
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t)));
    updateTask(task.id, { is_completed: true, status: "Hoàn thành" }).catch(() => {
      showToast("Cập nhật công việc thất bại", "danger");
    });
  }

  async function handleCreateTask(name: string, projectId: string) {
    try {
      await createTask({ project_id: projectId, name });
      fetchTasks(0, false);
      showToast("Đã tạo công việc thành công", "success");
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

      {topTab === "approvals" ? (
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
            departments={departments}
            departmentFilter={departmentFilter}
            onDepartmentFilterChange={setDepartmentFilter}
          />

          <TaskFilterChips active={flagFilter} onSelect={handleSelectChip} />

          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              Đang tải dữ liệu từ máy chủ...
            </div>
          ) : (
            <>
              <TaskTable
                tasks={filteredTasks}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                onSelectTask={(task) => showToast(`Xem "${task.title}" trong trang Dự án → Phân công`, "default")}
                onFlag={() => showToast("Gắn cờ công việc đang được phát triển", "default")}
                onProblem={() => showToast('Đánh dấu "Có vấn đề" đang được phát triển', "default")}
                onAutomate={() => showToast("Tự động hoá bằng AI đang được phát triển", "default")}
              />

              <div ref={observerTargetRef} style={{ height: 20, margin: "10px 0" }} />

              {hasMore && (
                <div style={{ textAlign: "center", margin: "10px 0 30px 0" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    style={{ padding: "10px 24px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}
                  >
                    {loadingMore ? "Đang tự động tải thêm..." : `Tải thêm 10 công việc (Đã hiện ${tasks.length}/${totalTasks})`}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </AppShellPage>
  );
}
