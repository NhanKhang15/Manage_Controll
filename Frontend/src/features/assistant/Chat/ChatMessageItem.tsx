import type { ChatMessage } from "../../../types/assistant";

/**
 * ChatMessageItem
 * 1 bong bóng tin nhắn (user hoặc assistant), kèm avatar để dễ nhận diện.
 * Không có markup gốc tương ứng (chat rỗng trong HTML tĩnh gốc) — thiết kế mới
 * theo phong cách design tokens.
 * CSS: .chat-row, .chat-bubble, .chat-avatar (mới, không có trong HTML gốc)
 */
export interface ChatMessageItemProps {
  message: ChatMessage;
  userAvatarUrl?: string | null;
}

export function ChatMessageItem({ message, userAvatarUrl }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const time = new Date(message.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`chat-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="chat-avatar chat-avatar-bot" aria-hidden="true">🤖</div>
      )}
      <div className={`chat-bubble ${isUser ? "user" : "assistant"}`}>
        {message.attachmentName && (
          <a
            className="chat-attachment"
            href={message.attachmentUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
          >
            📎 {message.attachmentName}
          </a>
        )}
        {message.content && <div className="chat-bubble-text">{message.content}</div>}
        <span className="chat-time">{time}</span>
      </div>
      {isUser && (
        userAvatarUrl ? (
          <img className="chat-avatar" src={userAvatarUrl} alt="" />
        ) : (
          <div className="chat-avatar chat-avatar-user" aria-hidden="true">🙂</div>
        )
      )}
    </div>
  );
}
