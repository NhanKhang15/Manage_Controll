export type TaskGroup = "mine" | "dept" | "all";

export interface TaskGroupTabsProps {
  active: TaskGroup;
  onChange: (group: TaskGroup) => void;
}

const GROUPS: { id: TaskGroup; label: string }[] = [
  { id: "mine", label: "Của tôi" },
  { id: "dept", label: "Cả phòng" },
  { id: "all", label: "Toàn công ty" },
];

export function TaskGroupTabs({ active, onChange }: TaskGroupTabsProps) {
  return (
    <div className="group-tabs">
      {GROUPS.map((g) => (
        <button
          key={g.id}
          type="button"
          className={`group-tab${active === g.id ? " on" : ""}`}
          onClick={() => onChange(g.id)}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
