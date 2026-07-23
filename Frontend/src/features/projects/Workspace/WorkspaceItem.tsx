import { Avatar } from "../../../components/ui/Avatar";

/**
 * WorkspaceItem
 * 1 dòng trong cột workspace (pháp nhân / dự án / công việc).
 * CSS gốc tham chiếu: .wk-item(.on), .wk-ico, .wk-dot, .wk-title, .wk-due(.danger), .wk-pct, .wk-chev
 */
export interface WorkspaceItemProps {
  icon: string;
  dotColor?: string;
  title: string;
  due?: { label: string; danger?: boolean };
  pct?: string;
  avatarName?: string;
  active?: boolean;
  showChevron?: boolean;
  onClick?: () => void;
}

export function WorkspaceItem({
  icon,
  dotColor,
  title,
  due,
  pct,
  avatarName,
  active = false,
  showChevron = false,
  onClick,
}: WorkspaceItemProps) {
  return (
    <button type="button" className={`wk-item${active ? " on" : ""}`} onClick={onClick}>
      <span className="wk-ico">{icon}</span>
      {dotColor && <span className="wk-dot" style={{ background: dotColor }} />}
      <span className="wk-title">{title}</span>
      {due && <span className={`wk-due${due.danger ? " danger" : ""}`}>{due.label}</span>}
      {pct && <span className="wk-pct">{pct}</span>}
      {avatarName && <Avatar name={avatarName} size={20} />}
      {showChevron && <span className="wk-chev">›</span>}
    </button>
  );
}
