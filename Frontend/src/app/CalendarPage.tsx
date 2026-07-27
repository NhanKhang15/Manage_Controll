import { useRef, useState, useEffect, useCallback } from "react";
import type { DatesSetArg } from "@fullcalendar/core";
import { AppShellPage } from "../layout/AppShellPage";
import { CalendarToolbar } from "../features/calendar/CalendarToolbar";
import { CalendarView, type CalendarViewHandle } from "../features/calendar/CalendarView";
import { EventFormModal } from "../features/calendar/EventFormModal";
import { useToast } from "../components/ui/Toast";
import { getCompaniesTree, type TreeNode } from "../api/companies";
import { getEvents } from "../api/events";
import type { CalendarEventItem, CalendarViewMode } from "../types/calendar";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

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

  const [companyList, setCompanyList] = useState<{ id: string; name: string; depth: number }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(toDateInputValue(new Date()));
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

  // Fetch events API
  const fetchEvents = useCallback(async () => {
    try {
      const data = await getEvents(currentYear, currentMonth, selectedCompanyId);
      const mapped: CalendarEventItem[] = data.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        start: `${item.event_date}${item.start_time ? `T${item.start_time}` : ""}`,
        end: item.end_time ? `${item.event_date}T${item.end_time}` : undefined,
        kind: item.type === "personal" ? "personal" : "work",
      }));
      setEvents(mapped);
    } catch {
      // Fallback
    }
  }, [currentYear, currentMonth, selectedCompanyId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function handleDatesSet(info: DatesSetArg) {
    const start = info.view.currentStart;
    setCurrentYear(start.getFullYear());
    setCurrentMonth(start.getMonth() + 1);

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
              {"\u00A0\u00A0".repeat(c.depth)}{c.depth > 0 ? "└ " : ""}{c.name}
            </option>
          ))}
        </select>
      </div>

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
        onSubmitSuccess={() => {
          showToast("Đã tạo lịch mới thành công", "success");
          fetchEvents();
        }}
        defaultDate={modalDate}
        selectedCompanyId={selectedCompanyId}
      />
    </AppShellPage>
  );
}
