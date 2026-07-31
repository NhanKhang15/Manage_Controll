import type { RefObject } from "react";
import { Dropdown } from "../../components/ui/Dropdown";
import { useAuth } from "../../auth/AuthContext";
import { clearTokens } from "../../auth/tokenStorage";

export interface RoleMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  roleLabel?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export function RoleMenu({ isOpen, onClose, anchorRef, userEmail, onLogout }: RoleMenuProps) {
  const { employee } = useAuth();
  const displayEmail = userEmail || employee?.email || "";

  const handleLogoutClick = () => {
    onClose();
    if (onLogout) {
      onLogout();
    } else {
      clearTokens();
      window.location.href = "/login";
    }
  };

  return (
    <Dropdown isOpen={isOpen} onClose={onClose} anchorRef={anchorRef} className="role-menu">
      {displayEmail && (
        <div style={{ padding: "6px 10px 8px", fontSize: 13, color: "var(--muted, #64748b)", wordBreak: "break-all" }}>
          {displayEmail}
        </div>
      )}

      <div
        className="role-opt"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
          cursor: "pointer",
          fontSize: 13.5,
          borderRadius: 8,
          color: "var(--text, #1e293b)",
        }}
        onClick={() => {
          onClose();
        }}
      >
        <span style={{ fontSize: 16 }}>⚙️</span>
        <span>Thiết lập tài khoản</span>
      </div>

      <div style={{ height: 1, background: "var(--line, #e2e8f0)", margin: "6px 0" }} />

      <div
        className="role-opt"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
          cursor: "pointer",
          fontSize: 13.5,
          color: "#ef4444",
          fontWeight: 600,
          borderRadius: 8,
        }}
        onClick={handleLogoutClick}
      >
        <span style={{ fontSize: 16, color: "#ef4444" }}>↩️</span>
        <span>Đăng xuất</span>
      </div>
    </Dropdown>
  );
}

