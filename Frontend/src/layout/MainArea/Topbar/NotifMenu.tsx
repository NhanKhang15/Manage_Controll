import type { RefObject } from "react";
import { Dropdown } from "../../../components/ui/Dropdown";
import type { NotificationItem } from "../../../mocks/notifications";

/**
 * NotifMenu
 * Danh sách thông báo. Rỗng trong HTML gốc (JS runtime cũ tự inject).
 * Thẻ HTML gốc: <div id=notifMenu class="notif-menu sf-hidden">
 * CSS gốc tham chiếu: .notif-menu, .notif-item:hover
 */
export interface NotifMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  items: NotificationItem[];
}

export function NotifMenu({ isOpen, onClose, anchorRef, items }: NotifMenuProps) {
  return (
    <Dropdown isOpen={isOpen} onClose={onClose} anchorRef={anchorRef} className="notif-menu">
      {items.length === 0 ? (
        <div className="notif-item">Không có thông báo mới</div>
      ) : (
        items.map((n) => (
          <div key={n.id} className="notif-item" style={{ fontWeight: n.read ? 400 : 600 }}>
            <div>{n.title}</div>
            <small style={{ color: "var(--muted)" }}>{n.time}</small>
          </div>
        ))
      )}
    </Dropdown>
  );
}
