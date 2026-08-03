import type { ChatMessage } from "../../../types/assistant";

/**
 * ChatMessageItem
 * 1 bong bóng tin nhắn (user hoặc assistant). Không có markup gốc tương ứng
 * (chat rỗng trong HTML tĩnh gốc) — thiết kế mới theo phong cách design tokens.
 * CSS: .chat-row, .chat-bubble (mới, không có trong HTML gốc)
 */
export interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const time = new Date(message.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`chat-row ${isUser ? "user" : "assistant"}`}>
      <div className={`chat-bubble ${isUser ? "user" : "assistant"}`}>
        <div>{message.content}</div>
        <span className="chat-time">{time}</span>
      </div>
    </div>
  );
}
