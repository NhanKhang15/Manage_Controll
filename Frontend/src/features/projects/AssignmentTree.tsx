import { useEffect, useState, type CSSProperties } from "react";
import { Tree, getTreeLinePrefix, type NodeRendererProps } from "react-arborist";
import {
  getCompaniesTree,
  deleteCompany,
  createDepartment,
  deleteDepartment,
  type TreeNode,
  type NodeType,
} from "../../api/companies";
import { createProject, deleteProject } from "../../api/projects";
import { createTask, updateTask, reorderTasks, deleteTask } from "../../api/tasks";
import { CreateCompanyModal } from "./CreateCompanyModal";

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
    return { ...n, children, childCount };
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

export function AssignmentTree() {
  const [data, setData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalParentCompany, setModalParentCompany] = useState<{ id: string; name: string } | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    getCompaniesTree()
      .then((tree) => {
        if (isMounted) {
          setData(recomputeCounts(tree));
          setLoading(false);
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

  async function handleAddDepartment(company: TreeNode) {
    const name = window.prompt(`Tên phòng ban mới trong "${company.name}":`);
    if (!name || !name.trim()) return;
    setError(null);
    try {
      const newNode = await createDepartment({ company_id: company.id, name: name.trim() });
      setData((prev) => recomputeCounts(addChildTo(prev, company.id, { ...newNode, type: "department", children: [] })));
      setHighlightId(newNode.id);
      setTimeout(() => setHighlightId(null), 2000);
    } catch (err: any) {
      setError(err.message || "Không thể tạo phòng ban mới");
    }
  }

  async function handleAddFolder(parent: TreeNode) {
    const label = parent.type === "department" ? "Folder mới trong phòng ban" : "Folder con mới";
    const name = window.prompt(`Tên ${label} "${parent.name}":`);
    if (!name || !name.trim()) return;
    setError(null);
    try {
      let newNode: TreeNode;
      if (parent.type === "department") {
        newNode = await createProject({ department_id: parent.id, name: name.trim() });
      } else {
        newNode = await createProject({ parent_id: parent.id, name: name.trim() });
      }
      setData((prev) => recomputeCounts(addChildTo(prev, parent.id, { ...newNode, type: "project", children: [] })));
      setHighlightId(newNode.id);
      setTimeout(() => setHighlightId(null), 2000);
    } catch (err: any) {
      setError(err.message || "Không thể tạo folder mới");
    }
  }

  async function handleAddTask(parent: TreeNode) {
    const label = parent.type === "department" ? "công việc trong phòng ban" : parent.type === "project" ? "công việc trong folder" : "công việc con";
    const name = window.prompt(`Tên ${label} "${parent.name}":`);
    if (!name || !name.trim()) return;
    setError(null);
    try {
      let newNode: TreeNode;
      if (parent.type === "department") {
        newNode = await createTask({ department_id: parent.id, name: name.trim() });
      } else if (parent.type === "project") {
        newNode = await createTask({ project_id: parent.id, name: name.trim() });
      } else {
        newNode = await createTask({ parent_id: parent.id, name: name.trim() });
      }
      setData((prev) => recomputeCounts(addChildTo(prev, parent.id, { ...newNode, type: "task", children: [] })));
      setHighlightId(newNode.id);
      setTimeout(() => setHighlightId(null), 2000);
    } catch (err: any) {
      setError(err.message || "Không thể tạo công việc mới");
    }
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
    const canToggle = !isTask && !!item.children && item.children.length > 0;
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
                handleAddDepartment(item);
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
                handleAddFolder(item);
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
                handleAddTask(item);
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
                handleAddFolder(item);
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
                handleAddTask(item);
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
                handleAddTask(item);
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

      {/* Tree Card */}
      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, padding: 8 }}>
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
            indent={0}
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
    </div>
  );
}
