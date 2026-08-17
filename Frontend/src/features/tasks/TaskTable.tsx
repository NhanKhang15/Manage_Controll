import { Chip } from "../../components/ui/Chip";
import type { TaskItem, TaskSortDir, TaskSortKey } from "./types";

export interface TaskTableProps {
  tasks: TaskItem[];
  sortKey: TaskSortKey;
  sortDir: TaskSortDir;
  onSort: (key: TaskSortKey) => void;
  onSelectTask?: (task: TaskItem) => void;
  onFlag?: (task: TaskItem) => void;
  onProblem?: (task: TaskItem) => void;
  onAutomate?: (task: TaskItem) => void;
}

function SortableTh({
  label,
  sortKey,
  activeKey,
  activeDir,
  onSort,
  className,
}: {
  label: string;
  sortKey: TaskSortKey;
  activeKey: TaskSortKey;
  activeDir: TaskSortDir;
  onSort: (key: TaskSortKey) => void;
  className?: string;
}) {
  const active = sortKey === activeKey;
  return (
    <th className={className}>
      <button type="button" className={`th-sort-btn${active ? " active" : ""}`} onClick={() => onSort(sortKey)}>
        {label}
        <span className="th-sort-arrow">{active ? (activeDir === "asc" ? "▲" : "▼") : ""}</span>
      </button>
    </th>
  );
}

function AlertTag({ task }: { task: TaskItem }) {
  if (task.isProblem) return <span className="alert-tag alert-danger" style={{ background: "#FEF2F2", color: "#EF4444" }}>⚠️ Có vấn đề</span>;
  if (task.completed) return <span className="alert-tag alert-ok">✓ Hoàn tất</span>;
  if (task.overdueDays) return <span className="alert-tag alert-danger">🔴 Trễ hạn</span>;
  if (task.isFlagged) return <span className="alert-tag alert-warning" style={{ background: "#FFFBEB", color: "#D97706" }}>🚩 Gắn cờ</span>;
  return <span className="alert-tag alert-muted">—</span>;
}

function DueCell({ task }: { task: TaskItem }) {
  if (task.overdueDays) return <Chip label={`Trễ ${task.overdueDays} ngày`} variant="late" />;
  if (task.dueDateLabel) return <span className="muted">{task.dueDateLabel}</span>;
  return <span className="muted">—</span>;
}

export function TaskTable({ tasks, sortKey, sortDir, onSort, onSelectTask, onFlag, onProblem, onAutomate }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="table-wrap">
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>
          🎉 Không có công việc nào trong danh mục này.
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <SortableTh label="Việc" sortKey="name" activeKey={sortKey} activeDir={sortDir} onSort={onSort} className="col-title" />
            <SortableTh label="Dự án" sortKey="project" activeKey={sortKey} activeDir={sortDir} onSort={onSort} className="col-proj" />
            <SortableTh label="Bộ phận" sortKey="department" activeKey={sortKey} activeDir={sortDir} onSort={onSort} className="col-dept" />
            <SortableTh label="Cảnh báo" sortKey="alert" activeKey={sortKey} activeDir={sortDir} onSort={onSort} className="col-alert" />
            <SortableTh label="% hoàn thành" sortKey="progress" activeKey={sortKey} activeDir={sortDir} onSort={onSort} className="col-prog" />
            <SortableTh label="Người phụ trách" sortKey="pic" activeKey={sortKey} activeDir={sortDir} onSort={onSort} className="col-assignee" />
            <SortableTh label="Hạn" sortKey="due_date" activeKey={sortKey} activeDir={sortDir} onSort={onSort} className="col-due" />
            <th className="col-actions">Xử lý</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="task-row" title="Xem chi tiết công việc" onClick={() => onSelectTask?.(task)}>
              <td className="t-title">{task.title}</td>
              <td className="t-proj">
                {task.projectName ? (
                  <span className="t-proj-inner">
                    <span className="pdot" style={{ background: task.projectColor }} />
                    <span>{task.projectName}</span>
                  </span>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
              <td className="t-dept">
                {task.department ? <span className="dept-tag">{task.department}</span> : <span className="muted">—</span>}
              </td>
              <td className="t-alert">
                <AlertTag task={task} />
              </td>
              <td className="t-prog">
                <div className="tprog">
                  <div className="tprog-bar">
                    <i
                      style={{
                        width: task.completed ? "100%" : "0%",
                        background: task.completed ? "#10B981" : "#F59E0B",
                      }}
                    />
                  </div>
                  <span className="tprog-num">{task.completed ? 100 : 0}%</span>
                </div>
              </td>
              <td className="t-assignee-col">
                {task.assigneeName ? (
                  <div className="t-assignee">
                    <span className="mini-ava" style={{ background: `${task.projectColor}22`, color: task.projectColor }}>
                      {task.assigneeName.slice(0, 1).toUpperCase()}
                    </span>
                    <span>{task.assigneeName}</span>
                  </div>
                ) : (
                  <span className="muted">Chưa gán</span>
                )}
              </td>
              <td className="t-due">
                <DueCell task={task} />
              </td>
              <td className="t-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className={`t-flagbtn${task.isFlagged ? " active-flag" : ""}`}
                  title={task.isFlagged ? "Gỡ gắn cờ" : "Gắn cờ để xử lý"}
                  onClick={() => onFlag?.(task)}
                >
                  🚩
                </button>
                <button
                  type="button"
                  className={`t-flagbtn prob${task.isProblem ? " active-prob" : ""}`}
                  title={task.isProblem ? "Gỡ đánh dấu vấn đề" : "Đánh dấu đang có vấn đề"}
                  onClick={() => onProblem?.(task)}
                >
                  ⚠️
                </button>
                <button
                  type="button"
                  className={`t-autobtn${task.canAutomate ? " active-auto" : ""}`}
                  title="Việc đơn giản/định kỳ — bấm để AI tạo luồng tự động"
                  onClick={() => onAutomate?.(task)}
                >
                  🤖 {task.canAutomate ? "Đã bật tự động" : "Tự động hoá"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

