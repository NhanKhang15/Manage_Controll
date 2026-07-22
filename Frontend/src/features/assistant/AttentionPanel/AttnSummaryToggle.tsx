/**
 * AttnSummaryToggle
 * Dòng "9 việc cần để ý hôm nay ▾" để mở/đóng.
 * Thẻ HTML gốc: <button class=attn-summary id=attnSummary>
 * CSS gốc tham chiếu: .attn-summary
 */
export interface AttnSummaryToggleProps {
  count: number;
  expanded: boolean;
  onToggle: () => void;
}

export function AttnSummaryToggle({ count, expanded, onToggle }: AttnSummaryToggleProps) {
  return (
    <button type="button" className="attn-summary" id="attnSummary" onClick={onToggle}>
      {count} việc cần để ý hôm nay <span className={`caret${expanded ? " open" : ""}`}>▾</span>
    </button>
  );
}
