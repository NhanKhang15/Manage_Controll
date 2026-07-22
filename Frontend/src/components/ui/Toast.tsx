import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ToastVariant = "default" | "success" | "warn" | "danger";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast phải được dùng bên trong ToastProvider");
  return ctx;
}

/**
 * ToastProvider
 * Context + container hiển thị thông báo toast, expose hook useToast().
 * HTML gốc không có <script> nên phần logic này được thiết kế mới; hiển thị
 * dùng đúng class .toast-wrap gốc để giữ style nhất quán.
 * Thẻ HTML gốc: <div id=toastWrap class=toast-wrap>
 * CSS gốc tham chiếu: .toast-wrap
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "default") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-wrap" id="toastWrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.variant !== "default" ? t.variant : ""}`.trim()}>
            <span>{t.message}</span>
            <button className="t-x" onClick={() => removeToast(t.id)} aria-label="Đóng">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
