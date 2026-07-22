import { NavItem } from "./NavItem";
import type { NavItemData } from "../../types/assistant";

/**
 * NavMoreDropdown
 * Danh sách nav item phụ hiện khi bấm "Xem thêm". Rỗng trong HTML gốc (JS runtime
 * cũ tự inject) — xem src/mocks/navigation.ts (`moreNavItems`).
 * Thẻ HTML gốc: <div class="nav-more sf-hidden" id=navMore>
 * CSS gốc tham chiếu: .nav-more
 */
export interface NavMoreDropdownProps {
  items: NavItemData[];
  activeId: string;
  onNavigate?: (id: string) => void;
}

export function NavMoreDropdown({ items, activeId, onNavigate }: NavMoreDropdownProps) {
  if (items.length === 0) return null;
  return (
    <div className="nav-more" id="navMore">
      {items.map((item) => (
        <NavItem key={item.id} item={item} active={item.id === activeId} onNavigate={onNavigate} />
      ))}
    </div>
  );
}
