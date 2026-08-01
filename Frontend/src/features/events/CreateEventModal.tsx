import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import type { EventItem } from "../../types/events";

const GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#0ea5e9,#22c7e8,#10b981)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
];

/**
 * CreateEventModal
 * Form tạo sự kiện mới (tên, ngày giờ, địa điểm, công khai/nội bộ).
 */
export interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: EventItem) => void;
}

export function CreateEventModal({ isOpen, onClose, onCreate }: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState<EventItem["visibility"]>("public");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!title.trim()) {
      setError("Vui lòng nhập tên sự kiện (bắt buộc).");
      return;
    }
    setError(null);
    onCreate({
      id: `ev-${Date.now()}`,
      title: title.trim(),
      datetime: `${time || "00:00"} · ${date || "—"}`,
      location: location.trim() || "Chưa xác định",
      attendees: 0,
      visibility,
      gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
    });
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setVisibility("public");
    onClose();
  }

  return (
    <Modal isOpen={isOpen} title="✨ Tạo sự kiện" onClose={onClose}>
      <form className="settings-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <label>
          Tên sự kiện <span className="text-red-500" title="Bắt buộc">*</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setError(null);
            }}
            placeholder="VD: Ra mắt sản phẩm mới"
            style={{ borderColor: error && !title.trim() ? "var(--red, #ef4444)" : undefined }}
          />
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ flex: 1, minWidth: 120 }}>
            Ngày
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label style={{ flex: 1, minWidth: 100 }}>
            Giờ
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>
        <label>
          Địa điểm
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Khách sạn Rex" />
        </label>
        <label>
          Phạm vi
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as EventItem["visibility"])}>
            <option value="public">🌐 Công khai</option>
            <option value="private">🔒 Nội bộ</option>
          </select>
        </label>

        {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

        <Button variant="primary" type="submit">
          ✨ Tạo sự kiện
        </Button>
      </form>
    </Modal>
  );
}
