import { VelaLogo } from "./VelaLogo";
import { SidebarCollapseButton } from "./SidebarCollapseButton";

/**
 * SidebarBrand
 * Logo "Vela AI" (SVG gradient) + nút thu gọn sidebar.
 * Thẻ HTML gốc: <div class=brand>
 * CSS gốc tham chiếu: .brand
 */
export interface SidebarBrandProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarBrand({ collapsed, onToggleCollapse }: SidebarBrandProps) {
  return (
    <div className="brand">
      <VelaLogo iconOnly={collapsed} />
      <SidebarCollapseButton collapsed={collapsed} onClick={onToggleCollapse} />
    </div>
  );
}
