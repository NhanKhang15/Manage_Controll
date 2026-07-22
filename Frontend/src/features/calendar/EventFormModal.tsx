import { useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import type { CalendarEventKind } from "../../types/calendar";

export interface EventFormValues {
  title: string;
  date: string;
  time: string;
  kind: CalendarEventKind;
}

/**
 * EventFormModal
 * Form "Thêm lịch" — tiêu đề, ngày, giờ, loại (công việc/cá nhân). Nội dung
 * modal rỗng trong HTML gốc (JS runtime cũ tự inject) — thiết kế mới theo
 * gợi ý class `.kind-opt` đã thấy trong CSS gốc.
 * Thẻ HTML gốc: <div id=eventModal class="modal-back sf-hidden">
 */
export interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: EventFormValues) => void;
  defaultDate: string;
}

export function EventFormModal({ isOpen, onClose, onSubmit, defaultDate }: EventFormModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("09:00");
  const [kind, setKind] = useState<CalendarEventKind>("work");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), date, time, kind });
    setTitle("");
    setKind("work");
  }

  return (
    <Modal isOpen={isOpen} title="Thêm lịch" onClose={onClose}>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Tiêu đề
          <input
            type="text"
            required
            autoFocus
            placeholder="Họp giao ban, demo khách hàng…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Ngày
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Giờ
          <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <label className="kind-opt">
            <input type="radio" name="kind" checked={kind === "work"} onChange={() => setKind("work")} />
            <span>💼 Công việc</span>
          </label>
          <label className="kind-opt">
            <input type="radio" name="kind" checked={kind === "personal"} onChange={() => setKind("personal")} />
            <span>🏠 Cá nhân</span>
          </label>
        </div>
        <Button variant="primary" block type="submit">
          Lưu lịch
        </Button>
      </form>
    </Modal>
  );
}
