import type { ReactNode } from "react";
import { Topbar, type TopbarProps } from "./Topbar/Topbar";
import { MobileTabBar } from "./MobileTabBar";
import { PageContent } from "./PageContent";
import { Footer } from "../../components/ui/Footer";
import type { NavItemData } from "../../types/assistant";

/**
 * MainArea
 * Vùng nội dung chính bên phải sidebar. Footer nằm trong `.main` giống HTML
 * gốc (không phải sibling của `.shell` như bản đặc tả component-tree đơn
 * giản hoá ban đầu). Tổng quát hoá `children` để dùng chung cho mọi trang.
 * Thẻ HTML gốc: <div class=main>
 * CSS gốc tham chiếu: .main
 */
export interface MainAreaProps {
  topbar: TopbarProps;
  mobileNavItems: NavItemData[];
  activeNavId: string;
  onNavigate?: (id: string) => void;
  children: ReactNode;
}

export function MainArea({ topbar, mobileNavItems, activeNavId, onNavigate, children }: MainAreaProps) {
  return (
    <div className="main">
      <Topbar {...topbar} />
      <MobileTabBar items={mobileNavItems} activeId={activeNavId} onNavigate={onNavigate} />
      <PageContent>{children}</PageContent>
      <Footer />
    </div>
  );
}
