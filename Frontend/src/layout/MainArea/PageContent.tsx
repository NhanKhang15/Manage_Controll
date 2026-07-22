import type { ReactNode } from "react";

/**
 * PageContent
 * Container nội dung trang (`.page`) — tổng quát hoá để mọi trang (Trợ lý,
 * Lịch, Dashboard, Tasks, Projects...) đều dùng chung được Shell/MainArea,
 * chỉ khác nội dung con.
 * Thẻ HTML gốc: <main class=page>
 * CSS gốc tham chiếu: .page
 */
export interface PageContentProps {
  children: ReactNode;
}

export function PageContent({ children }: PageContentProps) {
  return <main className="page">{children}</main>;
}
