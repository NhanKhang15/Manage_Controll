import type { CalendarEventItem } from "../../types/calendar";

export function eventTimeRange(event: CalendarEventItem): string {
  if (!event.startTime) return "Cả ngày";
  return event.endTime ? `${event.startTime}–${event.endTime}` : event.startTime;
}

export function eventSubtitle(event: CalendarEventItem): string {
  if (event.type === "meeting") {
    return `${event.location || "Trực tuyến"} · Chủ trì: ${event.creatorName || "—"}`;
  }
  return `${event.location || "Không có địa điểm"} · Lịch cá nhân`;
}

export function eventChipClass(event: CalendarEventItem): string {
  return event.type === "meeting" ? "cal-ev" : event.type === "reminder" ? "cal-ev ev-reminder" : "cal-ev ev-personal";
}

export function eventBarClass(event: CalendarEventItem): string {
  return event.type === "meeting" ? "ev-bar-meeting" : "ev-bar-personal";
}
