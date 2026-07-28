export type CalendarEventKind = "work" | "personal";

export type CalendarEventType = "meeting" | "personal" | "reminder";

export type CalendarViewMode = "month" | "week" | "day";

export interface CalendarEventItem {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  kind: CalendarEventKind;
  type: CalendarEventType;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  content?: string;
  creatorName?: string;
  companyId?: string;
}
