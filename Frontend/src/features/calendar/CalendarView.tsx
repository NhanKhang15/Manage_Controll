import { forwardRef, useImperativeHandle, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg, MoreLinkArg } from "@fullcalendar/core";
import viLocale from "@fullcalendar/core/locales/vi";
import { toDateKey } from "./dateUtils";
import type { CalendarEventItem } from "../../types/calendar";

/**
 * CalendarView
 * Bọc thư viện FullCalendar cho tab Tháng (dayGridMonth). Tab Tuần/Ngày dùng
 * WeekView/DayView tự dựng (xem CalendarPage) thay vì timeGridWeek/timeGridDay.
 * Thẻ HTML gốc: <div class=cal-month> (nay do FullCalendar tự render)
 */
export interface CalendarViewProps {
  events: CalendarEventItem[];
  /** Tháng để mở khi FullCalendar được mount lại (giữ vị trí điều hướng trước đó). */
  initialDate?: Date;
  onDateClick: (dateStr: string) => void;
  onEventClick: (eventId: string) => void;
  onDatesSet: (info: DatesSetArg) => void;
  /** Bấm "+X more" khi 1 ngày có quá nhiều sự kiện → chuyển sang tab Ngày thay vì bung popover. */
  onMoreClick: (dateStr: string) => void;
}

export interface CalendarViewHandle {
  prev: () => void;
  next: () => void;
  today: () => void;
}

export const CalendarView = forwardRef<CalendarViewHandle, CalendarViewProps>(function CalendarView(
  { events, initialDate, onDateClick, onEventClick, onDatesSet, onMoreClick },
  ref
) {
  const fcRef = useRef<FullCalendar>(null);

  useImperativeHandle(ref, () => ({
    prev: () => fcRef.current?.getApi().prev(),
    next: () => fcRef.current?.getApi().next(),
    today: () => fcRef.current?.getApi().today(),
  }));

  return (
    <div className="vela-fc">
      <FullCalendar
        ref={fcRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={initialDate}
        headerToolbar={false}
        height="auto"
        locale={viLocale}
        firstDay={1}
        dayMaxEvents={3}
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          allDay: e.allDay,
          classNames: e.kind === "personal" ? ["cal-ev", "ev-personal"] : ["cal-ev"],
        }))}
        dateClick={(info: DateClickArg) => onDateClick(info.dateStr)}
        eventClick={(info: EventClickArg) => onEventClick(info.event.id)}
        datesSet={onDatesSet}
        moreLinkClick={(info: MoreLinkArg) => {
          onMoreClick(toDateKey(info.date));
          return "none";
        }}
      />
    </div>
  );
});
