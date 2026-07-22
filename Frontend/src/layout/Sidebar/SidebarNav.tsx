import { useState } from "react";
import { NavItem } from "./NavItem";
import { NavShowMoreToggle } from "./NavShowMoreToggle";
import { NavMoreDropdown } from "./NavMoreDropdown";
import type { NavItemData } from "../../types/assistant";

/**
 * SidebarNav
 * Danh sách menu điều hướng chính.
 * Thẻ HTML gốc: <nav class=nav>
 * CSS gốc tham chiếu: .nav
 */
export interface SidebarNavProps {
  items: NavItemData[];
  moreItems?: NavItemData[];
  activeId: string;
  onNavigate?: (id: string) => void;
}

export function SidebarNav({ items, moreItems = [], activeId, onNavigate }: SidebarNavProps) {
  const [moreExpanded, setMoreExpanded] = useState(false);

  return (
    <nav className="nav">
      {items.map((item) => (
        <NavItem key={item.id} item={item} active={item.id === activeId} onNavigate={onNavigate} />
      ))}
      <NavShowMoreToggle expanded={moreExpanded} onToggle={() => setMoreExpanded((v) => !v)} />
      {moreExpanded && <NavMoreDropdown items={moreItems} activeId={activeId} onNavigate={onNavigate} />}
    </nav>
  );
}
