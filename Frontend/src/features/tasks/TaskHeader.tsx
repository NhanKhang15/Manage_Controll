export type TaskTopTab = "tasks" | "approvals";

export interface TaskHeaderProps {
  activeTab: TaskTopTab;
  onChangeTab: (tab: TaskTopTab) => void;
  pendingApprovalsCount?: number;
}

export function TaskHeader({ activeTab, onChangeTab, pendingApprovalsCount = 0 }: TaskHeaderProps) {
  return (
    <div className="page-head">
      <h1>Công việc</h1>
      <div className="tabs">
        <button type="button" className={`tab${activeTab === "tasks" ? " on" : ""}`} onClick={() => onChangeTab("tasks")}>
          Công việc
        </button>
        <button type="button" className={`tab${activeTab === "approvals" ? " on" : ""}`} onClick={() => onChangeTab("approvals")}>
          Chờ duyệt
          {pendingApprovalsCount > 0 && <span className="tab-badge">{pendingApprovalsCount}</span>}
        </button>
      </div>
    </div>
  );
}
