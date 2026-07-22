import type { CalendarEventItem } from "../types/calendar";

/**
 * Lưới ngày trong HTML gốc (tháng 4/2026) rỗng hoàn toàn (JS runtime cũ tự
 * inject sự kiện) — mock vài sự kiện hợp lý theo ngữ cảnh app quản lý công việc.
 */
export const calendarEvents: CalendarEventItem[] = [
  { id: "e1", title: "Họp giao ban tuần", start: "2026-04-06T09:00:00", end: "2026-04-06T10:00:00", kind: "work" },
  { id: "e2", title: "Demo sản phẩm với KH", start: "2026-04-10T14:00:00", end: "2026-04-10T15:30:00", kind: "work" },
  { id: "e3", title: "Nộp báo cáo tháng", start: "2026-04-15", allDay: true, kind: "work" },
  { id: "e4", title: "Sinh nhật đồng nghiệp", start: "2026-04-22", allDay: true, kind: "personal" },
  { id: "e5", title: "Khám sức khỏe định kỳ", start: "2026-04-27T08:00:00", end: "2026-04-27T09:30:00", kind: "personal" },
];
