import { useState } from "react";
import { ViewMode } from "gantt-task-react";
import { AppShellPage } from "../layout/AppShellPage";
import { ProjectViewTabs, type ProjectViewMode } from "../features/projects/ProjectViewTabs";
import { ProjectSelector } from "../features/projects/ProjectSelector";
import { KanbanBoard } from "../features/projects/KanbanBoard";
import { ProjectGantt } from "../features/projects/ProjectGantt";
import { ProjectMindmap } from "../features/projects/ProjectMindmap";
import { ProjectTaskList } from "../features/projects/ProjectTaskList";
import { WorkspaceBrowser } from "../features/projects/Workspace/WorkspaceBrowser";
import { AssignmentTree } from "../features/projects/AssignmentTree";
import { useToast } from "../components/ui/Toast";
import { mockProjects } from "../mocks/projects";
import { projectTasks } from "../mocks/projectTasks";

export function ProjectsPage() {
  const [view, setView] = useState<ProjectViewMode>("folder");
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[0].id);
  const { showToast } = useToast();

  const selectedProject = mockProjects.find((p) => p.id === selectedProjectId) ?? mockProjects[0];
  const tasksOfSelected = projectTasks.filter((t) => t.projectId === selectedProject.id);

  return (
    <AppShellPage initialNavId="projects">
      <div className="page-head">
        <h1>Dự án</h1>
        <ProjectViewTabs view={view} onChangeView={setView} />
      </div>

      {view === "folder" && <WorkspaceBrowser projects={mockProjects} tasks={projectTasks} />}

      {view === "assignment" && <AssignmentTree />}

      {view !== "folder" && view !== "assignment" && (
        <>
          <ProjectSelector projects={mockProjects} selectedId={selectedProject.id} onChange={setSelectedProjectId} />

          {view === "kanban" && (
            <KanbanBoard
              tasks={tasksOfSelected}
              onSelectTask={(t) => showToast(`Xem chi tiết công việc: ${t.title}`, "default")}
            />
          )}
          {view === "timeline" && (
            <ProjectGantt
              tasks={tasksOfSelected}
              viewMode={ViewMode.Week}
              onSelectTask={(t) => showToast(`Xem chi tiết công việc: ${t.title}`, "default")}
            />
          )}
          {view === "roadmap" && (
            <ProjectGantt
              tasks={tasksOfSelected}
              viewMode={ViewMode.Month}
              onSelectTask={(t) => showToast(`Xem chi tiết công việc: ${t.title}`, "default")}
            />
          )}
          {view === "mindmap" && <ProjectMindmap project={selectedProject} tasks={tasksOfSelected} />}
          {view === "list" && (
            <ProjectTaskList
              tasks={tasksOfSelected}
              onSelectTask={(t) => showToast(`Xem chi tiết công việc: ${t.title}`, "default")}
            />
          )}
        </>
      )}
    </AppShellPage>
  );
}
