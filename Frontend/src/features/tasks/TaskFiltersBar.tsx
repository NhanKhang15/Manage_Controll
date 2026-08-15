import type { ProjectOption } from "./types";
import type { DepartmentOption } from "../../api/companies";

export interface TaskFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  projects: ProjectOption[];
  projectFilter: string;
  onProjectFilterChange: (projectId: string) => void;
  departments: DepartmentOption[];
  departmentFilter: string;
  onDepartmentFilterChange: (departmentId: string) => void;
}

export function TaskFiltersBar({
  searchQuery,
  onSearchChange,
  projects,
  projectFilter,
  onProjectFilterChange,
  departments,
  departmentFilter,
  onDepartmentFilterChange,
}: TaskFiltersBarProps) {
  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <input
        className="filter-search"
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Tìm theo tên việc…"
        style={{ minWidth: 200 }}
      />

      <select value={departmentFilter} onChange={(e) => onDepartmentFilterChange(e.target.value)}>
        <option value="">Tất cả phòng ban</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <select value={projectFilter} onChange={(e) => onProjectFilterChange(e.target.value)}>
        <option value="">Tất cả dự án</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </form>
  );
}
