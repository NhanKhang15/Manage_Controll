import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shell } from "./Shell";
import { Overlay } from "../components/ui/Overlay";
import { mainNavItems, moreNavItems } from "../mocks/navigation";
import { currentUser } from "../mocks/user";
import { useAuth } from "../auth/AuthContext";
import type { UserProfile } from "../types/assistant";

/**
 * AppShellPage
 * Khung dùng chung cho mọi trang có Sidebar/Topbar (Trợ lý, Lịch, Dashboard,
 * Tasks, Projects...): quản lý state điều hướng toàn cục (sidebar
 * collapse/mobile-open, nav đang chọn, ngôn ngữ) và ráp Shell + Overlay.
 *
 * Sử dụng react-router-dom `useNavigate` để thay đổi URL thật khi bấm nav.
 */
export interface AppShellPageProps {
  initialNavId: string;
  children: ReactNode;
}

export function AppShellPage({ initialNavId, children }: AppShellPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { employee } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState("VI");

  const user: UserProfile = employee
    ? {
        employeeId: employee.id,
        name: employee.full_name,
        role: employee.position_title || "Nhân viên",
        avatarUrl: employee.avatar_url || "/avatar-placeholder.svg",
        email: employee.email,
        rating: employee.rating,
        level: employee.level,
        managedStaff: employee.direct_reports_count,
        achievementPoints: employee.points,
      }
    : currentUser;

  // Xác định nav đang active dựa trên URL thật
  const activeNavId = location.pathname.replace("/", "") || initialNavId;

  function handleNavigate(id: string) {
    setMobileOpen(false);
    navigate(`/${id}`);
  }

  return (
    <>
      <Shell
        sidebar={{
          collapsed,
          onToggleCollapse: () => setCollapsed((v) => !v),
          user,
          navItems: mainNavItems,
          moreNavItems,
          activeNavId,
          onNavigate: handleNavigate,
          mobileOpen,
        }}
        mainArea={{
          topbar: {
            onMenuClick: () => setMobileOpen((v) => !v),
            currentLang: lang,
            onChangeLang: setLang,
            user,
          },
          mobileNavItems: mainNavItems,
          activeNavId,
          onNavigate: handleNavigate,
          children,
        }}
      />
      <Overlay visible={mobileOpen} onClick={() => setMobileOpen(false)} />
    </>
  );
}

