import { useRef, useState } from "react";
import { Dropdown } from "../../components/ui/Dropdown";
import type { Conversation } from "../../api/assistant";

/**
 * ConversationBar
 * Thanh chuyển đổi/tạo mới phiên hội thoại với Trợ lý (nhiều phiên như ChatGPT).
 * Không có trong HTML gốc — thiết kế mới theo phong cách design tokens.
 * CSS: .conversation-bar, .conversation-menu (mới)
 */
export interface ConversationBarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

function formatUpdatedAt(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function ConversationBar({ conversations, activeId, onSelect, onCreate, onDelete }: ConversationBarProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="conversation-bar">
      <button type="button" ref={anchorRef} className="conversation-bar-current" onClick={() => setOpen((v) => !v)}>
        <span>{active?.title || "Cuộc trò chuyện mới"}</span>
        <span aria-hidden="true">▾</span>
      </button>
      <button type="button" className="conversation-bar-new" onClick={onCreate}>
        + Mới
      </button>

      <Dropdown isOpen={open} onClose={() => setOpen(false)} anchorRef={anchorRef} className="conversation-menu">
        {conversations.length === 0 ? (
          <div className="conversation-menu-empty muted">Chưa có cuộc trò chuyện nào</div>
        ) : (
          conversations.map((c) => (
            <div key={c.id} className={`conversation-menu-item${c.id === activeId ? " active" : ""}`}>
              <button
                type="button"
                className="conversation-menu-title-btn"
                onClick={() => {
                  onSelect(c.id);
                  setOpen(false);
                }}
              >
                <span className="conversation-menu-title">{c.title}</span>
                <span className="conversation-menu-time muted">{formatUpdatedAt(c.updated_at)}</span>
              </button>
              <button
                type="button"
                className="conversation-menu-delete"
                title="Xoá cuộc trò chuyện"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </Dropdown>
    </div>
  );
}
