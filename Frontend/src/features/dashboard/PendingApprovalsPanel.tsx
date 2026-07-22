import type { ApprovalItem } from "../../types/dashboard";

/**
 * PendingApprovalsPanel
 * Panel "Chờ duyệt" — danh sách khoản cần phê duyệt.
 * Thẻ HTML gốc: <div class=panel> chứa .dash-row
 * CSS gốc tham chiếu: .panel, .dash-row, .chip.st-todo
 */
export interface PendingApprovalsPanelProps {
  items: ApprovalItem[];
  href?: string;
}

export function PendingApprovalsPanel({ items, href = "?page=tasks&tab=approvals" }: PendingApprovalsPanelProps) {
  return (
    <div className="panel">
      <div className="panel-h">
        🖐️ Chờ duyệt
        <a className="panel-link" href={href}>
          Xử lý ›
        </a>
      </div>
      {items.map((item) => (
        <div key={item.id} className="dash-row">
          <span className="dash-row-title">{item.title}</span>
          <span className="chip st-todo">{item.amount}</span>
        </div>
      ))}
    </div>
  );
}
