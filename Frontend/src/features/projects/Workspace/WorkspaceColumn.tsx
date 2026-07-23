import type { ReactNode } from "react";

/**
 * WorkspaceColumn
 * 1 cột trong trình duyệt Thư mục (Miller column) — tiêu đề + nút thêm + danh sách item.
 * CSS gốc tham chiếu: .wk-col, .wk-col-h, .wk-add
 */
export interface WorkspaceColumnProps {
  title: string;
  onAdd?: () => void;
  addTitle?: string;
  children: ReactNode;
}

export function WorkspaceColumn({ title, onAdd, addTitle, children }: WorkspaceColumnProps) {
  return (
    <div className="wk-col">
      <div className="wk-col-h">
        <span>{title}</span>
        {onAdd && (
          <button type="button" className="wk-add" title={addTitle} onClick={onAdd}>
            ＋
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
