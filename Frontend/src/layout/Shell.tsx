import { Sidebar, type SidebarProps } from "./Sidebar/Sidebar";
import { MainArea, type MainAreaProps } from "./MainArea/MainArea";

/**
 * Shell
 * Grid layout tổng: sidebar 264px | main 1fr.
 * Thẻ HTML gốc: <div class=shell>
 * CSS gốc tham chiếu: .shell
 */
export interface ShellProps {
  sidebar: SidebarProps;
  mainArea: MainAreaProps;
}

export function Shell({ sidebar, mainArea }: ShellProps) {
  return (
    <div className="shell">
      <Sidebar {...sidebar} />
      <MainArea {...mainArea} />
    </div>
  );
}
