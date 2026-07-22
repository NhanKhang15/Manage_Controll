import type { AttnCategory } from "../../../types/assistant";

/**
 * AttnChips
 * Danh sách chip lọc theo danh mục (vd: Cần duyệt, Trễ hạn...).
 * Thẻ HTML gốc: <div id=attnChips class="attn-chips sf-hidden">
 * CSS gốc tham chiếu: .attn-chips, .attn-chip
 */
export interface AttnChipsProps {
  categories: AttnCategory[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function AttnChips({ categories, activeKey, onSelect }: AttnChipsProps) {
  return (
    <div className="attn-chips" id="attnChips">
      {categories.map((cat) => (
        <button
          key={cat.key}
          type="button"
          className={`attn-chip${cat.key === activeKey ? " active" : ""}`}
          onClick={() => onSelect(cat.key)}
        >
          {cat.label} ({cat.count})
        </button>
      ))}
    </div>
  );
}
