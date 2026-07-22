import { useState } from "react";
import { AttnSummaryToggle } from "./AttnSummaryToggle";
import { AttnChips } from "./AttnChips";
import { AttnCategoryPanel } from "./AttnCategoryPanel";
import type { AttnCategory, AttentionItem } from "../../../types/assistant";

/**
 * AttentionPanel
 * Khu vực "9 việc cần để ý hôm nay" - toggle mở chip danh mục và panel chi tiết
 * theo từng loại.
 * Thẻ HTML gốc: <div id=attn class=attn>
 * CSS gốc tham chiếu: .attn
 */
export interface AttentionPanelProps {
  totalCount: number;
  categories: AttnCategory[];
  items: AttentionItem[];
  onAction?: (item: AttentionItem, action: "primary" | "secondary") => void;
}

export function AttentionPanel({ totalCount, categories, items, onAction }: AttentionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeKey, setActiveKey] = useState(categories[0]?.key ?? "");

  return (
    <div className="attn" id="attn">
      <AttnSummaryToggle count={totalCount} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      {expanded && (
        <>
          <AttnChips categories={categories} activeKey={activeKey} onSelect={setActiveKey} />
          <AttnCategoryPanel
            category={activeKey}
            items={items.filter((item) => item.category === activeKey)}
            onAction={onAction}
          />
        </>
      )}
    </div>
  );
}
