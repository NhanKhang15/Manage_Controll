import type { ProjectProgressItem } from "../../types/dashboard";

/**
 * ProjectProgressPanel
 * Panel "Tiến độ dự án" — thanh tiến độ từng dự án.
 * Thẻ HTML gốc: <div class=panel> chứa .dash-row với .pdot + .a-progress
 * CSS gốc tham chiếu: .panel, .dash-row, .pdot, .a-progress
 */
export interface ProjectProgressPanelProps {
  items: ProjectProgressItem[];
  href?: string;
}

export function ProjectProgressPanel({ items, href = "?page=projects" }: ProjectProgressPanelProps) {
  return (
    <div className="panel">
      <div className="panel-h">
        🗂️ Tiến độ dự án
        <a className="panel-link" href={href}>
          Sơ đồ ›
        </a>
      </div>
      {items.map((item) => (
        <div key={item.id} className="dash-row">
          <span className="pdot" style={{ background: item.color }} />
          <span className="dash-row-title">{item.title}</span>
          <span className="a-progress">
            <span style={{ width: `${item.percent}%`, background: item.color }} />
          </span>
          <span className="chip">{item.percent}%</span>
        </div>
      ))}
    </div>
  );
}
