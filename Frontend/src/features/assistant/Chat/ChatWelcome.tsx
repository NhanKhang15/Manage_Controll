const SUGGESTIONS = [
  "Việc trễ hạn",
  "Việc hôm nay",
  "Họp sắp tới",
  "Tiến độ dự án",
  "Doanh thu tháng này?",
  "Khách hàng mới tháng này?",
  "Tuyển dụng đang mở?",
  "Ai chưa hoàn tất nhập việc?",
  "Đề xuất nào chờ duyệt?",
  "Giao việc cho … làm …",
];

/**
 * ChatWelcome
 * Trạng thái rỗng của khung chat: giới thiệu trợ lý AI + gợi ý câu hỏi nhanh
 * (bấm để gửi luôn). Thiết kế mới, không có markup gốc tương ứng.
 * CSS: .chat-welcome, .chat-suggestions, .chat-suggestion
 */
export interface ChatWelcomeProps {
  onSuggestion: (text: string) => void;
}

export function ChatWelcome({ onSuggestion }: ChatWelcomeProps) {
  return (
    <div className="chat-row assistant">
      <div className="chat-avatar chat-avatar-bot" aria-hidden="true">🤖</div>
      <div className="chat-bubble assistant chat-welcome">
        <div className="chat-welcome-text">
          Em là trợ lý AI — hỏi em <b>bất cứ điều gì về công ty</b> (số liệu, việc, người) hoặc nhờ
          soạn thảo/phân tích. Ví dụ:
        </div>
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="chat-suggestion"
              onClick={() => onSuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
