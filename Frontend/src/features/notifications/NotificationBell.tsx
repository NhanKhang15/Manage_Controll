import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markNotificationRead, markAllNotificationsRead, type NotificationItem } from "../../api/notifications";

const ICON_MAP: Record<string, string> = {
  calendar: "📅",
  check_green: "✅",
  chart: "📊",
  medal: "🏅",
  hand: "🤚",
  clock_red: "⏰",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUnreadNotifications = async () => {
    try {
      const data = await getNotifications(true);
      setNotifications(data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 60000); // 60s polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      try {
        await markNotificationRead(notif.id);
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      } catch {
        // ignore
      }
    }
    setOpen(false);
    if (notif.link_url) {
      navigate(notif.link_url);
    } else if (notif.related_table === "events") {
      navigate(`/calendar?event_id=${notif.related_id}`);
    } else if (notif.related_table === "tasks") {
      navigate(`/tasks?task_id=${notif.related_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications([]);
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        type="button"
        className="bell"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Thông báo"
      >
        <span style={{ fontSize: 20 }}>🔔</span>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-menu" style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 340, maxHeight: "70vh", overflowY: "auto", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, boxShadow: "var(--shadow)", padding: 8, zIndex: 60 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderBottom: "1px solid var(--line)", marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>Thông báo</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{ border: "none", background: "none", color: "var(--brand)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: "16px 8px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Không có thông báo mới
            </div>
          ) : (
            notifications.map((n) => {
              const icon = (n.icon_key && ICON_MAP[n.icon_key]) || "🔔";
              return (
                <div
                  key={n.id}
                  className="notif-item"
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    background: n.is_read ? "transparent" : "var(--brand-soft)",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: "var(--text)" }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{n.body}</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
