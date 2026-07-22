export type CalendarEventKind = "work" | "personal";

export type CalendarViewMode = "month" | "week" | "day";

export interface CalendarEventItem {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  kind: CalendarEventKind;
}
