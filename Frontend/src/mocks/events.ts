import type { EventItem } from "../types/events";

export const mockEvents: EventItem[] = [
  {
    id: "ev-1",
    title: "Ra mắt sản phẩm Vela AI Core 2.0",
    datetime: "21:46 · 01/08/2026",
    location: "Khách sạn Rex",
    attendees: 42,
    visibility: "public",
    gradient: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
  },
  {
    id: "ev-2",
    title: "Team building Quý 3/2026",
    datetime: "08:00 · 15/08/2026",
    location: "Vũng Tàu",
    attendees: 68,
    visibility: "public",
    gradient: "linear-gradient(135deg,#0ea5e9,#22c7e8,#10b981)",
  },
  {
    id: "ev-3",
    title: "Họp tổng kết BOD",
    datetime: "14:00 · 05/08/2026",
    location: "Phòng họp tầng 12",
    attendees: 8,
    visibility: "private",
    gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
  },
];
