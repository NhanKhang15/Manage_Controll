import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import viLocale from "@fullcalendar/core/locales/vi";
import type { CalendarEventItem, CalendarViewMode } from "../../types/calendar";

const VIEW_TO_FC: Record<CalendarViewMode, string> = {
  month: "dayGridMonth",
  week: "timeGridWeek",
  day: "timeGridDay",
};

/**
 * CalendarView
 * Bọc thư viện FullCalendar (thay cho lưới .cal-month/.cal-grid/.cal-cell viết
 * tay trong HTML gốc), style qua .vela-fc trong global.css.
 * Thẻ HTML gốc: <div class=cal-month> (nay do FullCalendar tự render)
 */
export interface CalendarViewProps {
  events: CalendarEventItem[];
  view: CalendarViewMode;
  onDateClick: (dateStr: string) => void;
  onEventClick: (eventId: string) => void;
  onDatesSet: (info: DatesSetArg) => void;
}

export interface CalendarViewHandle {
  prev: () => void;
  next: () => void;
  today: () => void;
}

export const CalendarView = forwardRef<CalendarViewHandle, CalendarViewProps>(function CalendarView(
  { events, view, onDateClick, onEventClick, onDatesSet },
  ref
) {
  const fcRef = useRef<FullCalendar>(null);

  useImperativeHandle(ref, () => ({
    prev: () => fcRef.current?.getApi().prev(),
    next: () => fcRef.current?.getApi().next(),
    today: () => fcRef.current?.getApi().today(),
  }));

  useEffect(() => {
    fcRef.current?.getApi().changeView(VIEW_TO_FC[view]);
  }, [view]);

  return (
    <div className="vela-fc">
      <FullCalendar
        ref={fcRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={VIEW_TO_FC[view]}
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
      />
    </div>
  );
});
