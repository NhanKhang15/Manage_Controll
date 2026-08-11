import { apiFetch } from "./client";

export type NodeType = "company" | "project" | "task";

export interface TaskAssigneeRef {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

export interface PicRef {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface TreeNode {
  id: string;
  type: NodeType;
  name: string;
  status?: string;
  childCount?: string;
  completed?: boolean;
  completed_at?: string | null;
  due_date?: string | null;
  assignees?: TaskAssigneeRef[];
  department?: string | null;
  pic?: PicRef | null;
  is_milestone?: boolean;
  effort_points?: number | null;
  notes?: string;
  parent?: string | null;
  progress_percent?: number;
  drive_folder_id?: string | null;
  drive_folder_url?: string | null;
  created_at?: string;
  children?: TreeNode[];
}

/**
 * companyId bỏ trống -> trả toàn bộ cây đa công ty trong hệ thống (dùng cho
 * màn quản lý ở trang Dự án → Phân công). Truyền companyId -> chỉ trả cây của
 * đúng công ty đó (dùng cho Dashboard, Công việc — tránh lẫn dữ liệu công ty khác).
 */
export async function getCompaniesTree(companyId?: string): Promise<TreeNode[]> {
  return apiFetch<TreeNode[]>(companyId ? `/companies/?company_id=${companyId}` : "/companies/");
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
