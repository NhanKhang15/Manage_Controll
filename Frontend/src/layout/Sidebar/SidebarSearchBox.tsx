import { Icon } from "../../components/ui/Icon";

/**
 * SidebarSearchBox
 * Ô "Tìm nhanh…" mở command palette, có kbd shortcut ⌘K.
 * Thẻ HTML gốc: <button class=search-box>
 * CSS gốc tham chiếu: .search-box
 */
export interface SidebarSearchBoxProps {
  onClick: () => void;
}

export function SidebarSearchBox({ onClick }: SidebarSearchBoxProps) {
  return (
    <button type="button" className="search-box" onClick={onClick}>
      <Icon name="search" size={16} />
      <span className="search-ph">Tìm nhanh…</span>
      <kbd>⌘K</kbd>
    </button>
  );
}
