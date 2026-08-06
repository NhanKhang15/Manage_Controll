import { apiFetch } from "./client";
import type { TaskAssigneeRef, TreeNode } from "./companies";

export interface FlatTask {
  id: string;
  name: string;
  status: string;
  completed: boolean;
  due_date: string | null;
  project: { id: string; name: string };
  assignees: TaskAssigneeRef[];
  department: string | null;
}

export async function getMyTasks(companyId: string): Promise<FlatTask[]> {
  return apiFetch<FlatTask[]>(`/tasks/mine/?company_id=${companyId}`);
}

export async function getDepartmentTasks(companyId: string): Promise<FlatTask[]> {
  return apiFetch<FlatTask[]>(`/tasks/department/?company_id=${companyId}`);
}

export async function createTask(data: { project_id: string; name: string }): Promise<TreeNode> {
  return apiFetch<TreeNode>("/tasks/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(id: string, data: { status?: string; is_completed?: boolean }): Promise<TreeNode> {
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
