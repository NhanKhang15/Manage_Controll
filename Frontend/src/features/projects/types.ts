import type { TreeNode } from "../../api/companies";
import { colorFromName } from "../../utils/color";

export type TaskStatus = "Ý tưởng" | "Cần làm" | "Đang làm" | "Hoàn thành";

export const TASK_STATUSES: TaskStatus[] = ["Ý tưởng", "Cần làm", "Đang làm", "Hoàn thành"];

export const STATUS_COLOR: Record<TaskStatus, string> = {
  "Ý tưởng": "#8B5CF6",
  "Cần làm": "#AEB6C4",
  "Đang làm": "#F59E0B",
  "Hoàn thành": "#10B981",
};

export const EFFORT_LABEL: Record<number, string> = { 1: "Nhỏ", 3: "Vừa", 5: "Lớn", 8: "Rất lớn" };

export interface ProjectTaskNode {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  status: TaskStatus;
  completed: boolean;
  createdAt: string;
  dueDate: string | null;
  picName: string | null;
  picId: string | null;
  assigneeNames: string[];
  isMilestone: boolean;
  effortPoints: number | null;
  notes: string;
  progressPercent: number;
  hasChildren: boolean;
  children: ProjectTaskNode[];
}

export interface ProjectNode {
  id: string;
  companyId: string;
  name: string;
  status: string | null;
  progressPercent: number;
  driveFolderUrl: string | null;
  tasks: ProjectTaskNode[];
}

function toTaskStatus(raw: string | undefined): TaskStatus {
  return (TASK_STATUSES as string[]).includes(raw ?? "") ? (raw as TaskStatus) : "Cần làm";
}

function toTaskNode(node: TreeNode, projectId: string): ProjectTaskNode {
  const children = (node.children ?? []).map((c) => toTaskNode(c, projectId));
  return {
    id: node.id,
    projectId,
    parentId: node.parent ?? null,
    title: node.name,
    status: toTaskStatus(node.status),
    completed: !!node.completed,
    createdAt: node.created_at ?? new Date().toISOString(),
    dueDate: node.due_date ?? null,
    picName: node.pic?.full_name ?? null,
    picId: node.pic?.id ?? null,
    assigneeNames: (node.assignees ?? []).map((a) => a.full_name),
    isMilestone: !!node.is_milestone,
    effortPoints: node.effort_points ?? null,
    notes: node.notes ?? "",
    progressPercent: node.progress_percent ?? (node.completed ? 100 : 0),
    hasChildren: children.length > 0,
    children,
  };
}

/** Duyệt cây company → project để lấy toàn bộ dự án (kèm cây task lồng nhau) của 1 công ty. */
export function toProjectNodes(nodes: TreeNode[], companyId: string): ProjectNode[] {
  const result: ProjectNode[] = [];
  for (const node of nodes) {
    if (node.type === "project") {
      result.push({
        id: node.id,
        companyId,
        name: node.name,
        status: node.status ?? null,
        progressPercent: node.progress_percent ?? 0,
        driveFolderUrl: node.drive_folder_url ?? null,
        tasks: (node.children ?? []).map((c) => toTaskNode(c, node.id)),
      });
    } else if (node.children) {
      result.push(...toProjectNodes(node.children, node.type === "company" ? node.id : companyId));
    }
  }
  return result;
}

/** Làm phẳng cây task 1 dự án (giữ parentId) — dùng cho Kanban/Gantt/Mindmap/Danh sách. */
export function flattenProjectTasks(tasks: ProjectTaskNode[]): ProjectTaskNode[] {
  const result: ProjectTaskNode[] = [];
  for (const t of tasks) {
    result.push(t);
    if (t.children.length > 0) result.push(...flattenProjectTasks(t.children));
  }
  return result;
}

/** Tìm 1 task theo id trong cây (đệ quy) — dùng khi cần cập nhật local state sau khi PATCH. */
export function findTaskById(tasks: ProjectTaskNode[], id: string): ProjectTaskNode | null {
  for (const t of tasks) {
    if (t.id === id) return t;
    const found = findTaskById(t.children, id);
    if (found) return found;
  }
  return null;
}

export function projectColor(name: string): string {
  return colorFromName(name);
}
