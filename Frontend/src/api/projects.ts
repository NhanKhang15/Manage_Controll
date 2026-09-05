import { apiFetch } from "./client";
import type { TreeNode } from "./companies";

export async function createProject(data: {
  company_id?: string;
  department_id?: string;
  parent_id?: string;
  name: string;
  status?: string;
  order_index?: number;
}): Promise<TreeNode> {
  return apiFetch<TreeNode>("/projects/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/projects/${id}/`, {
    method: "DELETE",
  });
}

export interface ProjectOptionItem {
  id: string;
  name: string;
  status?: string | null;
  company_id: string;
  department_id?: string | null;
  parent_id?: string | null;
  progress_percent: number;
}

export async function getProjectOptions(companyId?: string, departmentId?: string): Promise<ProjectOptionItem[]> {
  const query = new URLSearchParams();
  if (companyId) query.append("company_id", companyId);
  if (departmentId) query.append("department_id", departmentId);
  const qStr = query.toString();
  return apiFetch<ProjectOptionItem[]>(qStr ? `/projects/options/?${qStr}` : "/projects/options/");
}

