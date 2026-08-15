import type { TaskAssigneeRef, TreeNode } from "../../api/companies";
import type { FlatTask } from "../../api/tasks";
import { colorFromName } from "../../utils/color";

export interface TaskItem {
  id: string;
  title: string;
  projectId: string | null;
  projectName: string | null;
  projectColor: string;
  completed: boolean;
  completedAtIso: string | null;
  dueDateIso: string | null;
  dueDateLabel: string | null;
  overdueDays: number | null;
  assigneeName: string | null;
  department: string | null;
}

export interface ProjectOption {
  id: string;
  name: string;
  status?: string;
}

export type TaskSortKey = "name" | "project" | "department" | "alert" | "progress" | "pic" | "due_date";
export type TaskSortDir = "asc" | "desc";

function daysOverdue(dueDateIso: string | null): number | null {
  if (!dueDateIso) return null;
  const due = new Date(dueDateIso);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - due.getTime()) / 86400000);
  return diffDays > 0 ? diffDays : null;
}

function primaryAssigneeName(assignees: TaskAssigneeRef[] | undefined): string | null {
  if (!assignees || assignees.length === 0) return null;
  const primary = assignees.find((a) => a.role === "assignee") ?? assignees[0];
  return assignees.length > 1 ? `${primary.full_name} +${assignees.length - 1}` : primary.full_name;
}

/** Duyệt cây company → project → task (từ getCompaniesTree) và làm phẳng thành danh sách task, kèm dự án cha. */
export function flattenTasks(nodes: TreeNode[], project: ProjectOption | null = null): TaskItem[] {
  const result: TaskItem[] = [];
  for (const node of nodes) {
    if (node.type === "task") {
      result.push({
        id: node.id,
        title: node.name,
        projectId: project?.id ?? null,
        projectName: project?.name ?? null,
        projectColor: project ? colorFromName(project.name) : "#8A93A6",
        completed: !!node.completed,
        completedAtIso: node.completed_at ?? null,
        dueDateIso: node.due_date ?? null,
        dueDateLabel: node.due_date ? new Date(node.due_date).toLocaleDateString("vi-VN") : null,
        overdueDays: daysOverdue(node.due_date ?? null),
        assigneeName: primaryAssigneeName(node.assignees),
        department: node.department ?? null,
      });
    } else if (node.children) {
      const nextProject = node.type === "project" ? { id: node.id, name: node.name } : project;
      result.push(...flattenTasks(node.children, nextProject));
    }
  }
  return result;
}

/** Chuyển kết quả /api/tasks/mine/ hoặc /api/tasks/department/ (đã phẳng sẵn) sang TaskItem dùng chung với bảng. */
export function fromFlatTask(t: FlatTask): TaskItem {
  return {
    id: t.id,
    title: t.name,
    projectId: t.project.id,
    projectName: t.project.name,
    projectColor: colorFromName(t.project.name),
    completed: t.completed,
    completedAtIso: t.completed_at,
    dueDateIso: t.due_date,
    dueDateLabel: t.due_date ? new Date(t.due_date).toLocaleDateString("vi-VN") : null,
    overdueDays: daysOverdue(t.due_date),
    assigneeName: primaryAssigneeName(t.assignees),
    department: t.department,
  };
}

/** Gom tất cả node dự án trong cây company → project để đổ vào dropdown chọn dự án. */
export function flattenProjects(nodes: TreeNode[]): ProjectOption[] {
  const result: ProjectOption[] = [];
  for (const node of nodes) {
    if (node.type === "project") {
      result.push({ id: node.id, name: node.name, status: node.status });
    } else if (node.children) {
      result.push(...flattenProjects(node.children));
    }
  }
  return result;
}
