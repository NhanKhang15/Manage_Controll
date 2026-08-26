import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui/Icon";
import { Dropdown } from "../../../components/ui/Dropdown";
import { getNotifications, markNotificationRead, markAllNotificationsRead, type NotificationItem as RealNotifItem } from "../../../api/notifications";

const ICON_MAP: Record<string, string> = {
  calendar: "📅",
  check_green: "✅",
  chart: "📊",
  medal: "🏅",
  hand: "🤚",
  clock_red: "⏰",
  task: "🗂️",
};

export function NotificationBell() {
  const [items, setItems] = useState<RealNotifItem[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const fetchUnread = async () => {
    try {
      const data = await getNotifications(true, 20);
      setItems(data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const handleClickItem = async (n: RealNotifItem) => {
    if (!n.is_read) {
      try {
        await markNotificationRead(n.id);
        setItems((prev) => prev.filter((item) => item.id !== n.id));
      } catch {
        // ignore
      }
    }
    setOpen(false);
    if (n.link_url) {
      navigate(n.link_url);
    } else if (n.related_table === "events") {
      navigate(`/calendar?event_id=${n.related_id}`);
    } else if (n.related_table === "tasks") {
      navigate(`/tasks?task_id=${n.related_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems([]);
    } catch {
      // ignore
    }
  };

  return (
    <button type="button" className="bell" ref={ref} onClick={() => setOpen((v) => !v)} aria-label="Thông báo">
      <Icon name="bell" />
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

      <Dropdown isOpen={open} onClose={() => setOpen(false)} anchorRef={ref} className="notif-menu">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderBottom: "1px solid var(--line)", marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Thông báo</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAllRead();
              }}
              style={{ border: "none", background: "none", color: "var(--brand)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Đọc tất cả
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="notif-item">Không có thông báo mới</div>
        ) : (
          items.map((n) => {
            const iconSymbol = (n.icon_key && ICON_MAP[n.icon_key]) || "🔔";
            return (
              <div
                key={n.id}
                className="notif-item"
                onClick={() => handleClickItem(n)}
                style={{ fontWeight: n.is_read ? 400 : 600, display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer" }}
              >
                <span>{iconSymbol}</span>
                <div>
                  <div>{n.title}</div>
                  {n.body && <small style={{ color: "var(--muted)" }}>{n.body}</small>}
                </div>
              </div>
            );
          })
        )}
      </Dropdown>
    </button>
  );
}
