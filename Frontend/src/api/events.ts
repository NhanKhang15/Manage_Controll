import { apiFetch } from "./client";

export interface EventCreateData {
  company_id: string;
  type: "meeting" | "personal" | "reminder";
  title: string;
  content?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  online_meeting_link?: string;
  need_pickup_car?: boolean;
  driver_id?: string;
  has_gift?: boolean;
  gift_note?: string;
  invite_all_company?: boolean;
  invited_department_ids?: string[];
  invited_employee_ids?: string[];
  attachment_urls?: { url: string; name?: string }[] | string[];
}

export async function getEvents(year: number, month: number, companyId?: string): Promise<any[]> {
  const query = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  if (companyId) query.append("company_id", companyId);
  return apiFetch<any[]>(`/events/?${query.toString()}`);
}

export async function createEvent(data: EventCreateData, employeeId?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (employeeId) {
    headers["X-Employee-Id"] = employeeId;
  }
  return apiFetch<any>("/events/create/", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}

export async function getDrivers(companyId?: string): Promise<any[]> {
  const query = companyId ? `?company_id=${companyId}` : "";
  return apiFetch<any[]>(`/drivers/${query}`);
}

export async function uploadFile(file: File): Promise<{ url: string; name: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  const url = `${BASE_URL}/upload/`;

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Upload file thất bại");
  }

  return res.json();
}
