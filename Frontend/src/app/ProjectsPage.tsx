import { useEffect, useState } from "react";
import { ViewMode } from "gantt-task-react";
import { AppShellPage } from "../layout/AppShellPage";
import { ProjectViewTabs, type ProjectViewMode } from "../features/projects/ProjectViewTabs";
import { CompanySelector } from "../features/projects/CompanySelector";
import { ProjectSelector } from "../features/projects/ProjectSelector";
import { KanbanBoard } from "../features/projects/KanbanBoard";
import { ProjectGantt } from "../features/projects/ProjectGantt";
import { ProjectTimeline } from "../features/projects/ProjectTimeline";
import { ProjectMindmap } from "../features/projects/ProjectMindmap";
import { ProjectTaskList } from "../features/projects/ProjectTaskList";
import { WorkspaceBrowser } from "../features/projects/Workspace/WorkspaceBrowser";
import { AssignmentTree } from "../features/projects/AssignmentTree";
import { Panel } from "../components/ui/Panel";
import { useToast } from "../components/ui/Toast";
import { getCompaniesTree, getCompanyOptions, type NodeType } from "../api/companies";
import { getEmployees, type EmployeeListItem } from "../api/employees";
import { createProject } from "../api/projects";
import { createTask, updateTask, type UpdateTaskData } from "../api/tasks";
import { toProjectNodes, flattenProjectTasks, type ProjectNode, type ProjectTaskNode, type TaskStatus } from "../features/projects/types";
import type { CompanyOption } from "../features/projects/CompanySelector";

export function ProjectsPage() {
  const { showToast } = useToast();

  const [view, setView] = useState<ProjectViewMode>("folder");
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [projects, setProjects] = useState<ProjectNode[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // Danh sách công ty cho dropdown: lấy danh sách phẳng siêu nhẹ qua getCompanyOptions()
  useEffect(() => {
    getCompanyOptions()
      .then((comps) => {
        const roots = comps.filter((c) => !c.parent_id).map((c) => ({ id: c.id, name: c.name }));
        const list = roots.length > 0 ? roots : comps.map((c) => ({ id: c.id, name: c.name }));
        setCompanies(list);
        setCompanyId((prev) => prev || list[0]?.id || "");
      })
      .catch(() => showToast("Không tải được danh sách công ty", "danger"));
  }, [showToast]);

  function handleChangeCompany(id: string) {
    setCompanyId(id);
    setProjects([]); // buộc refetch() coi đây là lần tải đầu cho công ty mới -> hiện màn "Đang tải..."
  }

  function refetch() {
    if (!companyId) return;
    // Chỉ hiện màn "Đang tải..." lần đầu — refetch sau mỗi lần cập nhật task
    // (đổi status/PIC/độ khó...) không được unmount WorkspaceBrowser, nếu
    // không sẽ mất vị trí đang chọn (selectedProjectId/taskPath) mỗi lần sửa.
    if (projects.length === 0) setLoading(true);
    Promise.all([getCompaniesTree(companyId), getEmployees(companyId)])
      .then(([tree, emps]) => {
        const nodes = toProjectNodes(tree, companyId);
        setProjects(nodes);
        setEmployees(emps);
        setSelectedProjectId((prev) => (nodes.some((p) => p.id === prev) ? prev : (nodes[0]?.id ?? "")));
      })
      .catch(() => showToast("Không tải được dữ liệu dự án", "danger"))
      .finally(() => setLoading(false));
  }

  useEffect(refetch, [companyId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreateProject(name: string) {
    try {
      await createProject({ company_id: companyId, name });
      showToast("Đã tạo dự án", "success");
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không tạo được dự án", "danger");
    }
  }

  async function handleCreateTask(projectId: string, parentId: string | null, name: string) {
    try {
      if (parentId) await createTask({ parent_id: parentId, name });
      else await createTask({ project_id: projectId, name });
      showToast("Đã tạo công việc", "success");
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không tạo được công việc", "danger");
    }
  }

  async function handleUpdateTask(taskId: string, patch: UpdateTaskData) {
    try {
      await updateTask(taskId, patch);
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Cập nhật thất bại", "danger");
    }
  }

  function handleChangeStatus(taskId: string, s: TaskStatus) {
    handleUpdateTask(taskId, { status: s, is_completed: s === "Hoàn thành" });
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? projects[0] ?? null;
  const flatTasks: ProjectTaskNode[] = selectedProject ? flattenProjectTasks(selectedProject.tasks) : [];
  const selectedCompanyName = companies.find((c) => c.id === companyId)?.name ?? "";

  function handleSelectTask(t: ProjectTaskNode) {
    showToast(`Xem chi tiết công việc: ${t.title}`, "default");
  }

  return (
    <AppShellPage initialNavId="projects">
      <div className="page-head">
        <h1>Dự án</h1>
        <ProjectViewTabs view={view} onChangeView={setView} />
      </div>

      <CompanySelector companies={companies} selectedId={companyId} onChange={handleChangeCompany} />

      {!companyId ? (
        <Panel>Bạn chưa thuộc công ty nào.</Panel>
      ) : loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Đang tải dữ liệu từ máy chủ...
        </div>
      ) : (
        <>
          {view === "folder" && (
            <WorkspaceBrowser
              companyId={companyId}
              companyName={selectedCompanyName}
              projects={projects}
              employees={employees}
              onCreateProject={handleCreateProject}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onRefetch={refetch}
            />
          )}

          {view === "assignment" && <AssignmentTree />}

          {/* Mindmap/Timeline: toàn bộ dự án của công ty trong 1 sơ đồ/bảng, không cần chọn từng dự án. */}
          {view === "mindmap" &&
            (projects.length === 0 ? (
              <Panel>Công ty chưa có dự án nào.</Panel>
            ) : (
              <ProjectMindmap companyName={selectedCompanyName} projects={projects} onSelectTask={handleSelectTask} />
            ))}

          {view === "timeline" &&
            (projects.length === 0 ? (
              <Panel>Công ty chưa có dự án nào.</Panel>
            ) : (
              <ProjectTimeline projects={projects} onSelectTask={handleSelectTask} />
            ))}

          {(view === "kanban" || view === "roadmap" || view === "list") && (
            <>
              {projects.length === 0 ? (
                <Panel>Công ty chưa có dự án nào.</Panel>
              ) : (
                <>
                  <ProjectSelector projects={projects} selectedId={selectedProject?.id ?? ""} onChange={setSelectedProjectId} />

                  {view === "kanban" && <KanbanBoard tasks={flatTasks} onSelectTask={handleSelectTask} onChangeStatus={handleChangeStatus} />}
                  {view === "roadmap" && <ProjectGantt tasks={flatTasks} viewMode={ViewMode.Month} onSelectTask={handleSelectTask} />}
                  {view === "list" && <ProjectTaskList tasks={flatTasks} onSelectTask={handleSelectTask} />}
                </>
              )}
            </>
          )}
        </>
      )}
    </AppShellPage>
  );
}
