import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { deleteEvent } from "../../api/events";
import { useToast } from "../../components/ui/Toast";
import { eventTimeRange } from "./eventDisplay";
import type { CalendarEventItem } from "../../types/calendar";

export interface EventDetailModalProps {
  event: CalendarEventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEventItem) => void;
  onDeleted: () => void;
}

export function EventDetailModal({ event, isOpen, onClose, onEdit, onDeleted }: EventDetailModalProps) {
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !event) return null;

  async function handleDelete() {
    if (!event) return;
    if (!window.confirm(`Xóa lịch "${event.title}"? Hành động này không thể hoàn tác.`)) return;

    setDeleting(true);
    try {
      await deleteEvent(event.id);
      showToast("Đã xóa lịch", "success");
      onDeleted();
    } catch (err: any) {
      showToast(err.message || "Không thể xóa lịch", "danger");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} title={event.title} onClose={onClose}>
      <div className="ev-detail">
        <div className="ev-detail-row">
          <Icon name="clock" size={16} />
          <span>{eventTimeRange(event)}</span>
        </div>
        <div className="ev-detail-row">
          <Icon name="map-pin" size={16} />
          <span>{event.location || "Không có địa điểm"}</span>
        </div>
        {event.type === "meeting" && (
          <div className="ev-detail-row">
            <Icon name="user" size={16} />
            <span>{event.creatorName || "—"}</span>
          </div>
        )}

        {event.content && <div className="ev-detail-content">{event.content}</div>}

        <div className="ev-detail-actions">
          <Button variant="ghost" onClick={() => onEdit(event)}>
            <Icon name="edit" size={16} /> Sửa
          </Button>
          <Button variant="reject" disabled={deleting} onClick={handleDelete}>
            <Icon name="trash" size={16} /> {deleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
