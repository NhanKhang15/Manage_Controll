import { useState } from "react";
import { Avatar } from "../../components/ui/Avatar";
import { TASK_STATUSES, type ProjectTaskNode, type TaskStatus } from "./types";

/**
 * KanbanBoard
 * Kéo thẻ giữa cột để đổi trạng thái thật (native HTML5 drag & drop) — %
 * dự án tự cập nhật (BE tính lại progress_percent sau khi đổi status).
 * CSS: .kanban-board, .kanban-col, .kanban-card
 */
export interface KanbanBoardProps {
  tasks: ProjectTaskNode[];
  onSelectTask?: (task: ProjectTaskNode) => void;
  onChangeStatus: (taskId: string, status: TaskStatus) => void;
}

export function KanbanBoard({ tasks, onSelectTask, onChangeStatus }: KanbanBoardProps) {
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  return (
    <div className="kanban-board">
      {TASK_STATUSES.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col);
        return (
          <div
            key={col}
            className="kanban-col"
            style={dragOverCol === col ? { background: "var(--brand-soft)", borderRadius: 12 } : undefined}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(col);
            }}
            onDragLeave={() => setDragOverCol((c) => (c === col ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverCol(null);
              const taskId = e.dataTransfer.getData("text/task-id");
              if (taskId) onChangeStatus(taskId, col);
            }}
          >
            <div className="kanban-col-head">
              {col} <span className="kanban-col-count">{colTasks.length}</span>
            </div>
            {colTasks.map((task) => (
              <div
                key={task.id}
                className="kanban-card"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/task-id", task.id)}
                onClick={() => onSelectTask?.(task)}
              >
                <div className="kanban-card-title">
                  {task.isMilestone && "🚩 "}
                  {task.title}
                </div>
                {task.progressPercent !== null && (
                  <div className="a-progress" style={{ width: "100%", marginTop: 8 }}>
                    <span style={{ width: `${task.progressPercent}%`, background: "var(--brand)" }} />
                  </div>
                )}
                <div className="kanban-card-foot">
                  {(task.picName ?? task.assigneeNames[0]) && <Avatar name={task.picName ?? task.assigneeNames[0]} size={22} />}
                  <span className="muted" style={{ fontSize: 12 }}>
                    {task.dueDate ?? ""}
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
