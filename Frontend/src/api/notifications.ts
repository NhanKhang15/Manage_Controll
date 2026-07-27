import { apiFetch } from "./client";

export interface NotificationItem {
  id: string;
  company: string;
  recipient: string;
  type: string;
  icon_key?: string;
  title: string;
  body?: string;
  link_url?: string;
  related_table?: string;
  related_id?: string;
  is_read: boolean;
  read_at?: string;
  triggered_by_name?: string;
  created_at: string;
}

export async function getNotifications(unreadOnly = false, employeeId?: string): Promise<NotificationItem[]> {
  const headers: Record<string, string> = {};
  if (employeeId) {
    headers["X-Employee-Id"] = employeeId;
  }
  const query = unreadOnly ? "?unread_only=true" : "";
  return apiFetch<NotificationItem[]>(`/notifications/${query}`, { headers });
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  return apiFetch<NotificationItem>(`/notifications/${id}/read/`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead(employeeId?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (employeeId) {
    headers["X-Employee-Id"] = employeeId;
  }
  return apiFetch<void>("/notifications/read-all/", {
    method: "PATCH",
    headers,
  });
}
