import { useState } from "react";
import { Panel } from "../../components/ui/Panel";

const DEFAULT_CULTURE = `Chào mừng bạn gia nhập công ty! 🎉

• Giá trị cốt lõi: Chính trực - Trách nhiệm - Hợp tác - Cầu tiến.
• Giờ làm việc & quy định chấm công theo nội quy lao động.
• Chủ động trao đổi, tôn trọng đồng nghiệp, ưu tiên hiệu quả công việc.
• Mọi thắc mắc liên hệ phòng Hành chính - Nhân sự.`;

export interface CompanyCulturePanelProps {
  read: boolean;
  onRead: () => void;
}

export function CompanyCulturePanel({ read, onRead }: CompanyCulturePanelProps) {
  const [culture, setCulture] = useState(DEFAULT_CULTURE);
  const [draft, setDraft] = useState(DEFAULT_CULTURE);

  return (
    <Panel>
      <div className="panel-h">🏛️ Văn hóa công ty</div>
      <div style={{ padding: "4px 6px 10px", whiteSpace: "pre-wrap", color: "#374151" }}>{culture}</div>
      <button type="button" className="btn btn-primary btn-sm" style={{ margin: "0 6px 10px" }} disabled={read} onClick={onRead}>
        👍 {read ? "Đã đọc & hiểu" : "Tôi đã đọc & hiểu"}
      </button>
      <details style={{ margin: "0 6px 8px" }}>
        <summary className="muted" style={{ cursor: "pointer" }}>✏️ Sửa nội dung văn hóa (BOD)</summary>
        <form
          className="settings-form"
          style={{ marginTop: 8 }}
          onSubmit={(e) => {
            e.preventDefault();
            setCulture(draft);
          }}
        >
          <textarea rows={6} style={{ width: "100%", font: "inherit" }} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit" className="btn btn-ghost btn-sm">Lưu</button>
        </form>
      </details>
    </Panel>
  );
}
