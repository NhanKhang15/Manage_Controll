import { Panel } from "../../components/ui/Panel";
import { Chip } from "../../components/ui/Chip";
import { Avatar } from "../../components/ui/Avatar";
import type { ProjectTaskItem } from "../../mocks/projectTasks";

const STATUS_VARIANT: Record<ProjectTaskItem["status"], "default" | "todo" | "in_progress" | "done"> = {
  todo: "todo",
  in_progress: "in_progress",
  review: "in_progress",
  done: "done",
};

const STATUS_LABEL: Record<ProjectTaskItem["status"], string> = {
  todo: "Cần làm",
  in_progress: "Đang làm",
  review: "Cần duyệt",
  done: "Hoàn thành",
};

/**
 * ProjectTaskList
 * Bảng danh sách công việc phẳng của 1 dự án — view "▤ Danh sách".
 */
export interface ProjectTaskListProps {
  tasks: ProjectTaskItem[];
  onSelectTask?: (task: ProjectTaskItem) => void;
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
            <th style={{ padding: "12px 16px" }}>Bắt đầu</th>
            <th style={{ padding: "12px 16px" }}>Kết thúc</th>
            <th style={{ padding: "12px 16px" }}>Tiến độ</th>
            <th style={{ padding: "12px 16px" }}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} onClick={() => onSelectTask?.(task)} style={{ borderBottom: "1px solid var(--line-2)", cursor: "pointer" }}>
              <td style={{ padding: "12px 16px", fontWeight: 600, paddingLeft: task.parentId ? 32 : 16 }}>
                {task.parentId ? "↳ " : ""}
                {task.title}
              </td>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={task.assignee} size={22} />
                  <span>{task.assignee}</span>
                </div>
              </td>
              <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{task.start}</td>
              <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{task.end}</td>
              <td style={{ padding: "12px 16px" }}>{task.progress}%</td>
              <td style={{ padding: "12px 16px" }}>
                <Chip label={STATUS_LABEL[task.status]} variant={STATUS_VARIANT[task.status]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
