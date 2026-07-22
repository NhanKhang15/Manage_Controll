import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ProjectMockItem } from "../../mocks/projects";
import type { ProjectTaskItem } from "../../mocks/projectTasks";

const STATUS_COLOR: Record<ProjectTaskItem["status"], string> = {
  todo: "#AEB6C4",
  in_progress: "#F59E0B",
  review: "#8B5CF6",
  done: "#10B981",
};

const NODE_STYLE = { background: "transparent", border: "none", width: 200, padding: 0 };

function buildLayout(project: ProjectMockItem, tasks: ProjectTaskItem[]) {
  const topLevel = tasks.filter((t) => !t.parentId);
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const colWidth = 220;

  nodes.push({
    id: "root",
    position: { x: (topLevel.length * colWidth) / 2 - 100, y: 0 },
    data: { label: <div className="mm-node-card root">{project.name}</div> },
    style: NODE_STYLE,
  });

  topLevel.forEach((task, i) => {
    const x = i * colWidth;
    nodes.push({
      id: task.id,
      position: { x, y: 140 },
      data: {
        label: (
          <div className="mm-node-card" style={{ borderTop: `3px solid ${STATUS_COLOR[task.status]}` }}>
            {task.title}
          </div>
        ),
      },
      style: NODE_STYLE,
    });
    edges.push({ id: `e-root-${task.id}`, source: "root", target: task.id });

    const children = tasks.filter((t) => t.parentId === task.id);
    children.forEach((child, j) => {
      nodes.push({
        id: child.id,
        position: { x: x - 20 + j * 40, y: 280 },
        data: {
          label: (
            <div
              className="mm-node-card"
              style={{ borderTop: `3px solid ${STATUS_COLOR[child.status]}`, fontSize: 12, minWidth: 120 }}
            >
              {child.title}
            </div>
          ),
        },
        style: { ...NODE_STYLE, width: 180 },
      });
      edges.push({ id: `e-${task.id}-${child.id}`, source: task.id, target: child.id });
    });
  });

  return { nodes, edges };
}

/**
 * ProjectMindmap
 * Bọc @xyflow/react (React Flow) — sơ đồ dự án → công việc → subtask. Layout
 * đơn giản tự tính (không cần thư viện auto-layout riêng vì dữ liệu nhỏ).
 * CSS: .vela-mindmap, .mm-node-card
 */
export interface ProjectMindmapProps {
  project: ProjectMockItem;
  tasks: ProjectTaskItem[];
}

export function ProjectMindmap({ project, tasks }: ProjectMindmapProps) {
  const { nodes, edges } = buildLayout(project, tasks);

  return (
    <div className="vela-mindmap">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
