import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shell } from "./Shell";
import { Overlay } from "../components/ui/Overlay";
import { mainNavItems, moreNavItems } from "../mocks/navigation";
import { currentUser } from "../mocks/user";
import { notifications } from "../mocks/notifications";

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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState("VI");

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
          user: currentUser,
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
            notifications,
            user: currentUser,
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
