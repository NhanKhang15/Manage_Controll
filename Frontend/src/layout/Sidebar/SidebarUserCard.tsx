import { useRef, useState } from "react";
import { RoleMenu } from "./RoleMenu";
import type { UserProfile } from "../../types/assistant";
import { useAuth } from "../../auth/AuthContext";
import { clearTokens } from "../../auth/tokenStorage";

export interface SidebarUserCardProps {
  user: UserProfile;
  collapsed?: boolean;
}

export function SidebarUserCard({ user, collapsed = false }: SidebarUserCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { employee } = useAuth();

  const name = employee?.full_name || user.name;
  const role = employee?.companies?.[0]?.role_in_company || employee?.position_title || user.role || "Nhân viên";
  const email = employee?.email || user.email || "";
  const avatarUrl = employee?.avatar_url || user.avatarUrl;

  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "U";

  const hasCustomAvatar = avatarUrl && !avatarUrl.includes("placeholder");

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/login";
  };

  return (
    <div className="user-card" ref={cardRef} onClick={() => setMenuOpen((v) => !v)}>
      {hasCustomAvatar ? (
        <img className="avatar avatar-img" src={avatarUrl} alt={name} />
      ) : (
        <div
          className="avatar"
          style={{
            background: "#E0F2FE",
            color: "#0284C7",
            borderRadius: 11,
            fontWeight: 700,
            fontSize: 13,
            width: 38,
            height: 38,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      )}
      {!collapsed && (
        <>
          <span className="user-meta" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <b style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", display: "block" }}>
              {name}
            </b>
            <small style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", display: "block" }}>
              {role}
            </small>
          </span>
          <span
            className="chev"
            style={{
              background: "#2563eb",
              color: "#ffffff",
              borderRadius: 4,
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              flexShrink: 0,
              marginLeft: "auto",
            }}
          >
            ▼
          </span>
        </>
      )}
      <RoleMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorRef={cardRef}
        roleLabel={role}
        userEmail={email}
        onLogout={handleLogout}
      />
    </div>
  );
}

