import { Button } from "../../components/ui/Button";
import { formatAmountVi, type Proposal } from "../../api/proposals";

/**
 * ProposalApprovalList
 * Danh sách đề xuất chờ duyệt: icon + tiêu đề + số tiền + mô tả/người đề xuất +
 * 2 nút Duyệt/Từ chối. Dùng chung cho tab "Chờ duyệt" ở trang Công việc và
 * trang Đề xuất & duyệt. Tái dùng style thẻ .attn-item và icon box .kpi-ico
 * đã có sẵn thay vì tạo CSS mới.
 */
export interface ProposalApprovalListProps {
  proposals: Proposal[];
  onApprove: (proposal: Proposal) => void;
  onReject: (proposal: Proposal) => void;
  emptyText?: string;
  /** Người đang xem có quyền Duyệt/Từ chối không — nếu không, chỉ hiển thị để xem, ẩn 2 nút. */
  canApprove?: boolean;
}

export function ProposalApprovalList({ proposals, onApprove, onReject, emptyText, canApprove = true }: ProposalApprovalListProps) {
  if (proposals.length === 0) {
    return (
      <p className="muted" style={{ fontSize: 13, padding: "4px 0" }}>
        {emptyText ?? "Không có đề xuất nào chờ duyệt."}
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {proposals.map((p) => (
        <div key={p.id} className="attn-item" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="kpi-ico" style={{ background: "var(--brand-soft)", color: "var(--brand)" }} aria-hidden="true">
            🧾
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {p.title} <span style={{ color: "var(--brand)", fontWeight: 700 }}>{formatAmountVi(p.amount)}</span>
            </div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              {p.note}
              {p.note ? " · " : ""}đề xuất bởi <b>{p.requester_name}</b>
            </div>
          </div>
          {canApprove ? (
            <div style={{ display: "flex", gap: 8, flex: "none" }}>
              <Button size="sm" variant="approve" onClick={() => onApprove(p)}>
                ✓ Duyệt
              </Button>
              <Button size="sm" variant="reject" onClick={() => onReject(p)}>
                ✕ Từ chối
              </Button>
            </div>
          ) : (
            <span className="alert-tag" style={{ background: "var(--line-2)", color: "var(--muted)", flex: "none" }}>
              Chờ người có quyền duyệt
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
