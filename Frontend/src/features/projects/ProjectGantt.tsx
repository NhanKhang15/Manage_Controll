import { Gantt, ViewMode, type Task as GanttTask } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import type { ProjectTaskItem } from "../../mocks/projectTasks";

const STATUS_COLOR: Record<ProjectTaskItem["status"], string> = {
  todo: "#AEB6C4",
  in_progress: "#F59E0B",
  review: "#8B5CF6",
  done: "#10B981",
};

/**
 * ProjectGantt
 * Bọc gantt-task-react — dùng chung cho cả tab "Timeline" (viewMode=Week) và
 * "Lộ trình" (viewMode=Month) theo yêu cầu dùng gantt-task-react cho 2 view này.
 * CSS: .vela-gantt (theme màu chữ theo design tokens)
 */
export interface ProjectGanttProps {
  tasks: ProjectTaskItem[];
  viewMode: ViewMode;
  onSelectTask?: (task: ProjectTaskItem) => void;
}

export function ProjectGantt({ tasks, viewMode, onSelectTask }: ProjectGanttProps) {
  if (tasks.length === 0) {
    return <div className="mini-empty">Chưa có công việc nào trong dự án này.</div>;
  }

  const ganttTasks: GanttTask[] = tasks.map((t) => ({
    id: t.id,
    type: "task",
    name: t.title,
    start: new Date(t.start),
    end: new Date(t.end),
    progress: t.progress,
    styles: { progressColor: STATUS_COLOR[t.status], backgroundColor: `${STATUS_COLOR[t.status]}55` },
  }));

  return (
    <div className="vela-gantt">
      <Gantt
        tasks={ganttTasks}
        viewMode={viewMode}
        listCellWidth="220px"
        columnWidth={viewMode === ViewMode.Month ? 110 : 65}
        locale="vi"
        onClick={(task) => {
          const original = tasks.find((t) => t.id === task.id);
          if (original) onSelectTask?.(original);
        }}
      />
    </div>
  );
}
