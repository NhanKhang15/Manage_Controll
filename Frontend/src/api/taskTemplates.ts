import { apiFetch } from "./client";

export interface TaskTemplateItem {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: "low" | "med" | "high";
  est_hours: number;
  subtasks: string[];
}

export function getTaskTemplates(companyId: string): Promise<TaskTemplateItem[]> {
  return apiFetch<TaskTemplateItem[]>(`/task-templates/?company_id=${companyId}`);
}

export function createTaskTemplate(
  companyId: string,
  data: { name: string; title?: string; description?: string; priority: "low" | "med" | "high"; est_hours: number; subtasks: string[] }
): Promise<TaskTemplateItem> {
  return apiFetch<TaskTemplateItem>(`/task-templates/?company_id=${companyId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteTaskTemplate(id: string): Promise<void> {
  return apiFetch(`/task-templates/${id}/`, { method: "DELETE" });
}

export interface RecurringTaskItem {
  id: string;
  task_id: string;
  task_title: string;
  recurrence: "daily" | "weekly" | "monthly";
  recur_until: string | null;
}

export function getRecurringTasks(companyId: string): Promise<RecurringTaskItem[]> {
  return apiFetch<RecurringTaskItem[]>(`/task-recurring/?company_id=${companyId}`);
}

export function createRecurringTask(
  companyId: string,
  data: { task_id: string; recurrence: "daily" | "weekly" | "monthly"; recur_until?: string | null }
): Promise<RecurringTaskItem> {
  return apiFetch<RecurringTaskItem>(`/task-recurring/?company_id=${companyId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteRecurringTask(id: string): Promise<void> {
  return apiFetch(`/task-recurring/${id}/`, { method: "DELETE" });
}

export interface TaskDependencyItem {
  id: string;
  task_id: string;
  task_title: string;
  depends_on_id: string;
  depends_on_title: string;
}

export function getTaskDependencies(companyId: string): Promise<TaskDependencyItem[]> {
  return apiFetch<TaskDependencyItem[]>(`/task-dependencies/?company_id=${companyId}`);
}

export function createTaskDependency(
  companyId: string,
  data: { task_id: string; depends_on_id: string }
): Promise<TaskDependencyItem> {
  return apiFetch<TaskDependencyItem>(`/task-dependencies/?company_id=${companyId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteTaskDependency(id: string): Promise<void> {
  return apiFetch(`/task-dependencies/${id}/`, { method: "DELETE" });
}
