import { SidebarBrand } from "./SidebarBrand";
import { SidebarSearchBox } from "./SidebarSearchBox";
import { SidebarNav } from "./SidebarNav";
import { SidebarUserCard } from "./SidebarUserCard";
import type { NavItemData, UserProfile } from "../../types/assistant";

/**
 * Sidebar
 * Thanh điều hướng trái, sticky full height.
 * Thẻ HTML gốc: <aside class=sidebar id=sidebar>
 * CSS gốc tham chiếu: .sidebar
 */
export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  user: UserProfile;
  navItems: NavItemData[];
  moreNavItems?: NavItemData[];
  activeNavId: string;
  onNavigate?: (id: string) => void;
  onSearchClick?: () => void;
  mobileOpen?: boolean;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  user,
  navItems,
  moreNavItems = [],
  activeNavId,
  onNavigate,
  onSearchClick,
  mobileOpen = false,
}: SidebarProps) {
  return (
    <aside
      className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " open" : ""}`}
      id="sidebar"
      style={{ zIndex: 50 }}
    >
      <SidebarBrand collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      <SidebarSearchBox onClick={() => onSearchClick?.()} />
      <SidebarNav items={navItems} moreItems={moreNavItems} activeId={activeNavId} onNavigate={onNavigate} />
      <SidebarUserCard user={user} collapsed={collapsed} />
    </aside>
  );
}
