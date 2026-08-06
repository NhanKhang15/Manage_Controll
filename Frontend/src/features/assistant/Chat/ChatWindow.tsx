import { useEffect, useRef } from "react";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatWelcome } from "./ChatWelcome";
import type { ChatMessage } from "../../../types/assistant";

/**
 * ChatWindow
 * Khung hiển thị danh sách tin nhắn hội thoại (render động, rỗng trong HTML gốc).
 * Tự cuộn xuống cuối mỗi khi có tin nhắn mới hoặc trợ lý đang trả lời, kể cả
 * khi nội dung tin nhắn dài.
 * Thẻ HTML gốc: <div id=chat class=chat>
 * CSS gốc tham chiếu: .chat
 */
export interface ChatWindowProps {
  messages: ChatMessage[];
  sending?: boolean;
  userAvatarUrl?: string | null;
  onSuggestion?: (text: string) => void;
}

export function ChatWindow({ messages, sending, userAvatarUrl, onSuggestion }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  return (
    <div className="chat" id="chat">
      {messages.length === 0 ? (
        <ChatWelcome onSuggestion={(text) => onSuggestion?.(text)} />
      ) : (
        messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} userAvatarUrl={userAvatarUrl} />
        ))
      )}
      {sending && (
        <div className="chat-row assistant">
          <div className="chat-avatar chat-avatar-bot" aria-hidden="true">🤖</div>
          <div className="chat-bubble assistant chat-typing" aria-label="Trợ lý đang trả lời…">
            <span className="chat-typing-dot" />
            <span className="chat-typing-dot" />
            <span className="chat-typing-dot" />
          </div>
        </div>
      )}
      <div ref={bottomRef} className="chat-bottom-anchor" />
    </div>
  );
}
