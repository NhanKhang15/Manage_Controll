import { NavBurgerButton } from "./NavBurgerButton";
import { TopbarRight, type TopbarRightProps } from "./TopbarRight";
import { VelaLogo } from "../../Sidebar/VelaLogo";

/**
 * Topbar
 * Thanh trên cùng: nút burger mobile + brand mobile + cụm tiện ích bên phải.
 * Thẻ HTML gốc: <div class=topbar>
 * CSS gốc tham chiếu: .topbar
 */
export interface TopbarProps extends TopbarRightProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick, ...topbarRightProps }: TopbarProps) {
  return (
    <div className="topbar">
      <NavBurgerButton onClick={onMenuClick} />
      <span className="topbar-brand">
        <VelaLogo />
      </span>
      <TopbarRight {...topbarRightProps} />
    </div>
  );
}
