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
  pic: PicRef | null;
  is_milestone: boolean;
  effort_points: number | null;
  notes: string;
  parent: string | null;
}

export interface CreateTaskData {
  project_id?: string;
  parent_id?: string;
  name: string;
  pic_id?: string | null;
  is_milestone?: boolean;
  effort_points?: number | null;
  notes?: string;
}

export interface UpdateTaskData {
  name?: string;
  status?: string;
  is_completed?: boolean;
  pic_id?: string | null;
  is_milestone?: boolean;
  effort_points?: number | null;
  notes?: string;
  due_date?: string | null;
  parent_id?: string | null;
}

export async function getMyTasks(companyId: string): Promise<FlatTask[]> {
  return apiFetch<FlatTask[]>(`/tasks/mine/?company_id=${companyId}`);
}

export async function getDepartmentTasks(companyId: string): Promise<FlatTask[]> {
  return apiFetch<FlatTask[]>(`/tasks/department/?company_id=${companyId}`);
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
