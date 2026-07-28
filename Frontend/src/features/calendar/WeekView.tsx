import { Icon } from "../../components/ui/Icon";
import { formatDayMonth, isSameDay, toDateKey, weekdayLabel } from "./dateUtils";
import { eventChipClass } from "./eventDisplay";
import type { CalendarEventItem } from "../../types/calendar";

export interface WeekViewProps {
  weekDays: Date[];
  events: CalendarEventItem[];
  onEventClick: (eventId: string) => void;
  onAddEvent: (dateKey: string) => void;
}

/**
 * WeekView
 * Danh sách sự kiện xếp theo cột ngày (T2 → CN) trong tuần, không giới hạn
 * số lượng sự kiện mỗi ngày — thay cho lưới giờ (timeGridWeek) của FullCalendar.
 */
export function WeekView({ weekDays, events, onEventClick, onAddEvent }: WeekViewProps) {
  const today = new Date();

  return (
    <div className="cal-week-grid">
      {weekDays.map((day) => {
        const dateKey = toDateKey(day);
        const dayEvents = events
          .filter((e) => e.eventDate === dateKey)
          .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

        return (
          <div className="cal-week-col" key={dateKey}>
            <div className={`cal-week-col-head${isSameDay(day, today) ? " is-today" : ""}`}>
              <span className="cal-week-day">{weekdayLabel(day)}</span>
              <span className="cal-week-date">{formatDayMonth(day)}</span>
            </div>
            <div className="cal-week-col-body">
              {dayEvents.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  className={eventChipClass(ev)}
                  onClick={() => onEventClick(ev.id)}
                  title={ev.title}
                >
                  {ev.type === "reminder" ? "🔔 " : ""}
                  {ev.startTime ? `${ev.startTime} ` : ""}
                  {ev.title}
                </button>
              ))}
            </div>
            <button type="button" className="cal-week-add" onClick={() => onAddEvent(dateKey)} aria-label="Thêm lịch">
              <Icon name="plus" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
