/**
 * Chip
 * Nhãn trạng thái/tag.
 * CSS gốc tham chiếu: .chip, .st-todo, .st-in_progress, .st-done
 */
export interface ChipProps {
  label: string;
  variant?: "default" | "todo" | "in_progress" | "done" | "late" | "soon";
  color?: string;
}

const VARIANT_STYLE: Record<NonNullable<ChipProps["variant"]>, { background: string; color: string }> = {
  default: { background: "var(--line-2)", color: "#5A6478" },
  todo: { background: "#E0E7FF", color: "#4338CA" },
  in_progress: { background: "#FEF3C7", color: "#B45309" },
  done: { background: "#D1FAE5", color: "#047857" },
  late: { background: "#FEE2E2", color: "#B91C1C" },
  soon: { background: "#FFFBEB", color: "#D97706" },
};

export function Chip({ label, variant = "default", color }: ChipProps) {
  const style = color ? { background: `${color}1a`, color } : VARIANT_STYLE[variant];
  return (
    <span className="chip" style={style}>
      {label}
    </span>
  );
}
