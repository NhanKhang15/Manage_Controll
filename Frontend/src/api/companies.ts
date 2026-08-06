import { apiFetch } from "./client";

export type NodeType = "company" | "project" | "task";

export interface TaskAssigneeRef {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

export interface TreeNode {
  id: string;
  type: NodeType;
  name: string;
  status?: string;
  childCount?: string;
  completed?: boolean;
  due_date?: string | null;
  assignees?: TaskAssigneeRef[];
  department?: string | null;
  children?: TreeNode[];
}

export async function getCompaniesTree(): Promise<TreeNode[]> {
  return apiFetch<TreeNode[]>("/companies/");
}

export async function createCompanyWithFolder(data: { name: string; parent_id?: string | null }): Promise<TreeNode> {
  return apiFetch<TreeNode>("/companies/create-with-folder/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteCompany(id: string): Promise<void> {
  return apiFetch<void>(`/companies/${id}/`, {
    method: "DELETE",
  });
}
