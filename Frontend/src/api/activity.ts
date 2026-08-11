import { apiFetch } from "./client";

export interface ActivityEntry {
  id: string;
  action: "create" | "update" | "delete" | "login";
  description: string;
  actor_id: string | null;
  actor_name: string;
  actor_avatar_url: string | null;
  created_at: string;
}

export function getRecentActivity(companyId: string, limit = 10): Promise<ActivityEntry[]> {
  return apiFetch<ActivityEntry[]>(`/activity/?company_id=${companyId}&limit=${limit}`);
}
