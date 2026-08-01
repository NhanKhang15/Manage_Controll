import { useState, useEffect, useRef } from "react";
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

const SCROLL_KEY = "sidebar_nav_scroll_top";

export function SidebarNav({ items, moreItems = [], activeId, onNavigate }: SidebarNavProps) {
  const isMoreActive = moreItems.some((item) => item.id === activeId);
  const [moreExpanded, setMoreExpanded] = useState(isMoreActive);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isMoreActive) {
      setMoreExpanded(true);
    }
  }, [isMoreActive, activeId]);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const savedScrollTop = sessionStorage.getItem(SCROLL_KEY);
    if (savedScrollTop !== null) {
      navEl.scrollTop = parseInt(savedScrollTop, 10);
    }

    const activeEl = navEl.querySelector(".nav-item.active");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeId, moreExpanded]);

  const handleScroll = () => {
    if (navRef.current) {
      sessionStorage.setItem(SCROLL_KEY, String(navRef.current.scrollTop));
    }
  };

  return (
    <nav className="nav" ref={navRef} onScroll={handleScroll}>
      {items.map((item) => (
        <NavItem key={item.id} item={item} active={item.id === activeId} onNavigate={onNavigate} />
      ))}
      <NavShowMoreToggle expanded={moreExpanded} onToggle={() => setMoreExpanded((v) => !v)} />
      {moreExpanded && <NavMoreDropdown items={moreItems} activeId={activeId} onNavigate={onNavigate} />}
    </nav>
  );
}

