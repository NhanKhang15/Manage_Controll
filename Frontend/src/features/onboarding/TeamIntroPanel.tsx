import { Panel } from "../../components/ui/Panel";
import { PersonChip } from "../../components/ui/PersonChip";
import type { EmployeeListItem } from "../../api/employees";

export interface TeamIntroPanelProps {
  manager: EmployeeListItem | null;
  colleagues: EmployeeListItem[];
  greeted: boolean;
  onGreet: () => void;
}

export function TeamIntroPanel({ manager, colleagues, greeted, onGreet }: TeamIntroPanelProps) {
  return (
    <Panel>
      <div className="panel-h">🤝 Quản lý &amp; đồng nghiệp cùng phòng</div>
      <div style={{ padding: "4px 6px 10px" }}>
        {manager && (
          <div className="setting-row">
            <span>
              <b>Quản lý trực tiếp:</b> <PersonChip name={manager.full_name} avatarUrl={manager.avatar_url} />
            </span>
            <span className="muted">
              {manager.email} {manager.phone ? `· ${manager.phone}` : ""}
            </span>
          </div>
        )}
        <div style={{ marginTop: 6 }}>
          <b>Đồng nghiệp:</b> <small className="muted">(bấm để xem hồ sơ)</small>
          <br />
          {colleagues.map((c) => (
            <PersonChip key={c.id} name={c.full_name} title={`${c.full_name} — ${c.position_title ?? ""}`} avatarUrl={c.avatar_url} />
          ))}
        </div>
        <form style={{ marginTop: 8 }} onSubmit={(e) => e.preventDefault()}>
          <button type="button" className="btn btn-primary btn-sm" disabled={greeted} onClick={onGreet}>
            👋 {greeted ? "Đã chào hỏi team" : "Đã chào hỏi team"}
          </button>
        </form>
      </div>
    </Panel>
  );
}
