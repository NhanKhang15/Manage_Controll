import { Avatar } from "../../components/ui/Avatar";
import type { ProjectTaskItem } from "../../mocks/projectTasks";

const COLUMNS: { status: ProjectTaskItem["status"]; label: string }[] = [
  { status: "todo", label: "Cần làm" },
  { status: "in_progress", label: "Đang làm" },
  { status: "review", label: "Cần duyệt" },
  { status: "done", label: "Hoàn thành" },
];

/**
 * KanbanBoard
 * Bảng Kanban theo trạng thái công việc trong 1 dự án. Không dùng thư viện
 * ngoài (chỉ Gantt/Mindmap/Calendar mới bắt buộc dùng thư viện chỉ định).
 * CSS: .kanban-board, .kanban-col, .kanban-card (mới, không có trong HTML gốc)
 */
export interface KanbanBoardProps {
  tasks: ProjectTaskItem[];
  onSelectTask?: (task: ProjectTaskItem) => void;
}

export function KanbanBoard({ tasks, onSelectTask }: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="kanban-col">
            <div className="kanban-col-head">
              {col.label} <span className="kanban-col-count">{colTasks.length}</span>
            </div>
            {colTasks.map((task) => (
              <div key={task.id} className="kanban-card" onClick={() => onSelectTask?.(task)}>
                <div className="kanban-card-title">{task.title}</div>
                <div className="a-progress" style={{ width: "100%", marginTop: 8 }}>
                  <span style={{ width: `${task.progress}%`, background: "var(--brand)" }} />
                </div>
                <div className="kanban-card-foot">
                  <Avatar name={task.assignee} size={22} />
                  <span className="muted" style={{ fontSize: 12 }}>
                    {task.end}
                  </span>
                </div>
              </div>
            ))}
            {colTasks.length === 0 && <div className="mini-empty">Không có việc</div>}
          </div>
        );
      })}
    </div>
  );
}
