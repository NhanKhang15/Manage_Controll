import { useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { ProjectHeader } from "../features/projects/ProjectHeader";
import { ProjectKpiGrid } from "../features/projects/ProjectKpiGrid";
import { ProjectGrid } from "../features/projects/ProjectGrid";
import { useToast } from "../components/ui/Toast";
import { mockProjects, type ProjectMockItem } from "../mocks/projects";

export function ProjectsPage() {
  const [projects] = useState<ProjectMockItem[]>(mockProjects);
  const { showToast } = useToast();

  const runningCount = projects.filter((p) => p.status === "running").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const delayedCount = projects.filter((p) => p.status === "delayed").length;

  return (
    <AppShellPage initialNavId="projects">
      <ProjectHeader onCreateProject={() => showToast("Đang mở form tạo dự án mới...", "default")} />
      <ProjectKpiGrid runningCount={runningCount} completedCount={completedCount} delayedCount={delayedCount} />
      <ProjectGrid
        projects={projects}
        onSelectProject={(proj) => showToast(`Xem chi tiết dự án: ${proj.name}`, "default")}
      />
    </AppShellPage>
  );
}
