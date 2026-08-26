import { apiFetch } from "./client";

export interface EmployeeListItem {
  id: string;
  full_name: string;
  primary_department_name: string;
  has_account: boolean;
  email?: string;
  position_title: string | null;
  avatar_url: string | null;
  phone?: string | null;
}

/** compact=true: bỏ email/phone khỏi payload — dùng cho các nơi chỉ chọn người
 * (gán PIC/người phối hợp) và không hiển thị 2 trường này, để giảm dữ liệu cá
 * nhân trả về không cần thiết. */
export function getEmployees(companyId: string, opts?: { compact?: boolean }): Promise<EmployeeListItem[]> {
  const query = opts?.compact ? "&compact=1" : "";
  return apiFetch<EmployeeListItem[]>(`/employees/?company_id=${companyId}${query}`);
}
