import { ChatMessageItem } from "./ChatMessageItem";
import type { ChatMessage } from "../../../types/assistant";

/**
 * ChatWindow
 * Khung hiển thị danh sách tin nhắn hội thoại (render động, rỗng trong HTML gốc).
 * Thẻ HTML gốc: <div id=chat class=chat>
 * CSS gốc tham chiếu: .chat
 */
export interface ChatWindowProps {
  messages: ChatMessage[];
}

export function ChatWindow({ messages }: ChatWindowProps) {
  return (
    <div className="chat" id="chat">
      {messages.length === 0
        ? null
        : messages.map((message) => <ChatMessageItem key={message.id} message={message} />)}
    </div>
  );
}
