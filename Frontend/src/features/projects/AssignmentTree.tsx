import { useEffect, useState, type CSSProperties } from "react";
import { Tree, getTreeLinePrefix, type NodeRendererProps } from "react-arborist";
import {
  getCompaniesTree,
  createCompanyWithFolder,
  deleteCompany,
  type TreeNode,
  type NodeType,
} from "../../api/companies";
import { createProject, deleteProject } from "../../api/projects";
import { createTask, updateTask, reorderTasks, deleteTask } from "../../api/tasks";
import { CreateCompanyModal } from "./CreateCompanyModal";

export type { NodeType, TreeNode };

const TYPE_ICON: Record<NodeType, string> = { company: "🏢", project: "📄", task: "☰" };

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
  return childType === "company" ? "công ty con" : childType === "project" ? "dự án" : "công việc";
}

/** 1 công ty có thể vừa có công ty con vừa có dự án riêng cùng lúc, nên đếm
 * theo từng loại rồi nối lại, thay vì chỉ nhìn loại của children[0]. */
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

function StatusTag({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "#8A93A6";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 600,
        color,
        background: `${color}18`,
        border: `1px solid ${color}55`,
        borderRadius: 99,
        padding: "2px 10px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flex: "none" }} />
      {status}
    </span>
  );
}

function CountTag({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: 12,
        color: "var(--muted)",
        background: "var(--line-2)",
        borderRadius: 99,
        padding: "2px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

const iconBtnStyle: CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--muted-2)", padding: 4, fontSize: 14 };
const linkBtnStyle: CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" };

export function AssignmentTree() {
  const [data, setData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingCompany, setIsCreatingCompany] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
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
          setError(err.message || "Không thể tải danh sách cây dự án");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function handleCreateCompanySuccess(newCompany: any) {
    const newNode: TreeNode = {
      ...newCompany,
      type: "company",
      children: [],
    };
    setData((prev) => recomputeCounts([...prev, newNode]));
    setHighlightId(newCompany.id);
    setTimeout(() => setHighlightId(null), 2000);
  }

  async function handleAdd(parent: TreeNode, type: NodeType) {
    const label = type === "company" ? "công ty con" : type === "project" ? "dự án" : "công việc";
    const name = window.prompt(`Tên ${label} mới:`);
    if (!name || !name.trim()) return;

    setError(null);

    if (type === "company") {
      setIsCreatingCompany(true);
      try {
        const newNode = await createCompanyWithFolder({ name: name.trim(), parent_id: parent.id });
        setData((prev) => recomputeCounts(addChildTo(prev, parent.id, newNode)));
        setHighlightId(newNode.id);
        setTimeout(() => setHighlightId(null), 2000);
      } catch (err: any) {
        setError(err.message || "Không thể tạo công ty mới");
      } finally {
        setIsCreatingCompany(false);
      }
    } else if (type === "project") {
      try {
        const newNode = await createProject({ company_id: parent.id, name: name.trim() });
        setData((prev) => recomputeCounts(addChildTo(prev, parent.id, newNode)));
      } catch (err: any) {
        setError(err.message || "Không thể tạo dự án mới");
      }
    } else if (type === "task") {
      try {
        const newNode = await createTask({ project_id: parent.id, name: name.trim() });
        setData((prev) => recomputeCounts(addChildTo(prev, parent.id, newNode)));
      } catch (err: any) {
        setError(err.message || "Không thể tạo công việc mới");
      }
    }
  }

  async function handleDelete(node: TreeNode) {
    if (!window.confirm(`Xoá "${node.name}"? Các mục con bên trong cũng sẽ bị xoá.`)) return;
    setError(null);
    try {
      if (node.type === "company") {
        await deleteCompany(node.id);
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
    const canToggle = !isTask && !!item.children && item.children.length > 0;
    const linePrefix = getTreeLinePrefix(node, { last: "└─ ", middle: "├─ ", pipe: "│  ", blank: "   " });
    const isHighlighted = item.id === highlightId;

    return (
      <div
        ref={isTask ? dragHandle : undefined}
        className={`flex items-center gap-1.5 h-full px-3 rounded-lg transition-colors duration-1000 ${
          isHighlighted ? "bg-yellow-50" : node.willReceiveDrop ? "bg-[var(--brand-soft)]" : "bg-transparent"
        }`}
        style={{
          ...style,
          height: "100%",
        }}
      >
        {linePrefix && (
          <span style={{ fontFamily: "monospace", fontSize: 13, color: "var(--line)", whiteSpace: "pre", flex: "none" }}>
            {linePrefix}
          </span>
        )}

        {isTask ? <span style={{ color: "var(--muted-2)", cursor: "grab", fontSize: 13 }}>⠿</span> : <span style={{ width: 12 }} />}

        {canToggle ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              node.toggle();
            }}
            style={{ ...iconBtnStyle, width: 16, padding: 0, fontSize: 13 }}
          >
            {node.isOpen ? "⌄" : "›"}
          </button>
        ) : (
          <span style={{ width: 16 }} />
        )}

        <span style={{ fontSize: 14 }}>{TYPE_ICON[item.type]}</span>

        <span
          onClick={canToggle ? () => node.toggle() : undefined}
          style={{
            fontWeight: isTask ? 500 : 700,
            fontSize: 14,
            cursor: canToggle ? "pointer" : "default",
            textDecoration: item.completed ? "line-through" : "none",
            color: item.completed ? "var(--muted)" : "var(--text)",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </span>

        {item.status && <StatusTag status={item.status} />}
        {item.childCount && <CountTag label={item.childCount} />}

        <span style={{ flex: 1 }} />

        {item.type === "company" && (
          <>
            <button
              type="button"
              disabled={isCreatingCompany}
              style={{ ...linkBtnStyle, opacity: isCreatingCompany ? 0.5 : 1 }}
              onClick={(e) => {
                e.stopPropagation();
                handleAdd(item, "company");
              }}
            >
              {isCreatingCompany ? "+ Đang tạo..." : "+ Công ty con"}
            </button>
            <button
              type="button"
              style={linkBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleAdd(item, "project");
              }}
            >
              + Dự án
            </button>
          </>
        )}

        {item.type === "project" && (
          <button
            type="button"
            style={linkBtnStyle}
            onClick={(e) => {
              e.stopPropagation();
              handleAdd(item, "task");
            }}
          >
            + Công việc
          </button>
        )}

        {isTask && (
          <input
            type="checkbox"
            checked={!!item.completed}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              handleToggleTask(item);
            }}
            style={{ width: 16, height: 16, cursor: "pointer" }}
          />
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

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Quản lý Công ty / Dự án</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5 cursor-pointer"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tạo công ty
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
            disableDrag={(item) => item.type !== "task"}
            disableDrop={({ parentNode }) => !parentNode?.data || parentNode.data.type !== "project"}
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
      />
    </div>
  );
}
