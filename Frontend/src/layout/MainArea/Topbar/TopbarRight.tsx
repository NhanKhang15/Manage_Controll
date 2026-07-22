import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationBell } from "./NotificationBell";
import { GamificationBadge } from "./GamificationBadge";
import type { UserProfile } from "../../../types/assistant";
import type { NotificationItem } from "../../../mocks/notifications";

/**
 * TopbarRight
 * Cụm: ngôn ngữ, chuông thông báo, badge gamification.
 * Thẻ HTML gốc: <div class=topbar-right>
 * CSS gốc tham chiếu: .topbar-right
 */
export interface TopbarRightProps {
  currentLang: string;
  onChangeLang: (lang: string) => void;
  notifications: NotificationItem[];
  user: UserProfile;
  online?: boolean;
}

export function TopbarRight({ currentLang, onChangeLang, notifications, user, online = true }: TopbarRightProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="topbar-right">
      <LanguageSwitcher currentLang={currentLang} onChange={onChangeLang} />
      <NotificationBell unreadCount={unreadCount} items={notifications} />
      <GamificationBadge
        rating={user.rating}
        level={user.level}
        online={online}
        achievementPoints={user.achievementPoints}
      />
    </div>
  );
}
