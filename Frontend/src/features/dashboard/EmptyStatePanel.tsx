import type { ReactNode } from "react";

/**
 * EmptyStatePanel
 * Panel dùng chung cho "Việc của tôi" và "Cuộc họp sắp tới" — hiện danh sách
 * ngắn (tối đa vài dòng) khi có dữ liệu thật, ngược lại rơi về trạng thái
 * rỗng gốc.
 * Thẻ HTML gốc: <div class=panel>
 * CSS gốc tham chiếu: .panel, .panel-h, .panel-link, .mini-empty, .dash-row
 */
export interface EmptyStatePanelItem {
  id: string;
  label: ReactNode;
  meta?: ReactNode;
}

export interface EmptyStatePanelProps {
  heading: string;
  linkLabel: string;
  href: string;
  emptyText: string;
  items?: EmptyStatePanelItem[];
}

export function EmptyStatePanel({ heading, linkLabel, href, emptyText, items = [] }: EmptyStatePanelProps) {
  return (
    <div className="panel">
      <div className="panel-h">
        {heading}
        <a className="panel-link" href={href}>
          {linkLabel}
        </a>
      </div>
      {items.length === 0 ? (
        <div className="mini-empty">{emptyText}</div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="dash-row">
            <span className="dash-row-title">{item.label}</span>
            {item.meta && <span className="chip">{item.meta}</span>}
          </div>
        ))
      )}
    </div>
  );
}
