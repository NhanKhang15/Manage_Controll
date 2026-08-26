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
  onlineMeetingLink?: string;
  content?: string;
  creatorName?: string;
  companyId?: string;
  needPickupCar?: boolean;
  driverId?: string;
  driverName?: string;
  hasGift?: boolean;
  giftNote?: string;
  inviteAllCompany?: boolean;
  invitedDepartmentIds?: string[];
  invitedEmployeeIds?: string[];
  attachments?: { url: string; name: string }[];
}
