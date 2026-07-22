/**
 * SidebarCollapseButton
 * Nút "«" thu gọn sidebar.
 * Thẻ HTML gốc: <button class=brand-collapse title="Thu gọn">«</button>
 * CSS gốc tham chiếu: .brand-collapse
 */
export interface SidebarCollapseButtonProps {
  collapsed: boolean;
  onClick: () => void;
}

export function SidebarCollapseButton({ collapsed, onClick }: SidebarCollapseButtonProps) {
  return (
    <button type="button" className="brand-collapse" title={collapsed ? "Mở rộng" : "Thu gọn"} onClick={onClick}>
      {collapsed ? "»" : "«"}
    </button>
  );
}
