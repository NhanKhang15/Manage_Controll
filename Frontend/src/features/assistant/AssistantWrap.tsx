import { useState } from "react";
import { HeroBanner } from "./HeroBanner/HeroBanner";
import { AiModelBar } from "./AiModelBar";
import { ComposerRow } from "./Composer/ComposerRow";
import { FileChip } from "./Composer/FileChip";
import { ChatWindow } from "./Chat/ChatWindow";
import { AttentionPanel } from "./AttentionPanel/AttentionPanel";
import { useToast } from "../../components/ui/Toast";
import type { AiModelId, AttnCategory, AttentionItem, ChatMessage, UserProfile } from "../../types/assistant";

/**
 * AssistantWrap
 * Wrapper chính của tính năng Trợ lý: quản lý state chat/composer/model/đính
 * kèm — có data-thread (id cuộc hội thoại hiện tại).
 * Thẻ HTML gốc: <div id=assistant class=assistant-wrap data-thread=0>
 * CSS gốc tham chiếu: .assistant-wrap
 */
export interface AssistantWrapProps {
  threadId: string;
  user: UserProfile;
  pendingTasksCount: number;
  quote: string;
  attentionCategories: AttnCategory[];
  attentionItems: AttentionItem[];
}

export function AssistantWrap({
  threadId,
  user,
  pendingTasksCount,
  quote,
  attentionCategories,
  attentionItems,
}: AssistantWrapProps) {
  const [aiModel, setAiModel] = useState<AiModelId>("auto");
  const [chatValue, setChatValue] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { showToast } = useToast();

  function handleSend() {
    if (!chatValue.trim()) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: chatValue.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatValue("");
    setAttachedFile(null);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Em đã nhận được yêu cầu, để em xử lý và phản hồi anh/chị sớm nhất ạ.",
          model: aiModel,
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 600);
  }

  return (
    <div className="assistant-wrap" id="assistant" data-thread={threadId}>
      <HeroBanner
        user={user}
        pendingTasksCount={pendingTasksCount}
        quote={quote}
        onChangeAvatar={() => {}}
      />
      <AiModelBar value={aiModel} onChange={setAiModel} />
      <ComposerRow
        value={chatValue}
        onChange={setChatValue}
        onSend={handleSend}
        onAttachFile={(file) => setAttachedFile(file)}
        onSelectFeature={(opt) => showToast(`Mở tính năng: ${opt.label}`, "default")}
        onSearchClick={() => showToast("Tìm kiếm đang được phát triển", "default")}
      />
      {attachedFile && <FileChip fileName={attachedFile.name} onRemove={() => setAttachedFile(null)} />}
      <ChatWindow messages={messages} />
      <AttentionPanel
        totalCount={pendingTasksCount}
        categories={attentionCategories}
        items={attentionItems}
        onAction={(item, action) =>
          showToast(
            action === "primary" ? `Đã xử lý: ${item.title}` : `Đã bỏ qua: ${item.title}`,
            action === "primary" ? "success" : "default"
          )
        }
      />
    </div>
  );
}
