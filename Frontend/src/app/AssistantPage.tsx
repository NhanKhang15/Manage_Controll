import { AppShellPage } from "../layout/AppShellPage";
import { AssistantWrap } from "../features/assistant/AssistantWrap";
import { currentUser } from "../mocks/user";
import { attentionCategories, attentionItems } from "../mocks/attention";
import { useAuth } from "../auth/AuthContext";
import type { UserProfile } from "../types/assistant";

/**
 * AssistantPage
 * Trang Trợ lý — dùng khung dùng chung `AppShellPage` (Sidebar/Topbar/Footer)
 * và nội dung riêng `AssistantWrap`.
 * Thẻ HTML gốc: toàn bộ <body> của trang "Trợ lý · Vela AI".
 */
export function AssistantPage() {
  const { employee } = useAuth();

  const user: UserProfile = employee
    ? {
        employeeId: employee.id,
        name: employee.full_name,
        role: employee.position_title || "Nhân viên",
        avatarUrl: employee.avatar_url || "/avatar-placeholder.svg",
        email: employee.email,
        rating: currentUser.rating,
        level: currentUser.level,
        managedStaff: currentUser.managedStaff,
        achievementPoints: currentUser.achievementPoints,
      }
    : currentUser;

  return (
    <AppShellPage initialNavId="assistant">
      <AssistantWrap
        threadId="0"
        user={user}
        pendingTasksCount={attentionItems.length}
        quote="💡 Kỷ luật là cầu nối giữa mục tiêu và thành quả."
        attentionCategories={attentionCategories}
        attentionItems={attentionItems}
      />
    </AppShellPage>
  );
}
