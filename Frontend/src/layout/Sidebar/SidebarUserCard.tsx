import { useRef, useState } from "react";
import { RoleMenu } from "./RoleMenu";
import type { UserProfile } from "../../types/assistant";

/**
 * SidebarUserCard
 * Card user cuối sidebar: avatar + tên + chức vụ + dropdown role-menu.
 * Thẻ HTML gốc: <div class=user-card>
 * CSS gốc tham chiếu: .user-card
 */
export interface SidebarUserCardProps {
  user: UserProfile;
  collapsed?: boolean;
}

export function SidebarUserCard({ user, collapsed = false }: SidebarUserCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="user-card" ref={cardRef} onClick={() => setMenuOpen((v) => !v)}>
      <img className="avatar avatar-img" src={user.avatarUrl} alt="" />
      {!collapsed && (
        <>
          <span className="user-meta">
            <b>{user.name}</b>
            <small>{user.role}</small>
          </span>
          <span className="chev">▾</span>
        </>
      )}
      <RoleMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} anchorRef={cardRef} roleLabel={user.role} />
    </div>
  );
}
