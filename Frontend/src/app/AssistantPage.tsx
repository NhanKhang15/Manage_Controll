import { AppShellPage } from "../layout/AppShellPage";
import { AssistantWrap } from "../features/assistant/AssistantWrap";
import { currentUser } from "../mocks/user";
import { attentionCategories, attentionItems } from "../mocks/attention";

/**
 * AssistantPage
 * Trang Trợ lý — dùng khung dùng chung `AppShellPage` (Sidebar/Topbar/Footer)
 * và nội dung riêng `AssistantWrap`.
 * Thẻ HTML gốc: toàn bộ <body> của trang "Trợ lý · Vela AI".
 */
export function AssistantPage() {
  return (
    <AppShellPage initialNavId="assistant">
      <AssistantWrap
        threadId="0"
        user={currentUser}
        pendingTasksCount={attentionItems.length}
        quote="💡 Kỷ luật là cầu nối giữa mục tiêu và thành quả."
        attentionCategories={attentionCategories}
        attentionItems={attentionItems}
      />
    </AppShellPage>
  );
}
