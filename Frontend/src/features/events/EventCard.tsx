import type { EventItem } from "../../types/events";

/**
 * EventCard
 * Thẻ sự kiện — banner gradient + giờ/ngày + địa điểm + số người tham gia.
 * CSS gốc tham chiếu: .ev-card
 */
export interface EventCardProps {
  event: EventItem;
  onClick?: (event: EventItem) => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  return (
    <button type="button" className="ev-card" onClick={() => onClick?.(event)}>
      <div className="ev-card-banner" style={{ background: event.gradient }} />
      <div className="ev-card-body">
        <div className="ev-card-time">{event.datetime}</div>
        <div className="ev-card-title">{event.title}</div>
        <div className="muted" style={{ fontSize: 13 }}>
          📍 {event.location}
        </div>
        <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
          {event.attendees} người tham gia · {event.visibility === "public" ? "🌐 Công khai" : "🔒 Nội bộ"}
        </div>
      </div>
    </button>
  );
}
