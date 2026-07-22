import type { CSSProperties, ReactNode } from "react";

/**
 * Panel
 * Khung thẻ/khối chứa nội dung chung với viền và bo góc.
 * CSS gốc tham chiếu: .panel, .panel-h
 */
export interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Panel({ title, children, className = "", style }: PanelProps) {
  return (
    <div className={`panel ${className}`.trim()} style={style}>
      {title && <div className="panel-h">{title}</div>}
      {children}
    </div>
  );
}
