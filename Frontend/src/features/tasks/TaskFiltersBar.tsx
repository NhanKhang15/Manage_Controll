import type { ProjectOption } from "./types";

export interface TaskFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  projects: ProjectOption[];
  projectFilter: string;
  onProjectFilterChange: (projectId: string) => void;
}

export function TaskFiltersBar({
  searchQuery,
  onSearchChange,
  projects,
  projectFilter,
  onProjectFilterChange,
}: TaskFiltersBarProps) {
  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()}>
      <input
        className="filter-search"
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Tìm theo tên việc…"
      />
      <select disabled title="Lọc theo bộ phận — sắp ra mắt" defaultValue="">
        <option value="">Tất cả phòng ban</option>
      </select>
      <select value={projectFilter} onChange={(e) => onProjectFilterChange(e.target.value)}>
        <option value="">Tất cả dự án</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <button type="submit" className="btn btn-ghost">
        Lọc
      </button>
    </form>
  );
}
