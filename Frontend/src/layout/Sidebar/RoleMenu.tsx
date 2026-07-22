import type { RefObject } from "react";
import { Dropdown } from "../../components/ui/Dropdown";

/**
 * RoleMenu
 * Menu chuyển vai trò/đăng xuất khi click vào user-card. Rỗng trong HTML gốc
 * (JS runtime cũ tự inject) — nội dung dưới đây là mock hợp lý theo ngữ cảnh app.
 * Thẻ HTML gốc: <div id=roleMenu class="role-menu sf-hidden">
 * CSS gốc tham chiếu: .role-menu, .role-opt:hover
 */
export interface RoleMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  roleLabel: string;
  onLogout?: () => void;
}

export function RoleMenu({ isOpen, onClose, anchorRef, roleLabel, onLogout }: RoleMenuProps) {
  return (
    <Dropdown isOpen={isOpen} onClose={onClose} anchorRef={anchorRef} className="role-menu">
      <div className="role-opt">👤 Hồ sơ cá nhân</div>
      <div className="role-opt">🔁 Đang dùng: {roleLabel}</div>
      <div
        className="role-opt"
        onClick={() => {
          onLogout?.();
          onClose();
        }}
      >
        🚪 Đăng xuất
      </div>
    </Dropdown>
  );
}
