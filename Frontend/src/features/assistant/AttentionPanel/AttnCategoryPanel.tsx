import type { AttentionItem } from "../../../types/assistant";

/**
 * AttnCategoryPanel
 * Panel chi tiết theo category (vd: "approve", "late").
 * Thẻ HTML gốc: <div class="attn-panel sf-hidden" data-cat=approve|late>
 * CSS gốc tham chiếu: .attn-panel, .attn-item, .a-btn
 */
export interface AttnCategoryPanelProps {
  category: string;
  items: AttentionItem[];
  onAction?: (item: AttentionItem, action: "primary" | "secondary") => void;
}

export function AttnCategoryPanel({ category, items, onAction }: AttnCategoryPanelProps) {
  const isApprove = category === "approve";

  return (
    <div className="attn-panel" data-cat={category}>
      {items.map((item) => (
        <div key={item.id} className="attn-item" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.title}</div>
            <span className="attn-item-meta">{item.meta}</span>
          </div>
          <button type="button" className="a-btn" onClick={() => onAction?.(item, "secondary")}>
            {isApprove ? "Từ chối" : "Xem việc"}
          </button>
          <button type="button" className="a-btn primary" onClick={() => onAction?.(item, "primary")}>
            {isApprove ? "Duyệt" : "Nhắc hẹn"}
          </button>
        </div>
      ))}
    </div>
  );
}
