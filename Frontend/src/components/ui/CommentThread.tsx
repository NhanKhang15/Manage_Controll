import { useState } from "react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";

export interface CommentMessage {
  id: string;
  author: string;
  text: string;
  time: string;
}

/**
 * CommentThread
 * Luồng trao đổi (nội bộ hoặc với khách) + form gửi bình luận mới. Dùng ở
 * panel chi tiết Thư mục (2 lần: nội bộ + khách) và tái dùng được cho
 * TaskDetailDrawer sau này.
 * CSS gốc tham chiếu: .proj-thread, .cl-cmt-form (+ .proj-cmt-row mới)
 */
export interface CommentThreadProps {
  messages: CommentMessage[];
  emptyText: string;
  placeholder: string;
  onSend: (text: string) => void;
}

export function CommentThread({ messages, emptyText, placeholder, onSend }: CommentThreadProps) {
  const [draft, setDraft] = useState("");

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  return (
    <>
      <div className="proj-thread">
        {messages.length === 0 ? (
          <div className="muted proj-cmt-empty">{emptyText}</div>
        ) : (
          messages.map((m) => (
            <div className="proj-cmt-row" key={m.id}>
              <Avatar name={m.author} size={20} />
              <div className="proj-cmt-body">
                <div className="proj-cmt-head">
                  <b>{m.author}</b> <span className="muted">{m.time}</span>
                </div>
                <div className="proj-cmt-text">{m.text}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cl-cmt-form">
        <textarea rows={2} placeholder={placeholder} value={draft} onChange={(e) => setDraft(e.target.value)} />
        <Button variant="primary" size="sm" onClick={handleSend}>
          Gửi
        </Button>
      </div>
    </>
  );
}
