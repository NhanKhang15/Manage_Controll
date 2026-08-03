import { useCallback, useEffect, useState } from "react";
import { HeroBanner } from "./HeroBanner/HeroBanner";
import { ConversationBar } from "./ConversationBar";
import { ComposerRow } from "./Composer/ComposerRow";
import { FileChip } from "./Composer/FileChip";
import { ChatWindow } from "./Chat/ChatWindow";
import { AttentionPanel } from "./AttentionPanel/AttentionPanel";
import { Panel } from "../../components/ui/Panel";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../auth/AuthContext";
import {
  listConversations,
  createConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  type Conversation,
  type AssistantMessage,
} from "../../api/assistant";
import type { AttnCategory, AttentionItem, ChatMessage, UserProfile } from "../../types/assistant";

/**
 * AssistantWrap
 * Wrapper chính của tính năng Trợ lý: quản lý phiên hội thoại (nhiều phiên),
 * lịch sử tin nhắn và gửi/nhận tin nhắn thật qua backend (assistant app,
 * function-calling tools) — không còn phản hồi giả lập.
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

function toChatMessage(m: AssistantMessage): ChatMessage {
  return { id: m.id, role: m.role, content: m.content, createdAt: m.created_at };
}

function sortByUpdatedDesc(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function AssistantWrap({
  threadId,
  user,
  pendingTasksCount,
  quote,
  attentionCategories,
  attentionItems,
}: AssistantWrapProps) {
  const { employee } = useAuth();
  const { showToast } = useToast();
  const companyId = employee?.companies?.[0]?.id ?? null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatValue, setChatValue] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    listConversations(companyId)
      .then((convos) => {
        setConversations(convos);
        setActiveConversationId(convos[0]?.id ?? null);
      })
      .catch(() => showToast("Không tải được danh sách cuộc trò chuyện", "danger"));
  }, [companyId, showToast]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    getMessages(activeConversationId)
      .then((msgs) => setMessages(msgs.map(toChatMessage)))
      .catch(() => showToast("Không tải được lịch sử hội thoại", "danger"));
  }, [activeConversationId, showToast]);

  const handleNewConversation = useCallback(async () => {
    if (!companyId) return;
    try {
      const convo = await createConversation(companyId);
      setConversations((prev) => sortByUpdatedDesc([convo, ...prev]));
      setActiveConversationId(convo.id);
    } catch {
      showToast("Không tạo được cuộc trò chuyện mới", "danger");
    }
  }, [companyId, showToast]);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (id === activeConversationId) {
          setActiveConversationId((prev) => {
            const remaining = conversations.filter((c) => c.id !== prev);
            return remaining[0]?.id ?? null;
          });
        }
      } catch {
        showToast("Không xoá được cuộc trò chuyện", "danger");
      }
    },
    [activeConversationId, conversations, showToast]
  );

  async function handleSend() {
    const content = chatValue.trim();
    if (!content || !companyId || sending) return;

    setChatValue("");
    setAttachedFile(null);

    let convoId = activeConversationId;
    if (!convoId) {
      try {
        const convo = await createConversation(companyId);
        setConversations((prev) => sortByUpdatedDesc([convo, ...prev]));
        setActiveConversationId(convo.id);
        convoId = convo.id;
      } catch {
        showToast("Không tạo được cuộc trò chuyện mới", "danger");
        return;
      }
    }

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const res = await sendMessage(convoId, content);
      setMessages((prev) => [...prev, toChatMessage(res.message)]);
      setConversations((prev) => sortByUpdatedDesc(prev.map((c) => (c.id === res.conversation.id ? res.conversation : c))));
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `⚠️ ${detail}`, createdAt: new Date().toISOString() },
      ]);
      showToast(detail, "danger");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="assistant-wrap" id="assistant" data-thread={threadId}>
      <HeroBanner user={user} pendingTasksCount={pendingTasksCount} quote={quote} onChangeAvatar={() => {}} />

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

      {companyId ? (
        <>
          <ConversationBar
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            onCreate={handleNewConversation}
            onDelete={handleDeleteConversation}
          />
          <ChatWindow messages={messages} />
          {sending && <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>Trợ lý đang trả lời…</div>}

          <div className="composer-dock">
            {attachedFile && <FileChip fileName={attachedFile.name} onRemove={() => setAttachedFile(null)} />}
            <ComposerRow
              value={chatValue}
              onChange={setChatValue}
              onSend={handleSend}
              onAttachFile={(file) => setAttachedFile(file)}
              onSelectFeature={(opt) => showToast(`Mở tính năng: ${opt.label}`, "default")}
              onSearchClick={() => showToast("Tìm kiếm đang được phát triển", "default")}
              disabled={sending}
            />
          </div>
        </>
      ) : (
        <Panel style={{ marginTop: 20 }}>Bạn chưa thuộc công ty nào nên chưa thể dùng Trợ lý AI.</Panel>
      )}
    </div>
  );
}
