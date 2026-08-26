import { Panel } from "../../components/ui/Panel";
import { Chip } from "../../components/ui/Chip";
import { Avatar } from "../../components/ui/Avatar";
import type { ProjectTaskNode } from "./types";

const STATUS_VARIANT: Record<string, "default" | "todo" | "in_progress" | "done"> = {
  "Ý tưởng": "default",
  "Cần làm": "todo",
  "Đang làm": "in_progress",
  "Hoàn thành": "done",
};

/**
 * ProjectTaskList
 * Bảng danh sách công việc phẳng của 1 dự án (giữ thụt lề theo parentId) —
 * view "▤ Danh sách".
 */
export interface ProjectTaskListProps {
  tasks: ProjectTaskNode[];
  onSelectTask?: (task: ProjectTaskNode) => void;
}

export function ProjectTaskList({ tasks, onSelectTask }: ProjectTaskListProps) {
  if (tasks.length === 0) {
    return (
      <Panel>
        <div className="mini-empty">Chưa có công việc nào trong dự án này.</div>
      </Panel>
    );
  }

  return (
    <Panel style={{ padding: 0, overflow: "hidden" }}>
      <table className="task-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--line-2)", color: "var(--muted)", fontWeight: 600 }}>
            <th style={{ padding: "12px 16px" }}>Công việc</th>
            <th style={{ padding: "12px 16px" }}>Người phụ trách</th>
            <th style={{ padding: "12px 16px" }}>Hạn</th>
            <th style={{ padding: "12px 16px" }}>Tiến độ</th>
            <th style={{ padding: "12px 16px" }}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} onClick={() => onSelectTask?.(task)} style={{ borderBottom: "1px solid var(--line-2)", cursor: "pointer" }}>
              <td style={{ padding: "12px 16px", fontWeight: 600, paddingLeft: task.parentId ? 32 : 16 }}>
                {task.parentId ? "↳ " : ""}
                {task.isMilestone ? "🚩 " : ""}
                {task.title}
              </td>
              <td style={{ padding: "12px 16px" }}>
                {task.picName ?? task.assigneeNames[0] ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={(task.picName ?? task.assigneeNames[0]) as string} size={22} />
                    <span>{task.picName ?? task.assigneeNames[0]}</span>
                  </div>
                ) : (
                  <span className="muted">Chưa gán</span>
                )}
              </td>
              <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{task.dueDate ?? "—"}</td>
              <td style={{ padding: "12px 16px" }}>{task.progressPercent !== null ? `${task.progressPercent}%` : "—"}</td>
              <td style={{ padding: "12px 16px" }}>
                <Chip label={task.status} variant={STATUS_VARIANT[task.status]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
