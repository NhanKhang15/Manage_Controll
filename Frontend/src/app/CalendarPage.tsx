import { useRef, useState, useEffect, useCallback } from "react";
import type { DatesSetArg } from "@fullcalendar/core";
import { AppShellPage } from "../layout/AppShellPage";
import { CalendarToolbar } from "../features/calendar/CalendarToolbar";
import { CalendarView, type CalendarViewHandle } from "../features/calendar/CalendarView";
import { WeekView } from "../features/calendar/WeekView";
import { DayView } from "../features/calendar/DayView";
import { EventFormModal } from "../features/calendar/EventFormModal";
import { EventDetailModal } from "../features/calendar/EventDetailModal";
import { useToast } from "../components/ui/Toast";
import { getCompaniesTree, type TreeNode } from "../api/companies";
import { getEvents } from "../api/events";
import { addDays, getMonthsInRange, getWeekDays, parseDateKey, toDateKey } from "../features/calendar/dateUtils";
import type { CalendarEventItem, CalendarViewMode } from "../types/calendar";

function flattenCompanies(nodes: TreeNode[], depth = 0): { id: string; name: string; depth: number }[] {
  let list: { id: string; name: string; depth: number }[] = [];
  for (const node of nodes) {
    if (node.type === "company" || !node.type) {
      list.push({ id: node.id, name: node.name, depth });
      if (node.children && node.children.length > 0) {
        list = list.concat(flattenCompanies(node.children, depth + 1));
      }
    }
  }
  return list;
}

export function CalendarPage() {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [view, setView] = useState<CalendarViewMode>("month");
  const [monthLabel, setMonthLabel] = useState("");

  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  // Ngày neo cho tab Tuần/Ngày (tab Tháng tự quản lý qua FullCalendar + currentYear/currentMonth ở trên).
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  // Vị trí tháng để FullCalendar mở lại đúng chỗ khi tab Tháng được mount lại.
  const [monthAnchor, setMonthAnchor] = useState<Date>(new Date());

  const [companyList, setCompanyList] = useState<{ id: string; name: string; depth: number }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(toDateKey(new Date()));
  const [editingEvent, setEditingEvent] = useState<CalendarEventItem | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEvent, setDetailEvent] = useState<CalendarEventItem | null>(null);

  const calendarRef = useRef<CalendarViewHandle>(null);
  const { showToast } = useToast();

  // Load company tree
  useEffect(() => {
    getCompaniesTree()
      .then((tree) => {
        const flat = flattenCompanies(tree);
        setCompanyList(flat);
        if (flat.length > 0) {
          setSelectedCompanyId(flat[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch events API — gộp theo (các) tháng mà khung nhìn hiện tại chạm tới
  // (tab Tuần có thể vắt qua 2 tháng, backend chỉ lọc theo year+month).
  const fetchEvents = useCallback(async () => {
    try {
      let months: { year: number; month: number }[];
      if (view === "month") {
        months = [{ year: currentYear, month: currentMonth }];
      } else if (view === "week") {
        months = getMonthsInRange(getWeekDays(currentDate));
      } else {
        months = [{ year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 }];
      }

      const results = await Promise.all(months.map((m) => getEvents(m.year, m.month, selectedCompanyId)));
      const merged = new Map<string, any>();
      for (const list of results) {
        for (const item of list) merged.set(String(item.id), item);
      }

      const mapped: CalendarEventItem[] = Array.from(merged.values()).map((item: any) => ({
        id: String(item.id),
        title: item.title,
        start: `${item.event_date}${item.start_time ? `T${item.start_time}` : ""}`,
        end: item.end_time ? `${item.event_date}T${item.end_time}` : undefined,
        kind: item.type === "personal" ? "personal" : "work",
        type: item.type,
        eventDate: item.event_date,
        startTime: item.start_time ? item.start_time.slice(0, 5) : undefined,
        endTime: item.end_time ? item.end_time.slice(0, 5) : undefined,
        location: item.location || undefined,
        content: item.content || undefined,
        creatorName: item.creator_name || undefined,
        companyId: item.company,
      }));
      setEvents(mapped);
    } catch {
      // Fallback
    }
  }, [view, currentYear, currentMonth, currentDate, selectedCompanyId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function handleDatesSet(info: DatesSetArg) {
    const start = info.view.currentStart;
    setCurrentYear(start.getFullYear());
    setCurrentMonth(start.getMonth() + 1);
    setMonthAnchor(start);
    setMonthLabel(`Tháng ${start.getMonth() + 1} ${start.getFullYear()}`);
  }

  // Nhãn tiêu đề cho tab Tuần/Ngày (tab Tháng do handleDatesSet ở trên tự cập nhật).
  useEffect(() => {
    if (view === "week") {
      const days = getWeekDays(currentDate);
      const start = days[0];
      const end = days[6];
      const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      setMonthLabel(`Tuần ${fmt(start)} – ${fmt(end)}/${end.getFullYear()}`);
    } else if (view === "day") {
      setMonthLabel(
        currentDate.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })
      );
    }
  }, [view, currentDate]);

  function openCreateModal(dateKey: string) {
    setEditingEvent(null);
    setModalDate(dateKey);
    setModalOpen(true);
  }

  function handleEventClick(eventId: string) {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setDetailEvent(event);
      setDetailOpen(true);
    }
  }

  function handleMoreClick(dateStr: string) {
    setView("day");
    setCurrentDate(parseDateKey(dateStr));
  }

  return (
    <AppShellPage initialNavId="calendar">
      {/* Company Selector Header Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>🏢 Công ty:</span>
        <select
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: 10,
            border: "1px solid var(--line)",
            background: "var(--panel)",
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          {companyList.map((c) => (
            <option key={c.id} value={c.id}>
              {"  ".repeat(c.depth)}{c.depth > 0 ? "└ " : ""}{c.name}
            </option>
          ))}
        </select>
      </div>

      <CalendarToolbar
        monthLabel={monthLabel}
        view={view}
        onChangeView={setView}
        onPrev={() => {
          if (view === "month") calendarRef.current?.prev();
          else if (view === "week") setCurrentDate((d) => addDays(d, -7));
          else setCurrentDate((d) => addDays(d, -1));
        }}
        onNext={() => {
          if (view === "month") calendarRef.current?.next();
          else if (view === "week") setCurrentDate((d) => addDays(d, 7));
          else setCurrentDate((d) => addDays(d, 1));
        }}
        onToday={() => {
          if (view === "month") calendarRef.current?.today();
          else setCurrentDate(new Date());
        }}
        onAddEvent={() => openCreateModal(toDateKey(view === "month" ? new Date() : currentDate))}
        onRecordMeeting={() => showToast("Tính năng ghi âm họp đang được phát triển", "default")}
      />

      {view === "month" && (
        <CalendarView
          ref={calendarRef}
          events={events}
          initialDate={monthAnchor}
          onDatesSet={handleDatesSet}
          onDateClick={openCreateModal}
          onEventClick={handleEventClick}
          onMoreClick={handleMoreClick}
        />
      )}

      {view === "week" && (
        <WeekView
          weekDays={getWeekDays(currentDate)}
          events={events}
          onEventClick={handleEventClick}
          onAddEvent={openCreateModal}
        />
      )}

      {view === "day" && <DayView date={currentDate} events={events} onEventClick={handleEventClick} />}

      <EventFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmitSuccess={() => {
          showToast(editingEvent ? "Đã cập nhật lịch thành công" : "Đã tạo lịch mới thành công", "success");
          fetchEvents();
        }}
        defaultDate={modalDate}
        selectedCompanyId={selectedCompanyId}
        editingEvent={editingEvent}
      />

      <EventDetailModal
        event={detailEvent}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={(event) => {
          setDetailOpen(false);
          setEditingEvent(event);
          setModalDate(event.eventDate);
          setModalOpen(true);
        }}
        onDeleted={() => {
          setDetailOpen(false);
          fetchEvents();
        }}
      />
    </AppShellPage>
  );
}
