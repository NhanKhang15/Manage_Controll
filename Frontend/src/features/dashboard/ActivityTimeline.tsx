import { Avatar } from "../../components/ui/Avatar";
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
  if (items.length === 0) {
    return (
      <div className="panel dash-wide">
        <div className="panel-h">🕑 Hoạt động gần đây</div>
        <div className="mini-empty">Chưa có hoạt động nào.</div>
      </div>
    );
  }

  return (
    <div className="panel dash-wide">
      <div className="panel-h">🕑 Hoạt động gần đây</div>
      {items.map((item) => (
        <div key={item.id} className="act-row">
          <Avatar name={item.name} src={item.avatarUrl ?? undefined} size={26} />
          <span className="act-body">
            <b>{item.name}</b> {item.action}
            {item.detail && (
              <>
                {" "}
                · <span className="muted">{item.detail}</span>
              </>
            )}
          </span>
          <span className="act-time">{item.time}</span>
        </div>
      ))}
    </div>
  );
}
