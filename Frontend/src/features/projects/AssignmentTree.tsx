import { useEffect, useState, useMemo, type CSSProperties } from "react";
import { Tree, getTreeLinePrefix, type NodeRendererProps } from "react-arborist";
import {
  getCompaniesTree,
  deleteCompany,
  deleteDepartment,
  syncGoogleDrive,
  type TreeNode,
  type NodeType,
} from "../../api/companies";
import { deleteProject } from "../../api/projects";
import { updateTask, reorderTasks, deleteTask } from "../../api/tasks";
import { getEmployees, type EmployeeListItem } from "../../api/employees";
import { CreateCompanyModal } from "./CreateCompanyModal";
import { CreateDepartmentModal } from "./CreateDepartmentModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { CreateTaskModal } from "../tasks/CreateTaskModal";
import { CreateSubtaskModal } from "../tasks/CreateSubtaskModal";

export type { NodeType, TreeNode };

const TYPE_ICON: Record<NodeType, string> = {
  company: "🏢",
  department: "👥",
  project: "📁",
  task: "☰",
};

const STATUS_COLOR: Record<string, string> = {
  "Hoàn thành": "#10B981",
  "Đang làm": "#10B981",
  "Cần làm": "#8A93A6",
  "Ý tưởng": "#8B5CF6",
  "Triển khai": "#0D9488",
  "Đề xuất & Chọn": "#8B5CF6",
  "Định nghĩa": "#F59E0B",
  "R&D": "#F59E0B",
};

function suffixFor(childType: NodeType): string {
  if (childType === "company") return "công ty con";
  if (childType === "department") return "phòng ban";
  if (childType === "project") return "folder";
  return "công việc";
}

/** 1 node có thể chứa nhiều loại con cùng lúc, nên đếm theo từng loại rồi nối lại */
function recomputeCounts(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((n) => {
    if (!n.children) return n;
    const children = recomputeCounts(n.children);
    let childCount: string | undefined;
    if (children.length > 0) {
      const counts = new Map<NodeType, number>();
      for (const c of children) counts.set(c.type, (counts.get(c.type) ?? 0) + 1);
      childCount = Array.from(counts.entries())
        .map(([type, n2]) => `${n2} ${suffixFor(type)}`)
        .join(" · ");
    }
    return {
      ...n,
      children: n.type === "task" && children.length === 0 ? undefined : children,
      childCount,
    };
  });
}

function removeNodeDeep(nodes: TreeNode[], id: string): { removed: TreeNode | null; nodes: TreeNode[] } {
  let removed: TreeNode | null = null;
  const next: TreeNode[] = [];
  for (const n of nodes) {
    if (n.id === id) {
      removed = n;
      continue;
    }
    if (n.children) {
      const inner = removeNodeDeep(n.children, id);
      if (inner.removed) removed = inner.removed;
      next.push({ ...n, children: inner.nodes });
    } else {
      next.push(n);
    }
  }
  return { removed, nodes: next };
}

function insertNodeAt(nodes: TreeNode[], parentId: string, index: number, node: TreeNode): TreeNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) {
      const children = n.children ? [...n.children] : [];
      children.splice(index, 0, node);
      return { ...n, children };
    }
    if (n.children) return { ...n, children: insertNodeAt(n.children, parentId, index, node) };
    return n;
  });
}

function addChildTo(nodes: TreeNode[], parentId: string, node: TreeNode): TreeNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) return { ...n, children: [...(n.children ?? []), node] };
    if (n.children) return { ...n, children: addChildTo(n.children, parentId, node) };
    return n;
  });
}

function deleteNode(nodes: TreeNode[], id: string): TreeNode[] {
  return nodes.filter((n) => n.id !== id).map((n) => (n.children ? { ...n, children: deleteNode(n.children, id) } : n));
}

function toggleTask(nodes: TreeNode[], id: string): TreeNode[] {
  return nodes.map((n) => {
    if (n.id === id && n.type === "task") {
      const completed = !n.completed;
      return { ...n, completed, status: completed ? "Hoàn thành" : "Cần làm" };
    }
    if (n.children) return { ...n, children: toggleTask(n.children, id) };
    return n;
  });
}

function LevelBadge({ type }: { type: NodeType }) {
  if (type === "company") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: "#1E40AF",
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: 6,
          padding: "1.5px 7px",
          textTransform: "uppercase",
          flex: "none",
        }}
      >
        Công ty
      </span>
    );
  }
  if (type === "department") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: "#6D28D9",
          background: "#F5F3FF",
          border: "1px solid #DDD6FE",
          borderRadius: 6,
          padding: "1.5px 7px",
          textTransform: "uppercase",
          flex: "none",
        }}
      >
        Phòng ban
      </span>
    );
  }
  if (type === "project") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: "#047857",
          background: "#ECFDF5",
          border: "1px solid #A7F3D0",
          borderRadius: 6,
          padding: "1.5px 7px",
          textTransform: "uppercase",
          flex: "none",
        }}
      >
        Folder
      </span>
    );
  }
  return null;
}

function StatusTag({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "#8A93A6";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11.5,
        fontWeight: 600,
        color,
        background: `${color}18`,
        border: `1px solid ${color}55`,
        borderRadius: 99,
        padding: "1.5px 8px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 5.5, height: 5.5, borderRadius: "50%", background: color, flex: "none" }} />
      {status}
    </span>
  );
}

function CountTag({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: 11.5,
        fontWeight: 500,
        color: "var(--muted, #8A93A6)",
        background: "var(--line-2, #F1F3F7)",
        borderRadius: 99,
        padding: "1.5px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function DriveLinkBtn({ url, title }: { url?: string | null; title: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        borderRadius: 6,
        color: "#2563EB",
        background: "#EFF6FF",
        border: "1px solid #BFDBFE",
        textDecoration: "none",
        fontSize: 12,
        marginLeft: 4,
        flex: "none",
        transition: "all 0.15s ease",
      }}
    >
      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.71 3.5L1.15 15l3.43 6l6.55-11.5M9.73 15L13.16 21h13.1l-3.43-6M22.29 13.5l-6.55-11.5h-6.86l6.55 11.5" />
      </svg>
    </a>
  );
}

const iconBtnStyle: CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--muted-2)", padding: 4, fontSize: 14 };
const linkBtnStyle: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--brand, #4F6EF7)",
  fontSize: 12.5,
  fontWeight: 600,
  whiteSpace: "nowrap",
  padding: "3px 8px",
  borderRadius: 6,
  transition: "all 0.15s ease",
};

function collectNodes(nodes: TreeNode[], type: NodeType): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [];
  function traverse(list: TreeNode[]) {
    for (const node of list) {
      if (node.type === type) {
        result.push({ id: node.id, name: node.name });
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  traverse(nodes);
  return result;
}

export function AssignmentTree() {
  const [data, setData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);

  // 1. Company Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalParentCompany, setModalParentCompany] = useState<{ id: string; name: string } | null>(null);

  // 2. Department Modal
  const [deptModalOpen, setDeptModalOpen] = useState<boolean>(false);
  const [deptModalCompany, setDeptModalCompany] = useState<{ id: string; name: string } | null>(null);

  // 3. Folder Modal
  const [folderModalOpen, setFolderModalOpen] = useState<boolean>(false);
  const [folderModalContext, setFolderModalContext] = useState<{
    id: string;
    name: string;
    type: "company" | "department" | "project";
    companyId?: string;
    departmentId?: string;
    parentId?: string;
  } | null>(null);

  // 4. Task Modal
  const [taskModalOpen, setTaskModalOpen] = useState<boolean>(false);
  const [taskModalContext, setTaskModalContext] = useState<{
    parentId?: string;
    defaultProjectId?: string;
    defaultDepartmentId?: string;
    companyId?: string;
  } | null>(null);

  // 5. Subtask Modal
  const [subtaskModalOpen, setSubtaskModalOpen] = useState<boolean>(false);
  const [subtaskModalParent, setSubtaskModalParent] = useState<{
    id: string;
    name: string;
    dueDate?: string | null;
    departmentName?: string;
  } | null>(null);

  const availableCompanies = useMemo(() => collectNodes(data, "company"), [data]);
  const availableDepartments = useMemo(() => collectNodes(data, "department"), [data]);
  const availableProjects = useMemo(() => collectNodes(data, "project"), [data]);

  async function handleSyncDrive() {
    setSyncing(true);
    setError(null);
    setSyncMessage(null);
    try {
      const res = await syncGoogleDrive();
      setSyncMessage(res.message);
      const tree = await getCompaniesTree();
      setData(recomputeCounts(tree));
      setTimeout(() => setSyncMessage(null), 6000);
    } catch (err: any) {
      setError(err.message || "Đồng bộ Google Drive thất bại");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    getCompaniesTree()
      .then((tree) => {
        if (isMounted) {
          setData(recomputeCounts(tree));
          setLoading(false);
          const firstCompanyId = tree.find((n) => n.type === "company")?.id;
          if (firstCompanyId) {
            getEmployees(firstCompanyId)
              .then((emps) => {
                if (isMounted) setEmployees(emps);
              })
              .catch(() => {});
          }
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || "Không thể tải danh sách cây phân cấp");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function handleOpenCreateCompany(parent?: TreeNode | null) {
    if (parent) {
      setModalParentCompany({ id: parent.id, name: parent.name });
    } else {
      setModalParentCompany(null);
    }
    setModalOpen(true);
  }

  function handleCreateCompanySuccess(newCompany: any) {
    const newNode: TreeNode = {
      ...newCompany,
      type: "company",
      children: newCompany.children || [],
    };
    if (modalParentCompany) {
      setData((prev) => recomputeCounts(addChildTo(prev, modalParentCompany.id, newNode)));
    } else {
      setData((prev) => recomputeCounts([...prev, newNode]));
    }
    setHighlightId(newCompany.id);
    setTimeout(() => setHighlightId(null), 2500);
  }

  function handleOpenAddDepartment(company: TreeNode) {
    setDeptModalCompany({ id: company.id, name: company.name });
    setDeptModalOpen(true);
  }

  function handleCreateDeptSuccess(newDept: any) {
    const parentCompanyId = newDept.company_id || deptModalCompany?.id;
    const newNode: TreeNode = {
      ...newDept,
      type: "department",
      children: newDept.children || [],
    };
    if (parentCompanyId) {
      setData((prev) => recomputeCounts(addChildTo(prev, parentCompanyId, newNode)));
    } else {
      setData((prev) => recomputeCounts([...prev, newNode]));
    }
    setHighlightId(newDept.id);
    setTimeout(() => setHighlightId(null), 2500);
  }

  function handleOpenAddFolder(parent: TreeNode) {
    if (parent.type === "department") {
      setFolderModalContext({
        id: parent.id,
        name: parent.name,
        type: "department",
        departmentId: parent.id,
      });
    } else if (parent.type === "project") {
      setFolderModalContext({
        id: parent.id,
        name: parent.name,
        type: "project",
        parentId: parent.id,
      });
    } else {
      setFolderModalContext({
        id: parent.id,
        name: parent.name,
        type: "company",
        companyId: parent.id,
      });
    }
    setFolderModalOpen(true);
  }

  function handleCreateFolderSuccess(newProject: any) {
    const targetParentId = folderModalContext?.id || newProject.department_id || newProject.company_id;
    const newNode: TreeNode = {
      ...newProject,
      type: "project",
      children: newProject.children || [],
    };
    if (targetParentId) {
      setData((prev) => recomputeCounts(addChildTo(prev, targetParentId, newNode)));
    } else {
      setData((prev) => recomputeCounts([...prev, newNode]));
    }
    setHighlightId(newProject.id);
    setTimeout(() => setHighlightId(null), 2500);
  }

  function handleOpenAddTask(parent: TreeNode) {
    if (parent.type === "department") {
      setTaskModalContext({
        parentId: parent.id,
        defaultDepartmentId: parent.id,
      });
    } else if (parent.type === "project") {
      setTaskModalContext({
        parentId: parent.id,
        defaultProjectId: parent.id,
      });
    } else {
      setTaskModalContext({
        parentId: parent.id,
      });
    }
    setTaskModalOpen(true);
  }

  function handleCreateTaskSuccess(newTask: any) {
    const targetParentId =
      taskModalContext?.parentId ||
      taskModalContext?.defaultProjectId ||
      taskModalContext?.defaultDepartmentId ||
      newTask.project?.id ||
      newTask.department_id;
    const newNode: TreeNode = {
      ...newTask,
      type: "task",
      children: newTask.children || [],
    };
    if (targetParentId) {
      setData((prev) => recomputeCounts(addChildTo(prev, targetParentId, newNode)));
    } else {
      setData((prev) => recomputeCounts([...prev, newNode]));
    }
    setHighlightId(newTask.id);
    setTimeout(() => setHighlightId(null), 2500);
  }

  function handleOpenAddSubtask(task: TreeNode) {
    setSubtaskModalParent({
      id: task.id,
      name: task.name,
      dueDate: task.due_date,
      departmentName: task.department || undefined,
    });
    setSubtaskModalOpen(true);
  }

  function handleCreateSubtaskSuccess(newSubtask: any) {
    const parentTaskId = subtaskModalParent?.id;
    const newNode: TreeNode = {
      ...newSubtask,
      type: "task",
      children: newSubtask.children || [],
    };
    if (parentTaskId) {
      setData((prev) => recomputeCounts(addChildTo(prev, parentTaskId, newNode)));
    }
    setHighlightId(newSubtask.id);
    setTimeout(() => setHighlightId(null), 2500);
  }

  async function handleDelete(node: TreeNode) {
    const label =
      node.type === "company"
        ? "công ty"
        : node.type === "department"
        ? "phòng ban"
        : node.type === "project"
        ? "folder"
        : "công việc";
    if (!window.confirm(`Xoá ${label} "${node.name}"? Tất cả các mục con bên trong cũng sẽ bị xoá.`)) return;
    setError(null);
    try {
      if (node.type === "company") {
        await deleteCompany(node.id);
      } else if (node.type === "department") {
        await deleteDepartment(node.id);
      } else if (node.type === "project") {
        await deleteProject(node.id);
      } else if (node.type === "task") {
        await deleteTask(node.id);
      }
      setData((prev) => recomputeCounts(deleteNode(prev, node.id)));
    } catch (err: any) {
      setError(err.message || "Xoá không thành công");
    }
  }

  function handleToggleTask(node: TreeNode) {
    setError(null);
    const snapshot = data;
    const nextCompleted = !node.completed;
    setData((prev) => toggleTask(prev, node.id));

    updateTask(node.id, {
      is_completed: nextCompleted,
      status: nextCompleted ? "Hoàn thành" : "Cần làm",
    }).catch((err: any) => {
      setData(snapshot);
      setError(err.message || "Cập nhật công việc thất bại");
    });
  }

  function handleMove({ dragIds, parentId, index }: { dragIds: string[]; parentId: string | null; index: number }) {
    if (!parentId) return;
    setError(null);
    const snapshot = data;

    let working = data;
    dragIds.forEach((id, i) => {
      const { removed, nodes } = removeNodeDeep(working, id);
      working = nodes;
      if (removed) {
        working = insertNodeAt(working, parentId, index + i, removed);
      }
    });
    setData(recomputeCounts(working));

    reorderTasks({
      taskIds: dragIds,
      newProjectId: parentId,
      newIndex: index,
    }).catch((err: any) => {
      setData(snapshot);
      setError(err.message || "Kéo-thả sắp xếp thất bại");
    });
  }

  function Row({ node, style, dragHandle }: NodeRendererProps<TreeNode>) {
    const item = node.data;
    const isTask = item.type === "task";
    const isProject = item.type === "project";
    const isDraggable = isTask || isProject;
    const canToggle = !!item.children && item.children.length > 0;
    const linePrefix = getTreeLinePrefix(node, { last: "└─ ", middle: "├─ ", pipe: "│  ", blank: "   " });
    const isHighlighted = item.id === highlightId;

    // Distinct styling per level
    const levelNameColor =
      item.type === "company"
        ? "var(--text, #0F172A)"
        : item.type === "department"
        ? "#3730A3"
        : item.type === "project"
        ? "#065F46"
        : item.completed
        ? "var(--muted, #8A93A6)"
        : "var(--text, #1E293B)";

    const levelFontWeight =
      item.type === "company" ? 750 : item.type === "department" || item.type === "project" ? 650 : 500;

    const levelBg =
      isHighlighted
        ? "#FEF9C3"
        : node.willReceiveDrop
        ? "var(--brand-soft, #EEF1FE)"
        : item.type === "department"
        ? "rgba(245, 243, 255, 0.4)"
        : item.type === "project"
        ? "rgba(236, 253, 245, 0.35)"
        : "transparent";

    return (
      <div
        ref={isDraggable ? dragHandle : undefined}
        className={`flex items-center gap-1.5 h-full px-2.5 rounded-lg transition-colors duration-300`}
        style={{
          ...style,
          height: "100%",
          cursor: isDraggable ? "grab" : "default",
          backgroundColor: levelBg,
          borderLeft:
            item.type === "department"
              ? "3px solid #8B5CF6"
              : item.type === "project"
              ? "3px solid #10B981"
              : item.type === "company"
              ? "3px solid #3B82F6"
              : "3px solid transparent",
          paddingLeft: "6px",
        }}
      >
        {linePrefix && (
          <span style={{ fontFamily: "monospace", fontSize: 13, color: "var(--line, #CBD5E1)", whiteSpace: "pre", flex: "none" }}>
            {linePrefix}
          </span>
        )}

        {isDraggable ? (
          <span style={{ color: "var(--muted-2)", cursor: "grab", fontSize: 13, marginRight: 2 }} title="Kéo để di chuyển">
            ⠿
          </span>
        ) : (
          <span style={{ width: 10 }} />
        )}

        {canToggle ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              node.toggle();
            }}
            style={{ ...iconBtnStyle, width: 16, padding: 0, fontSize: 13 }}
            title={node.isOpen ? "Thu gọn" : "Mở rộng"}
          >
            {node.isOpen ? "⌄" : "›"}
          </button>
        ) : (
          <span style={{ width: 16 }} />
        )}

        <span style={{ fontSize: 14, flex: "none" }}>{TYPE_ICON[item.type]}</span>

        <LevelBadge type={item.type} />

        <span
          onClick={canToggle ? () => node.toggle() : undefined}
          style={{
            fontWeight: levelFontWeight,
            fontSize: isTask ? 13.5 : 14,
            cursor: canToggle ? "pointer" : "default",
            textDecoration: item.completed ? "line-through" : "none",
            color: levelNameColor,
            whiteSpace: "nowrap",
            marginLeft: "2px",
          }}
        >
          {item.name}
        </span>

        {item.status && <StatusTag status={item.status} />}
        {item.childCount && <CountTag label={item.childCount} />}

        <DriveLinkBtn
          url={item.drive_file_url || item.drive_folder_url}
          title={item.type === "task" ? "Mở Google Doc của công việc này" : "Mở thư mục trên Google Drive"}
        />

        <span style={{ flex: 1 }} />

        {/* Level 1: Công ty (chứa Công ty con & Phòng ban) */}
        {item.type === "company" && (
          <>
            <button
              type="button"
              style={linkBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenCreateCompany(item);
              }}
              title="Tạo công ty con trực thuộc"
            >
              + Công ty con
            </button>
            <button
              type="button"
              style={linkBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddDepartment(item);
              }}
              title="Tạo phòng ban mới trong công ty này"
            >
              + Phòng ban
            </button>
          </>
        )}

        {/* Level 2: Phòng ban (chứa Folders & Công việc trực tiếp) */}
        {item.type === "department" && (
          <>
            <button
              type="button"
              style={linkBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddFolder(item);
              }}
              title="Tạo folder trong phòng ban này"
            >
              + Folder
            </button>
            <button
              type="button"
              style={linkBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddTask(item);
              }}
              title="Thêm công việc trực tiếp vào phòng ban này"
            >
              + Công việc
            </button>
          </>
        )}

        {/* Level 3: Folder (chứa Sub-folder & Công việc) */}
        {item.type === "project" && (
          <>
            <button
              type="button"
              style={linkBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddFolder(item);
              }}
              title="Tạo folder con trong folder này"
            >
              + Folder con
            </button>
            <button
              type="button"
              style={linkBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddTask(item);
              }}
              title="Thêm công việc vào folder này"
            >
              + Công việc
            </button>
          </>
        )}

        {/* Level 4: Công việc (Task) */}
        {isTask && (
          <>
            <button
              type="button"
              style={linkBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddSubtask(item);
              }}
              title="Thêm công việc con"
            >
              + Việc con
            </button>
            <input
              type="checkbox"
              checked={!!item.completed}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                handleToggleTask(item);
              }}
              style={{ width: 16, height: 16, cursor: "pointer", marginLeft: 4 }}
              title={item.completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
            />
          </>
        )}

        <button
          type="button"
          title="Xoá"
          style={iconBtnStyle}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(item);
          }}
        >
          🗑
        </button>
      </div>
    );
  }

  const availableParents = data
    .filter((n) => n.type === "company")
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--text)" }}>
            Quản lý Công ty & Dự án
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0 0" }}>
            Cấu trúc phân cấp: Công ty → Phòng ban → Folder & Công việc
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={handleSyncDrive}
            disabled={syncing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 12,
              fontSize: 13.5,
              fontWeight: 600,
              color: "#1D4ED8",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              cursor: syncing ? "not-allowed" : "pointer",
              opacity: syncing ? 0.7 : 1,
              transition: "all 0.2s ease",
            }}
            title="Đồng bộ toàn diện cấu trúc cây và file Google Doc lên Google Drive"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: syncing ? "spin 1s linear infinite" : "none" }}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{syncing ? "Đang đồng bộ Drive..." : "Đồng bộ Google Drive"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreateCompany(null)}
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 12,
              fontSize: 13.5,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(79, 110, 247, 0.25)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Tạo công ty</span>
          </button>
        </div>
      </div>

      {/* Tree Card */}
      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, padding: 8 }}>
        {syncMessage && (
          <div
            style={{
              color: "#047857",
              fontSize: 13,
              padding: "8px 14px",
              marginBottom: 8,
              background: "#ECFDF5",
              borderRadius: 8,
              border: "1px solid #A7F3D0",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>✓</span>
            <span>{syncMessage}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              color: "#EF4444",
              fontSize: 13,
              padding: "6px 12px",
              marginBottom: 8,
              background: "#FEF2F2",
              borderRadius: 6,
              border: "1px solid #FCA5A5",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            Đang tải dữ liệu từ máy chủ...
          </div>
        ) : (
          <Tree<TreeNode>
            data={data}
            onMove={handleMove}
            idAccessor="id"
            childrenAccessor="children"
            openByDefault
            width="100%"
            height={620}
            rowHeight={38}
            indent={24}
            disableDrag={(item) => item.type !== "task" && item.type !== "project"}
            disableDrop={({ parentNode, dragNodes }) => {
              if (!parentNode?.data) return true; // Không cho thả tự do ra ngoài root
              const parentType = parentNode.data.type;
              const isDraggingProject = dragNodes.some((n) => n.data.type === "project");
              const isDraggingTask = dragNodes.some((n) => n.data.type === "task");

              // Folder chỉ được thả vào Phòng ban hoặc Folder khác
              if (isDraggingProject) {
                return parentType !== "department" && parentType !== "project";
              }
              // Task được thả vào Phòng ban, Folder hoặc Task khác (việc con)
              if (isDraggingTask) {
                return parentType !== "department" && parentType !== "project" && parentType !== "task";
              }
              return true;
            }}
          >
            {Row}
          </Tree>
        )}
      </div>

      {/* Create Company Modal */}
      <CreateCompanyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleCreateCompanySuccess}
        parentCompany={modalParentCompany}
        availableParents={availableParents}
      />

      {/* Create Department Modal */}
      <CreateDepartmentModal
        isOpen={deptModalOpen}
        onClose={() => {
          setDeptModalOpen(false);
          setDeptModalCompany(null);
        }}
        onSuccess={handleCreateDeptSuccess}
        companyId={deptModalCompany?.id}
        companyName={deptModalCompany?.name}
        availableCompanies={availableCompanies}
      />

      {/* Create Folder / Subfolder Modal */}
      <CreateFolderModal
        isOpen={folderModalOpen}
        onClose={() => {
          setFolderModalOpen(false);
          setFolderModalContext(null);
        }}
        onSuccess={handleCreateFolderSuccess}
        parentId={folderModalContext?.parentId}
        departmentId={folderModalContext?.departmentId}
        companyId={folderModalContext?.companyId}
        parentName={folderModalContext?.name}
        parentType={folderModalContext?.type}
        availableCompanies={availableCompanies}
        availableDepartments={availableDepartments}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setTaskModalContext(null);
        }}
        onSuccess={handleCreateTaskSuccess}
        defaultProjectId={taskModalContext?.defaultProjectId}
        defaultDepartmentId={taskModalContext?.defaultDepartmentId}
        availableProjects={availableProjects}
        availableDepartments={availableDepartments}
        availableEmployees={employees}
      />

      {/* Create Subtask Modal */}
      <CreateSubtaskModal
        isOpen={subtaskModalOpen}
        onClose={() => {
          setSubtaskModalOpen(false);
          setSubtaskModalParent(null);
        }}
        onSuccess={handleCreateSubtaskSuccess}
        parentTask={subtaskModalParent}
        availableEmployees={employees}
      />
    </div>
  );
}
