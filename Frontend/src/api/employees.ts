import { apiFetch } from "./client";

export type ReactionType = "like" | "dislike";

export interface EmployeeListItem {
  id: string;
  full_name: string;
  primary_department_name: string;
  has_account: boolean;
  email?: string;
  position_title: string | null;
  avatar_url: string | null;
  phone?: string | null;
  zalo?: string | null;
  role_in_company?: string | null;
  manager_id?: string | null;
  manager_name?: string | null;
  manager_title?: string | null;
  direct_reports_count: number;
  likes_count: number;
  dislikes_count: number;
  rating: number;
  points: number;
  level: number;
  viewer_reaction: ReactionType | null;
}

export interface PendingEmployee {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface PendingEmployeesResponse {
  results: PendingEmployee[];
  can_manage: boolean;
}

export interface ReactionResult {
  likes_count: number;
  dislikes_count: number;
  rating: number;
  points: number;
  level: number;
  viewer_reaction: ReactionType | null;
}

/** compact=true: bỏ email/phone/zalo khỏi payload — dùng cho các nơi chỉ chọn người
 * (gán PIC/người phối hợp) và không hiển thị các trường này, để giảm dữ liệu cá
 * nhân trả về không cần thiết. */
export function getEmployees(companyId: string, opts?: { compact?: boolean }): Promise<EmployeeListItem[]> {
  const query = opts?.compact ? "&compact=1" : "";
  return apiFetch<EmployeeListItem[]>(`/employees/?company_id=${companyId}${query}`);
}

/** Tài khoản tự đăng ký, đang chờ duyệt (is_approved=False) trong công ty. */
export function getPendingEmployees(companyId: string): Promise<PendingEmployeesResponse> {
  return apiFetch<PendingEmployeesResponse>(`/employees/pending/?company_id=${companyId}`);
}

export function approveEmployee(id: string): Promise<{ id: string; is_approved: boolean }> {
  return apiFetch(`/employees/${id}/approve/`, { method: "POST" });
}

export function rejectEmployee(id: string): Promise<void> {
  return apiFetch(`/employees/${id}/reject/`, { method: "POST" });
}

/** Bấm lại cùng loại reaction sẽ gỡ (toggle); bấm loại khác sẽ đổi. */
export function reactToEmployee(id: string, type: ReactionType): Promise<ReactionResult> {
  return apiFetch<ReactionResult>(`/employees/${id}/react/`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });
}
