import { eventBarClass, eventSubtitle } from "./eventDisplay";
import type { CalendarEventItem } from "../../types/calendar";

export interface DayViewProps {
  date: Date;
  events: CalendarEventItem[];
  onEventClick: (eventId: string) => void;
}

/**
 * DayView
 * Danh sách dọc tất cả sự kiện của đúng ngày đang xem — thay cho lưới giờ
 * (timeGridDay) của FullCalendar. Cũng là đích đến khi bấm "+X more" ở tab Tháng.
 */
export function DayView({ date, events, onEventClick }: DayViewProps) {
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const dayEvents = events
    .filter((e) => e.eventDate === dateKey)
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  if (dayEvents.length === 0) {
    return <div className="cal-day-empty">Không có lịch nào trong ngày này</div>;
  }

  return (
    <div className="cal-day-list">
      {dayEvents.map((ev) => (
        <button
          key={ev.id}
          type="button"
          className={`cal-day-card ${eventBarClass(ev)}`}
          onClick={() => onEventClick(ev.id)}
        >
          <div className="cal-day-card-time">
            <span>{ev.startTime || "--:--"}</span>
            {ev.endTime && <span className="cal-day-card-time-end">{ev.endTime}</span>}
          </div>
          <div className="cal-day-card-body">
            <div className="cal-day-card-title">
              {ev.type === "reminder" ? "🔔 " : ""}
              {ev.title}
            </div>
            <div className="cal-day-card-sub">{eventSubtitle(ev)}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
