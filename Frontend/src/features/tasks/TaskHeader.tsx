export type TaskTopTab = "tasks" | "approvals";

export interface TaskHeaderProps {
  activeTab: TaskTopTab;
  onChangeTab: (tab: TaskTopTab) => void;
  pendingApprovalsCount?: number;
  onOpenCreateTask?: () => void;
}

export function TaskHeader({
  activeTab,
  onChangeTab,
  pendingApprovalsCount = 0,
  onOpenCreateTask,
}: TaskHeaderProps) {
  return (
    <div
      className="page-head"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <h1 style={{ margin: 0 }}>Công việc</h1>
        <div className="tabs">
          <button
            type="button"
            className={`tab${activeTab === "tasks" ? " on" : ""}`}
            onClick={() => onChangeTab("tasks")}
          >
            Công việc
          </button>
          <button
            type="button"
            className={`tab${activeTab === "approvals" ? " on" : ""}`}
            onClick={() => onChangeTab("approvals")}
          >
            Chờ duyệt
            {pendingApprovalsCount > 0 && <span className="tab-badge">{pendingApprovalsCount}</span>}
          </button>
        </div>
      </div>

      {onOpenCreateTask && (
        <button
          type="button"
          onClick={onOpenCreateTask}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
            color: "#FFFFFF",
            fontWeight: "600",
            fontSize: "13.5px",
            border: "none",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span>＋</span>
          <span>Tạo công việc</span>
        </button>
      )}
    </div>
  );
}
