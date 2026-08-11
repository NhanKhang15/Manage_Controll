import type { ProjectNode } from "./types";

/**
 * ProjectSelector
 * Chọn dự án để xem chi tiết (Kanban/Timeline/Lộ trình/Mindmap/Danh sách).
 */
export interface ProjectSelectorProps {
  projects: ProjectNode[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function ProjectSelector({ projects, selectedId, onChange }: ProjectSelectorProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0" }}>
      <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>Dự án:</span>
      <select
        className="ai-model-sel"
        style={{ flex: "none", minWidth: 260 }}
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
