import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface MindmapNodeData {
  label: string;
  color: string;
  isRoot?: boolean;
  childCount: number;
  collapsed: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onSelect: () => void;
  [key: string]: unknown;
}

/**
 * MindmapNode
 * Node dạng "pill" cho ProjectMindmap — chấm màu + tên + badge số con +
 * nút +/- thu/mở nhánh + nút "..." — khớp thiết kế tham chiếu (mm2-node).
 */
export function MindmapNode({ data }: NodeProps) {
  const { label, color, isRoot, childCount, collapsed, hasChildren, onToggle, onSelect } = data as unknown as MindmapNodeData;

  return (
    <div className={`mm-pill${isRoot ? " root" : ""}`} style={{ ["--mm-c" as string]: color }}>
      <Handle type="target" position={Position.Left} style={{ visibility: "hidden" }} />
      {hasChildren && (
        <button type="button" className="mm-toggle" onClick={onToggle} title={collapsed ? "Mở nhánh" : "Thu nhánh"}>
          {collapsed ? "+" : "–"}
        </button>
      )}
      <span className="mm-dot" />
      <button type="button" className="mm-label" onClick={onSelect} title={label}>
        {label}
      </button>
      {childCount > 0 && <span className="mm-count">{childCount}</span>}
      <button type="button" className="mm-more" title="Thao tác" onClick={onSelect}>
        ⋯
      </button>
      <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
    </div>
  );
}
