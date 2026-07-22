import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";

export interface TaskHeaderProps {
  onCreateTask?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export function TaskHeader({ onCreateTask, searchQuery, onSearchChange }: TaskHeaderProps) {
  return (
    <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
      <div>
        <h1>Công việc</h1>
        <p className="page-sub">Quản lý và theo dõi tiến độ công việc được giao</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", minWidth: 240 }}>
          <input
            type="text"
            placeholder="Tìm công việc..."
            value={searchQuery || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              fontSize: 14,
              outline: "none",
            }}
          />
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
            <Icon name="search" size={16} />
          </div>
        </div>
        <Button variant="primary" onClick={onCreateTask}>
          + Tạo công việc
        </Button>
      </div>
    </div>
  );
}
