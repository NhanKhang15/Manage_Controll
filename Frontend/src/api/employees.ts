import { apiFetch } from "./client";

export interface EmployeeListItem {
  id: string;
  full_name: string;
  primary_department_name: string;
  has_account: boolean;
  email: string;
  position_title: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export function getEmployees(companyId: string): Promise<EmployeeListItem[]> {
  return apiFetch<EmployeeListItem[]>(`/employees/?company_id=${companyId}`);
}
