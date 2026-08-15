import { Icon, type IconName } from "../../components/ui/Icon";
import type { NavItemData } from "../../types/assistant";

/**
 * NavItem
 * 1 mục menu (Trợ lý, Bảng điều hành, Công việc, Dự án, Lịch, Sự kiện, Tài liệu,
 * Mục tiêu, Chấm giờ, Mẫu việc, Xếp hạng, Bảng vàng, Bảng lương, Thiết lập...)
 * gồm icon + nav-label.
 * Thẻ HTML gốc: <a class="nav-item (active)">
 * CSS gốc tham chiếu: .nav-item (+ .active)
 */
export interface NavItemProps {
  item: NavItemData;
  active: boolean;
  onNavigate?: (id: string) => void;
}

export function NavItem({ item, active, onNavigate }: NavItemProps) {
  return (
    <a
      className={`nav-item${active ? " active" : ""}`}
      href={item.href}
      title={item.label}
      onClick={
        onNavigate
          ? (event) => {
              event.preventDefault();
              onNavigate(item.id);
            }
          : undefined
      }
    >
      <Icon name={item.icon as IconName} />
      <span className="nav-label">{item.label}</span>
    </a>
  );
}
