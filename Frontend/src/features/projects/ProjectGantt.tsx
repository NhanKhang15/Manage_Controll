import { Gantt, ViewMode, type Task as GanttTask } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { STATUS_COLOR, type ProjectTaskNode } from "./types";

/**
 * ProjectGantt
 * Bọc gantt-task-react — dùng chung cho cả tab "Timeline" (viewMode=Week) và
 * "Lộ trình" (viewMode=Month). Không có cột "ngày bắt đầu" thật trong DB nên
 * dùng created_at làm mốc bắt đầu (ước lượng hợp lý, không bịa).
 * CSS: .vela-gantt (theme màu chữ theo design tokens)
 */
export interface ProjectGanttProps {
  tasks: ProjectTaskNode[];
  viewMode: ViewMode;
  onSelectTask?: (task: ProjectTaskNode) => void;
}

export function ProjectGantt({ tasks, viewMode, onSelectTask }: ProjectGanttProps) {
  if (tasks.length === 0) {
    return <div className="mini-empty">Chưa có công việc nào trong dự án này.</div>;
  }

  const ganttTasks: GanttTask[] = tasks.map((t) => {
    const start = new Date(t.createdAt);
    const end = t.dueDate ? new Date(t.dueDate) : new Date(start.getTime() + 86400000);
    return {
      id: t.id,
      type: "task",
      name: t.title,
      start,
      end: end > start ? end : new Date(start.getTime() + 86400000),
      progress: t.progressPercent ?? 0,
      styles: { progressColor: STATUS_COLOR[t.status], backgroundColor: `${STATUS_COLOR[t.status]}55` },
    };
  });

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
