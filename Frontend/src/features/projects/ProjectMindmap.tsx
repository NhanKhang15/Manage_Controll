import { useCallback, useEffect, useMemo, useState } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MindmapNode } from "./MindmapNode";
import type { ProjectNode, ProjectTaskNode } from "./types";
import { colorFromName } from "../../utils/color";
import { useAuth } from "../../auth/AuthContext";
import { getUserId } from "../../auth/tokenStorage";

const nodeTypes = { mm: MindmapNode };
const ROOT_COLOR = "#64748B";
const LEVEL_W = 360;
const ROW_H = 46;

type MMKind = "root" | "project" | "task";

interface MMNode {
  id: string;
  title: string;
  kind: MMKind;
  children: MMNode[];
  task?: ProjectTaskNode;
}

function taskToMM(t: ProjectTaskNode): MMNode {
  return { id: t.id, title: t.title, kind: "task", children: t.children.map(taskToMM), task: t };
}

function buildTree(companyName: string, projects: ProjectNode[]): MMNode {
  return {
    id: "root",
    title: companyName,
    kind: "root",
    children: projects.map((p) => ({ id: p.id, title: p.name, kind: "project", children: p.tasks.map(taskToMM) })),
  };
}

/** Helper function to read collapsed node IDs array from localStorage for a given account key */
function loadCollapsedForUser(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch {
    // Ignore JSON error
  }
  return new Set();
}

/** Helper function to save collapsed node IDs array to localStorage */
function saveCollapsedForUser(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore quota error
  }
}

/**
 * ProjectMindmap
 * Cây toàn công ty: Pháp nhân (root) → Dự án → Công việc → việc con... —
 * tự tính layout kiểu tidy-tree (đệ quy theo chiều sâu bất kỳ), mỗi nhánh
 * thu/mở độc lập. Bọc @xyflow/react (React Flow) để có sẵn kéo/zoom.
 * Tự động lưu trạng thái đóng/mở từng nhánh cây theo TỪNG TÀI KHOẢN (Per-User Account State).
 * CSS: .vela-mindmap-container, .mm-toolbar, .vela-mindmap, .mm-pill
 */
export interface ProjectMindmapProps {
  companyName: string;
  projects: ProjectNode[];
  onSelectTask?: (task: ProjectTaskNode) => void;
}

export function ProjectMindmap({ companyName, projects, onSelectTask }: ProjectMindmapProps) {
  const { employee } = useAuth();
  const userId = employee?.id || getUserId() || "guest";
  const userDisplayName = employee?.full_name || "Tài khoản";
  const storageKey = `vela_mindmap_collapsed_${userId}`;

  // Initialize state from local storage for current user
  const [collapsed, setCollapsed] = useState<Set<string>>(() => loadCollapsedForUser(storageKey));

  // Reload state whenever logged in user changes
  useEffect(() => {
    setCollapsed(loadCollapsedForUser(storageKey));
  }, [storageKey]);

  // Toggle single node branch & persist to local storage per account
  const toggle = useCallback(
    (id: string) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        saveCollapsedForUser(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  // Expand all branches
  const expandAll = useCallback(() => {
    const emptySet = new Set<string>();
    setCollapsed(emptySet);
    saveCollapsedForUser(storageKey, emptySet);
  }, [storageKey]);

  // Collapse all branches
  const collapseAll = useCallback(() => {
    const allIds: string[] = [];
    function collect(node: MMNode) {
      allIds.push(node.id);
      node.children.forEach(collect);
    }
    const tree = buildTree(companyName, projects);
    collect(tree);
    const nextSet = new Set(allIds);
    setCollapsed(nextSet);
    saveCollapsedForUser(storageKey, nextSet);
  }, [companyName, projects, storageKey]);

  const { nodes, edges } = useMemo(() => {
    const root = buildTree(companyName, projects);
    const nodesOut: Node[] = [];
    const edgesOut: Edge[] = [];
    let cursor = 0;

    function place(node: MMNode, depth: number, parentId: string | null): number {
      const hasChildren = node.children.length > 0;
      const isCollapsed = collapsed.has(node.id);
      let y: number;
      if (!hasChildren || isCollapsed) {
        y = cursor;
        cursor += ROW_H;
      } else {
        const childYs = node.children.map((c) => place(c, depth + 1, node.id));
        y = (childYs[0] + childYs[childYs.length - 1]) / 2;
      }

      const color = node.kind === "root" ? ROOT_COLOR : colorFromName(node.title);
      nodesOut.push({
        id: node.id,
        type: "mm",
        position: { x: depth * LEVEL_W, y },
        data: {
          label: node.title,
          color,
          isRoot: node.kind === "root",
          childCount: node.children.length,
          collapsed: isCollapsed,
          hasChildren,
          onToggle: () => toggle(node.id),
          onSelect: hasChildren ? () => toggle(node.id) : () => node.task && onSelectTask?.(node.task),
        },
      });
      if (parentId) {
        edgesOut.push({ id: `e-${parentId}-${node.id}`, source: parentId, target: node.id, style: { stroke: color } });
      }
      return y;
    }

    place(root, 0, null);
    return { nodes: nodesOut, edges: edgesOut };
  }, [companyName, projects, collapsed, toggle, onSelectTask]);

  return (
    <div className="vela-mindmap-container">
      <div className="mm-toolbar">
        <div className="mm-info">
          <span>
            🧠 <strong>Mindmap:</strong> Trạng thái thu/mở các nhánh được tự động lưu theo tài khoản <strong>{userDisplayName}</strong>.
          </span>
        </div>

        <div className="mm-actions">
          <button type="button" className="mm-action-btn" onClick={expandAll}>
            ▾ Mở tất cả
          </button>
          <button type="button" className="mm-action-btn" onClick={collapseAll}>
            ▸ Thu gọn tất cả
          </button>
        </div>
      </div>

      <div className="vela-mindmap">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
