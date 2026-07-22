import type { ActivityItem } from "../../types/dashboard";

/**
 * ActivityTimeline
 * Panel "Hoạt động gần đây" — dòng thời gian hoạt động mới nhất, chiếm full
 * chiều rộng (.dash-wide) trong .dash-grid.
 * Thẻ HTML gốc: <div class="panel dash-wide"> chứa .act-row
 * CSS gốc tham chiếu: .panel, .dash-wide, .act-row, .mini-ava
 */
export interface ActivityTimelineProps {
  items: ActivityItem[];
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <div className="panel dash-wide">
      <div className="panel-h">🕑 Hoạt động gần đây</div>
      {items.map((item) => (
        <div key={item.id} className="act-row">
          <span className="mini-ava" style={{ background: item.avatarBg, color: item.avatarColor }}>
            {item.initials}
          </span>
          <span className="act-body">
            <b>{item.name}</b> {item.action} · <span className="muted">{item.detail}</span>
          </span>
          <span className="act-time">{item.time}</span>
        </div>
      ))}
    </div>
  );
}
