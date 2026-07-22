import { Icon, type IconName } from "../../components/ui/Icon";
import type { NavItemData } from "../../types/assistant";

/**
 * MobileTabBar
 * Thanh tab điều hướng dạng ngang, chỉ hiện trên mobile (ẩn desktop, xem media
 * query @max-width:640px trong global.css). Rỗng trong HTML gốc (JS runtime cũ
 * tự inject) — mặc định lấy 5 mục đầu của `items` làm tab nhanh.
 * Thẻ HTML gốc: <nav class=mtab aria-label=Navigation>
 * CSS gốc tham chiếu: .mtab, .mtab-i
 */
export interface MobileTabBarProps {
  items: NavItemData[];
  activeId: string;
  onNavigate?: (id: string) => void;
  maxItems?: number;
}

export function MobileTabBar({ items, activeId, onNavigate, maxItems = 5 }: MobileTabBarProps) {
  const visible = items.slice(0, maxItems);

  return (
    <nav className="mtab" aria-label="Navigation">
      {visible.map((item) => (
        <a
          key={item.id}
          className={`mtab-i${item.id === activeId ? " active" : ""}`}
          href={item.href}
          onClick={
            onNavigate
              ? (event) => {
                  event.preventDefault();
                  onNavigate(item.id);
                }
              : undefined
          }
        >
          <Icon name={item.icon as IconName} size={18} />
          {item.label}
        </a>
      ))}
    </nav>
  );
}
