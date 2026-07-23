import { useState, type CSSProperties } from "react";
import { Tree, getTreeLinePrefix, type NodeRendererProps } from "react-arborist";

export type NodeType = "company" | "project" | "task";

export interface TreeNode {
  id: string;
  type: NodeType;
  name: string;
  status?: string;
  childCount?: string;
  completed?: boolean;
  children?: TreeNode[];
}

const TYPE_ICON: Record<NodeType, string> = { company: "🏢", project: "📄", task: "☰" };

const STATUS_COLOR: Record<string, string> = {
  "Hoàn thành": "#10B981",
  "Đang làm": "#10B981",
  "Cần làm": "#8A93A6",
  "Triển khai": "#0D9488",
  "Đề xuất & Chọn": "#8B5CF6",
  "Định nghĩa": "#F59E0B",
  "R&D": "#F59E0B",
};

let uid = 1000;
function genId(prefix: string): string {
  uid += 1;
  return `${prefix}-${uid}`;
}

const initialData: TreeNode[] = [
  {
    id: "co-1",
    type: "company",
    name: "Đất Việt Group",
    childCount: "2 công ty con",
    children: [
      {
        id: "co-1-1",
        type: "company",
        name: "Đất Việt Miền Nam",
        childCount: "2 dự án",
        children: [
          {
            id: "pr-1",
            type: "project",
            name: "Sky Garden (500 căn hộ)",
            status: "Triển khai",
            childCount: "3 công việc",
            children: [
              { id: "tk-1", type: "task", name: "Chuẩn bị bảng giá bán", status: "Hoàn thành", completed: true },
              { id: "tk-2", type: "task", name: "Duyệt mẫu banner quảng cáo", status: "Đang làm", completed: false },
              { id: "tk-3", type: "task", name: "Ký hợp đồng đại lý phân phối", status: "Cần làm", completed: false },
            ],
          },
          {
            id: "pr-2",
            type: "project",
            name: "Sunrise Riverside",
            status: "Đề xuất & Chọn",
            childCount: "1 công việc",
            children: [{ id: "tk-4", type: "task", name: "Khảo sát nhu cầu khách hàng", status: "Cần làm", completed: false }],
          },
        ],
      },
      {
        id: "co-1-2",
        type: "company",
        name: "Đất Việt Miền Bắc",
        childCount: "1 dự án",
        children: [
          {
            id: "pr-3",
            type: "project",
            name: "Golden Bay",
            status: "Định nghĩa",
            childCount: "1 công việc",
            children: [{ id: "tk-5", type: "task", name: "Khảo sát thị trường khu vực", status: "Đang làm", completed: false }],
          },
        ],
      },
    ],
  },
  {
    id: "co-2",
    type: "company",
    name: "An Gia Land",
    childCount: "2 dự án",
    children: [
      { id: "pr-4", type: "project", name: "Ánh Dương Residence", status: "R&D", children: [] },
      {
        id: "pr-5",
        type: "project",
        name: "Lakeview City",
        status: "Triển khai",
        childCount: "1 công việc",
        children: [{ id: "tk-6", type: "task", name: "Lập kế hoạch truyền thông ra mắt", status: "Cần làm", completed: false }],
      },
    ],
  },
];

function suffixFor(childType: NodeType): string {
  return childType === "company" ? "công ty con" : childType === "project" ? "dự án" : "công việc";
}

function recomputeCounts(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((n) => {
    if (!n.children) return n;
    const children = recomputeCounts(n.children);
    const childCount = children.length > 0 ? `${children.length} ${suffixFor(children[0].type)}` : undefined;
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

/**
 * AssignmentTree
 * Tab "Phân công" — cây Group > Công ty con > Dự án > Công việc, kéo-thả
 * công việc giữa các dự án (react-arborist). Toàn bộ logic + mock data gói
 * trong 1 file theo yêu cầu.
 */
export function AssignmentTree() {
  const [data, setData] = useState<TreeNode[]>(initialData);

  function handleAdd(parent: TreeNode, type: NodeType) {
    const label = type === "company" ? "công ty con" : type === "project" ? "dự án" : "công việc";
    const name = window.prompt(`Tên ${label} mới:`);
    if (!name || !name.trim()) return;
    const node: TreeNode = {
      id: genId(type),
      type,
      name: name.trim(),
      status: type === "task" ? "Cần làm" : undefined,
      completed: type === "task" ? false : undefined,
      children: type === "task" ? undefined : [],
    };
    setData((prev) => recomputeCounts(addChildTo(prev, parent.id, node)));
  }

  function handleDelete(node: TreeNode) {
    if (!window.confirm(`Xoá "${node.name}"? Các mục con bên trong cũng sẽ bị xoá.`)) return;
    setData((prev) => recomputeCounts(deleteNode(prev, node.id)));
  }

  function handleToggleTask(node: TreeNode) {
    setData((prev) => toggleTask(prev, node.id));
  }

  function handleMove({ dragIds, parentId, index }: { dragIds: string[]; parentId: string | null; index: number }) {
    if (!parentId) return;
    setData((prev) => {
      let working = prev;
      dragIds.forEach((id, i) => {
        const { removed, nodes } = removeNodeDeep(working, id);
        working = nodes;
        if (removed) {
          working = insertNodeAt(working, parentId, index + i, removed);
          console.log(`Cập nhật project_id cho công việc "${removed.name}" -> ${parentId}`);
        }
      });
      return recomputeCounts(working);
    });
  }

  function Row({ node, style, dragHandle }: NodeRendererProps<TreeNode>) {
    const item = node.data;
    const isTask = item.type === "task";
    const canToggle = !isTask && !!item.children && item.children.length > 0;
    const linePrefix = getTreeLinePrefix(node, { last: "└─ ", middle: "├─ ", pipe: "│  ", blank: "   " });

    return (
      <div
        ref={isTask ? dragHandle : undefined}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: "100%",
          padding: "0 12px",
          background: node.willReceiveDrop ? "var(--brand-soft)" : "transparent",
          borderRadius: 8,
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
              style={linkBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleAdd(item, "company");
              }}
            >
              + Công ty con
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
    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, padding: 8 }}>
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
    </div>
  );
}
