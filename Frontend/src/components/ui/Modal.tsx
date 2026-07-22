import type { ReactNode } from "react";

/**
 * Modal
 * Hộp thoại popup modal (dùng cho "Thêm lịch", xem chi tiết sự kiện...).
 * Thẻ HTML gốc: <div class="modal-back" id=eventModal> > <div class=modal>
 * CSS gốc tham chiếu: .modal-back, .modal
 */
export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <b>{title}</b>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
