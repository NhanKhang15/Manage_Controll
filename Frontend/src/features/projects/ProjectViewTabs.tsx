export type ProjectViewMode = "folder" | "kanban" | "timeline" | "roadmap" | "mindmap" | "list";

const VIEWS: { key: ProjectViewMode; label: string }[] = [
  { key: "folder", label: "🗂️ Thư mục" },
  { key: "kanban", label: "📋 Kanban" },
  { key: "timeline", label: "📅 Timeline" },
  { key: "roadmap", label: "🗺️ Lộ trình" },
  { key: "mindmap", label: "🧠 Mindmap" },
  { key: "list", label: "▤ Danh sách" },
];

/**
 * ProjectViewTabs
 * 6 tab chế độ xem dự án — khớp nguyên bản .tabs trong HTML gốc trang Dự án
 * (view=folder|kanban|timeline|roadmap|mindmap|list).
 * CSS gốc tham chiếu: .tabs, .tab (+ .on)
 */
export interface ProjectViewTabsProps {
  view: ProjectViewMode;
  onChangeView: (view: ProjectViewMode) => void;
}

export function ProjectViewTabs({ view, onChangeView }: ProjectViewTabsProps) {
  return (
    <div className="tabs">
      {VIEWS.map((v) => (
        <button
          key={v.key}
          type="button"
          className={`tab${view === v.key ? " on" : ""}`}
          onClick={() => onChangeView(v.key)}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
