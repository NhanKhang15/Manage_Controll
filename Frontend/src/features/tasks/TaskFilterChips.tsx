export type TaskFlagFilter = "all" | "flag" | "problem" | "overdue" | "auto";

export interface TaskFilterChipsProps {
  active: TaskFlagFilter;
  onSelect: (chip: TaskFlagFilter) => void;
}

const CHIPS: { id: TaskFlagFilter; label: string; auto?: boolean }[] = [
  { id: "all", label: "📋 Tất cả" },
  { id: "flag", label: "🚩 Gắn cờ" },
  { id: "problem", label: "⚠️ Có vấn đề" },
  { id: "overdue", label: "🔥 Trễ hạn" },
  { id: "auto", label: "🤖 AI tự động hoá được", auto: true },
];

export function TaskFilterChips({ active, onSelect }: TaskFilterChipsProps) {
  return (
    <div className="task-filter-chips">
      {CHIPS.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`tfchip${active === c.id ? " on" : ""}${c.auto ? " tf-auto" : ""}`}
          onClick={() => onSelect(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
