import { apiFetch } from "./client";
import type { TaskAssigneeRef, PicRef, TreeNode } from "./companies";

export interface FlatTask {
  id: string;
  name: string;
  status: string;
  completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  project: { id: string; name: string };
  assignees: TaskAssigneeRef[];
  department: string | null;
  department_id: string | null;
  pic: PicRef | null;
  is_milestone: boolean;
  is_flagged?: boolean;
  is_problem?: boolean;
  can_automate?: boolean;
  effort_points: number | null;
  notes: string;
  parent: string | null;
}

export interface CreateTaskData {
  project_id?: string;
  parent_id?: string;
  name: string;
  pic_id?: string | null;
  department_id?: string | null;
  is_milestone?: boolean;
  is_flagged?: boolean;
  is_problem?: boolean;
  can_automate?: boolean;
  effort_points?: number | null;
  notes?: string;
}

export interface UpdateTaskData {
  name?: string;
  status?: string;
  is_completed?: boolean;
  pic_id?: string | null;
  department_id?: string | null;
  is_milestone?: boolean;
  is_flagged?: boolean;
  is_problem?: boolean;
  can_automate?: boolean;
  effort_points?: number | null;
  notes?: string;
  due_date?: string | null;
  parent_id?: string | null;
}

export interface TaskQueryParams {
  company_id: string;
  status?: string;
  search?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
  project_id?: string;
  department_id?: string;
  flag_filter?: string;
}

export interface PaginatedTasksResponse {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  results: FlatTask[];
}

export async function getTasksList(
  endpoint: "all" | "mine" | "department",
  params: TaskQueryParams
): Promise<PaginatedTasksResponse> {
  const query = new URLSearchParams();
  query.append("company_id", params.company_id);
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.search) query.append("search", params.search);
  if (params.ordering) query.append("ordering", params.ordering);
  if (params.project_id) query.append("project_id", params.project_id);
  if (params.department_id) query.append("department_id", params.department_id);
  if (params.flag_filter && params.flag_filter !== "all") query.append("flag_filter", params.flag_filter);
  query.append("limit", String(params.limit ?? 10));
  query.append("offset", String(params.offset ?? 0));

  return apiFetch<PaginatedTasksResponse>(`/tasks/${endpoint}/?${query.toString()}`);
}

export async function getMyTasks(companyId: string): Promise<FlatTask[]> {
  const res = await getTasksList("mine", { company_id: companyId, limit: 100 });
  return res.results;
}

export async function getDepartmentTasks(companyId: string): Promise<FlatTask[]> {
  const res = await getTasksList("department", { company_id: companyId, limit: 100 });
  return res.results;
}

export async function createTask(data: CreateTaskData): Promise<TreeNode> {
  return apiFetch<TreeNode>("/tasks/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(id: string, data: UpdateTaskData): Promise<TreeNode> {
  return apiFetch<TreeNode>(`/tasks/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function reorderTasks(data: { taskIds: string[]; newProjectId: string; newIndex: number }): Promise<void> {
  return apiFetch<void>("/tasks/reorder/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id: string): Promise<void> {
  return apiFetch<void>(`/tasks/${id}/`, {
    method: "DELETE",
  });
}
