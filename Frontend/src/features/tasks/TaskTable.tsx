import type { TaskMockItem } from "../../mocks/tasks";
import { Chip } from "../../components/ui/Chip";
import { Avatar } from "../../components/ui/Avatar";
import { Panel } from "../../components/ui/Panel";

export interface TaskTableProps {
  tasks: TaskMockItem[];
  onSelectTask?: (task: TaskMockItem) => void;
}

const STATUS_VARIANT: Record<string, "default" | "todo" | "in_progress" | "done"> = {
  todo: "todo",
  in_progress: "in_progress",
  review: "in_progress",
  done: "done",
};

const STATUS_LABEL: Record<string, string> = {
  todo: "Cần làm",
  in_progress: "Đang làm",
  review: "Cần duyệt",
  done: "Hoàn thành",
};

export function TaskTable({ tasks, onSelectTask }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <Panel>
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>
          🎉 Không có công việc nào trong danh mục này.
        </div>
      </Panel>
    );
  }

  return (
    <Panel style={{ padding: 0, overflow: "hidden" }}>
      <table className="task-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--line-2)", color: "var(--muted)", fontWeight: 600 }}>
            <th style={{ padding: "12px 16px" }}>Mã</th>
            <th style={{ padding: "12px 16px" }}>Tên công việc</th>
            <th style={{ padding: "12px 16px" }}>Dự án</th>
            <th style={{ padding: "12px 16px" }}>Người thực hiện</th>
            <th style={{ padding: "12px 16px" }}>Hạn chót</th>
            <th style={{ padding: "12px 16px" }}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => onSelectTask?.(task)}
              style={{ borderBottom: "1px solid var(--line-2)", cursor: "pointer", transition: "background 0.15s" }}
            >
              <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--brand)" }}>{task.code}</td>
              <td style={{ padding: "12px 16px", fontWeight: 600 }}>{task.title}</td>
              <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{task.project}</td>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={task.assignee.name} size={24} />
                  <span>{task.assignee.name}</span>
                </div>
              </td>
              <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{task.dueDate}</td>
              <td style={{ padding: "12px 16px" }}>
                <Chip label={STATUS_LABEL[task.status] || task.status} variant={STATUS_VARIANT[task.status] || "default"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
