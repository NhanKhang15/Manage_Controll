import { apiFetch } from "./client";
import type { TreeNode } from "./companies";

export async function createProject(data: { company_id: string; name: string; status?: string }): Promise<TreeNode> {
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
