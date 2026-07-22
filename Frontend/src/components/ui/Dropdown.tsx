import { useEffect, useRef, type ReactNode, type RefObject } from "react";

/**
 * Dropdown
 * Component dropdown menu dùng chung cho mọi menu popup (ngôn ngữ, thông báo,
 * role, rating, nav more, bg picker, feature menu). Tự đóng khi click ra ngoài
 * hoặc nhấn Escape. `className` truyền class CSS gốc tương ứng (vd "lang-menu").
 * CSS gốc tham chiếu: .lang-menu | .notif-menu | .role-menu | .rating-menu | .nav-more | .hero-bg-picker | .feat-menu
 */
export interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  anchorRef?: RefObject<HTMLElement | null>;
  className: string;
}

export function Dropdown({ isOpen, onClose, children, anchorRef, className }: DropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div className={className} ref={menuRef}>
      {children}
    </div>
  );
}
