import type { ProjectMockItem } from "../../mocks/projects";
import { Panel } from "../../components/ui/Panel";
import { Chip } from "../../components/ui/Chip";
import { Avatar } from "../../components/ui/Avatar";

export interface ProjectGridProps {
  projects: ProjectMockItem[];
  onSelectProject?: (project: ProjectMockItem) => void;
}

const STATUS_VARIANT: Record<string, "default" | "todo" | "in_progress" | "done"> = {
  running: "in_progress",
  completed: "done",
  delayed: "todo",
};

const STATUS_LABEL: Record<string, string> = {
  running: "Đang chạy",
  completed: "Hoàn thành",
  delayed: "Chậm tiến độ",
};

export function ProjectGrid({ projects, onSelectProject }: ProjectGridProps) {
  return (
    <div className="dash-grid">
      {projects.map((p) => (
        <Panel key={p.id} style={{ cursor: "pointer" }}>
          <div onClick={() => onSelectProject?.(p)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", textTransform: "uppercase" }}>
                  {p.code}
                </span>
                <h3 style={{ margin: "4px 0 6px", fontSize: 16, fontWeight: 700 }}>{p.name}</h3>
              </div>
              <Chip label={STATUS_LABEL[p.status] || p.status} variant={STATUS_VARIANT[p.status] || "default"} />
            </div>

            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px", lineHeight: 1.4 }}>{p.description}</p>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>
                <span>Tiến độ</span>
                <span>{p.progress}%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--line-2)", borderRadius: 99, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${p.progress}%`,
                    background: p.progress === 100 ? "var(--ok)" : p.status === "delayed" ? "var(--danger)" : "var(--brand)",
                    borderRadius: 99,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 10,
                borderTop: "1px solid var(--line-2)",
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Avatar name={p.lead} size={22} />
                <span style={{ fontWeight: 500 }}>{p.lead}</span>
              </div>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Hạn: {p.deadline}</span>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}
