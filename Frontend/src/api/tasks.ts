import { apiFetch } from "./client";
import type { TreeNode } from "./companies";

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
