import { useRef, useState } from "react";
import type { DatesSetArg } from "@fullcalendar/core";
import { AppShellPage } from "../layout/AppShellPage";
import { CalendarToolbar } from "../features/calendar/CalendarToolbar";
import { CalendarView, type CalendarViewHandle } from "../features/calendar/CalendarView";
import { EventFormModal, type EventFormValues } from "../features/calendar/EventFormModal";
import { useToast } from "../components/ui/Toast";
import { calendarEvents as initialEvents } from "../mocks/calendar";
import type { CalendarEventItem, CalendarViewMode } from "../types/calendar";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * CalendarPage
 * Trang Lịch — dùng khung dùng chung `AppShellPage` + lưới lịch thật bằng
 * FullCalendar (thay cho .cal-month/.cal-grid/.cal-cell viết tay trong HTML gốc).
 * Thẻ HTML gốc: toàn bộ <body> của trang "Lịch · Vela AI".
 */
export function CalendarPage() {
  const [events, setEvents] = useState<CalendarEventItem[]>(initialEvents);
  const [view, setView] = useState<CalendarViewMode>("month");
  const [monthLabel, setMonthLabel] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(toDateInputValue(new Date()));
  const calendarRef = useRef<CalendarViewHandle>(null);
  const { showToast } = useToast();

  function handleDatesSet(info: DatesSetArg) {
    const start = info.view.currentStart;
    if (view === "month") {
      setMonthLabel(`Tháng ${start.getMonth() + 1} ${start.getFullYear()}`);
    } else if (view === "week") {
      const end = new Date(info.view.currentEnd);
      end.setDate(end.getDate() - 1);
      setMonthLabel(`${start.toLocaleDateString("vi-VN")} – ${end.toLocaleDateString("vi-VN")}`);
    } else {
      setMonthLabel(start.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }));
    }
  }

  function handleAddEvent(values: EventFormValues) {
    const newEvent: CalendarEventItem = {
      id: crypto.randomUUID(),
      title: values.title,
      start: `${values.date}T${values.time}:00`,
      kind: values.kind,
    };
    setEvents((prev) => [...prev, newEvent]);
    setModalOpen(false);
    showToast(`Đã thêm lịch: ${values.title}`, "success");
  }

  return (
    <AppShellPage initialNavId="calendar">
      <CalendarToolbar
        monthLabel={monthLabel}
        view={view}
        onChangeView={setView}
        onPrev={() => calendarRef.current?.prev()}
        onNext={() => calendarRef.current?.next()}
        onToday={() => calendarRef.current?.today()}
        onAddEvent={() => {
          setModalDate(toDateInputValue(new Date()));
          setModalOpen(true);
        }}
        onRecordMeeting={() => showToast("Tính năng ghi âm họp đang được phát triển", "default")}
      />
      <CalendarView
        ref={calendarRef}
        events={events}
        view={view}
        onDatesSet={handleDatesSet}
        onDateClick={(dateStr) => {
          setModalDate(dateStr);
          setModalOpen(true);
        }}
        onEventClick={(eventId) => {
          const event = events.find((e) => e.id === eventId);
          if (event) showToast(event.title, "default");
        }}
      />
      <EventFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddEvent}
        defaultDate={modalDate}
      />
    </AppShellPage>
  );
}
