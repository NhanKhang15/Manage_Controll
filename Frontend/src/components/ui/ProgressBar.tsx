/**
 * ProgressBar
 * Thanh tiến độ dùng chung (thẻ dự án, panel chi tiết Thư mục...).
 * CSS gốc tham chiếu: .a-progress, .a-progress.big
 */
export interface ProgressBarProps {
  progress: number;
  color?: string;
  size?: "sm" | "big";
}

export function ProgressBar({ progress, color = "var(--brand)", size = "sm" }: ProgressBarProps) {
  return (
    <div className={`a-progress${size === "big" ? " big" : ""}`}>
      <span style={{ width: `${Math.min(100, Math.max(0, progress))}%`, background: color }} />
    </div>
  );
}
