import { useState } from "react";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { MemberChipList } from "../../../components/ui/MemberChipList";
import { CommentThread, type CommentMessage } from "../../../components/ui/CommentThread";
import { Button } from "../../../components/ui/Button";

export interface WorkspaceRevenueProps {
  value: number | null;
  onSave: (value: number) => void;
}

export interface WorkspaceThreadProps {
  messages: CommentMessage[];
  onSend: (text: string) => void;
}

/**
 * WorkspaceDetailPanel
 * Panel chi tiết bên phải trình duyệt Thư mục — ráp .wk-d-sec lặp lại
 * (tiến độ, doanh thu, thành viên, 2 luồng trao đổi) cho node đang chọn
 * (dự án hoặc công việc).
 * CSS gốc tham chiếu: .wk-detail, .wk-d-head, .wk-d-ico, .wk-d-crumb, .wk-d-title,
 * .wk-d-sec, .wk-d-lbl, .wk-d-pct, .wk-d-notes, .proj-rev-row, .proj-stat-line
 */
export interface WorkspaceDetailPanelProps {
  icon: string;
  breadcrumb: string;
  title: string;
  notes?: string;
  progress: number;
  progressColor: string;
  statLine: string;
  revenue?: WorkspaceRevenueProps;
  members: string[];
  internalThread: WorkspaceThreadProps;
  sharedThread: WorkspaceThreadProps;
}

function formatRevenue(value: number): string {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

export function WorkspaceDetailPanel({
  icon,
  breadcrumb,
  title,
  notes,
  progress,
  progressColor,
  statLine,
  revenue,
  members,
  internalThread,
  sharedThread,
}: WorkspaceDetailPanelProps) {
  const [revenueDraft, setRevenueDraft] = useState(() => String(revenue?.value ?? 0));

  return (
    <div className="wk-detail">
      <div className="wk-d-head">
        <span className="wk-d-ico">{icon}</span>
        <div>
          <div className="wk-d-crumb">{breadcrumb}</div>
          <h2 className="wk-d-title">{title}</h2>
        </div>
      </div>

      {notes && <p className="wk-d-notes">{notes}</p>}

      <div className="wk-d-sec">
        <div className="wk-d-lbl">
          Tiến độ <b className="wk-d-pct">{progress}%</b>
        </div>
        <ProgressBar progress={progress} color={progressColor} size="big" />
        <div className="proj-stat-line">{statLine}</div>
      </div>

      {revenue && (
        <div className="wk-d-sec">
          <div className="wk-d-lbl">💵 Doanh thu / Giá trị hợp đồng dự án</div>
          <div className="proj-rev-row">
            <input
              type="text"
              inputMode="numeric"
              value={revenueDraft}
              onChange={(e) => setRevenueDraft(e.target.value)}
              placeholder="VD: 200000000"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const parsed = Number(revenueDraft.replace(/\D/g, ""));
                if (!Number.isNaN(parsed)) revenue.onSave(parsed);
              }}
            >
              Lưu
            </Button>
            <span className="muted proj-rev-fmt">
              {revenue.value ? formatRevenue(revenue.value) : "Chưa nhập"}
            </span>
          </div>
          <p className="muted" style={{ fontSize: 12, margin: "4px 0 0" }}>
            Dùng để quy doanh thu &amp; tính đóng góp từng người ở trang Hiệu suất.
          </p>
        </div>
      )}

      <div className="wk-d-sec">
        <div className="wk-d-lbl">👥 Thành viên tham gia ({members.length})</div>
        <MemberChipList members={members} />
      </div>

      <div className="wk-d-sec">
        <div className="wk-d-lbl">
          🔒 Trao đổi nội bộ <small className="muted">(chỉ nhân viên thấy)</small>
        </div>
        <CommentThread
          messages={internalThread.messages}
          onSend={internalThread.onSend}
          emptyText="Chưa có trao đổi nội bộ."
          placeholder="Ghi chú/nội bộ…"
        />
      </div>

      <div className="wk-d-sec">
        <div className="wk-d-lbl">
          💬 Trao đổi với khách <small className="muted">(gắn khách hàng để chia sẻ với họ)</small>
        </div>
        <CommentThread
          messages={sharedThread.messages}
          onSend={sharedThread.onSend}
          emptyText="Chưa có trao đổi với khách."
          placeholder="Nội dung trao đổi với khách…"
        />
      </div>
    </div>
  );
}
