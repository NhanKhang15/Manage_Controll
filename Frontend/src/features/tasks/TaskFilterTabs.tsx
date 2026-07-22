export interface TaskFilterTabsProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  counts: Record<string, number>;
}

export function TaskFilterTabs({ activeTab, onChangeTab, counts }: TaskFilterTabsProps) {
  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "todo", label: "Cần làm" },
    { id: "in_progress", label: "Đang làm" },
    { id: "review", label: "Cần duyệt" },
    { id: "done", label: "Hoàn thành" },
  ];

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid var(--line-2)", paddingBottom: 8 }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id] ?? 0;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--brand)" : "var(--muted)",
              background: isActive ? "var(--brand-soft)" : "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: 12,
                padding: "1px 6px",
                borderRadius: 99,
                background: isActive ? "var(--brand)" : "var(--line-2)",
                color: isActive ? "#fff" : "var(--muted)",
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
