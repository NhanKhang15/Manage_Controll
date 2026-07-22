/**
 * Chip
 * Nhãn trạng thái/tag.
 * CSS gốc tham chiếu: .chip, .st-todo, .st-in_progress, .st-done
 */
export interface ChipProps {
  label: string;
  variant?: "default" | "todo" | "in_progress" | "done";
}

const VARIANT_STYLE: Record<NonNullable<ChipProps["variant"]>, { background: string; color: string }> = {
  default: { background: "var(--line-2)", color: "#5A6478" },
  todo: { background: "#E0E7FF", color: "#4338CA" },
  in_progress: { background: "#FEF3C7", color: "#B45309" },
  done: { background: "#D1FAE5", color: "#047857" },
};

export function Chip({ label, variant = "default" }: ChipProps) {
  return (
    <span className="chip" style={VARIANT_STYLE[variant]}>
      {label}
    </span>
  );
}
