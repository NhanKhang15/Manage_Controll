import { departments } from "../../mocks/okr";

export interface OkrFilterBarProps {
  period: string;
  onChangePeriod: (period: string) => void;
  department: string;
  onChangeDepartment: (department: string) => void;
}

export function OkrFilterBar({ period, onChangePeriod, department, onChangeDepartment }: OkrFilterBarProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
      <label style={{ fontSize: 13 }}>
        Kỳ{" "}
        <input
          type="text"
          value={period}
          onChange={(e) => onChangePeriod(e.target.value)}
          style={{ width: 120, padding: "5px 8px", border: "1px solid var(--line)", borderRadius: 8 }}
        />
      </label>
      <select
        value={department}
        onChange={(e) => onChangeDepartment(e.target.value)}
        style={{ padding: "5px 8px", border: "1px solid var(--line)", borderRadius: 8 }}
      >
        <option value="">Tất cả phòng ban</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}
