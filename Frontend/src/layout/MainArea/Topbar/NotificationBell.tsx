import { useRef, useState } from "react";
import { NotifMenu } from "./NotifMenu";
import { Icon } from "../../../components/ui/Icon";
import type { NotificationItem } from "../../../mocks/notifications";

/**
 * NotificationBell
 * Icon chuông + badge số lượng thông báo chưa đọc + dropdown danh sách thông báo.
 * Thẻ HTML gốc: <button class=bell>
 * CSS gốc tham chiếu: .bell
 */
export interface NotificationBellProps {
  unreadCount: number;
  items: NotificationItem[];
}

export function NotificationBell({ unreadCount, items }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button type="button" className="bell" ref={ref} onClick={() => setOpen((v) => !v)}>
      <Icon name="bell" />
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      <NotifMenu isOpen={open} onClose={() => setOpen(false)} anchorRef={ref} items={items} />
    </button>
  );
}
