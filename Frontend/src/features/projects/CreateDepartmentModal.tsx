import { useState, useEffect, useRef, type FormEvent } from "react";
import { createDepartment, type TreeNode } from "../../api/companies";
import { Button } from "../../components/ui/Button";

// Tham chiếu ổn định — tránh mảng mặc định mới mỗi lần render khi prop không
// được truyền (nằm trong dependency của useEffect bên dưới).
const EMPTY_COMPANIES: { id: string; name: string }[] = [];

export interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDepartment: TreeNode) => void;
  companyId?: string;
  companyName?: string;
  availableCompanies?: { id: string; name: string }[];
}

export function CreateDepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  companyId = "",
  companyName = "",
  availableCompanies = EMPTY_COMPANIES,
}: CreateDepartmentModalProps) {
  const [name, setName] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId);
  const [orderIndex, setOrderIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setSelectedCompanyId(companyId || (availableCompanies[0]?.id ?? ""));
      setOrderIndex(0);
      setError(null);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen, companyId, availableCompanies]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const currentCompanyName =
    companyName || availableCompanies.find((c) => c.id === selectedCompanyId)?.name || "Công ty";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || loading) return;

    const targetCompanyId = selectedCompanyId || companyId;
    if (!targetCompanyId) {
      setError("Vui lòng chọn công ty trực thuộc.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newDept = await createDepartment({
        company_id: targetCompanyId,
        name: trimmedName,
        order_index: Number(orderIndex) || 0,
      });
      onSuccess(newDept);
      onClose();
    } catch (err: any) {
      setError(err.message || "Không thể tạo phòng ban. Vui lòng kiểm tra lại kết nối hoặc thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-back"
      style={{
        display: "grid",
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        placeItems: "center",
        zIndex: 999,
        padding: "20px",
        animation: "fadeIn 0.18s ease-out",
      }}
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="modal"
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--panel, #FFFFFF)",
          borderRadius: "18px",
          border: "1px solid var(--line, #ECEEF3)",
          boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.04)",
          padding: "26px",
          overflow: "hidden",
          position: "relative",
          animation: "slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
                color: "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "22px",
                border: "1px solid rgba(124, 58, 237, 0.15)",
                boxShadow: "0 2px 6px rgba(124, 58, 237, 0.12)",
              }}
            >
              🏛️
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "var(--text, #1E2632)",
                  letterSpacing: "-0.01em",
                }}
              >
                Tạo phòng ban mới
              </h2>
              <p
                style={{
                  margin: "3px 0 0 0",
                  fontSize: "12.5px",
                  color: "var(--muted, #8A93A6)",
                  lineHeight: "1.4",
                }}
              >
                Thêm đơn vị phòng ban chức năng trong doanh nghiệp
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close"
            disabled={loading}
            onClick={onClose}
            aria-label="Đóng"
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: "var(--muted, #8A93A6)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              transition: "all 0.15s ease",
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Company Context Badge or Dropdown */}
          {companyId && !availableCompanies.length ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                background: "var(--bg, #F8FAFC)",
                border: "1px solid var(--line, #E2E8F0)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            >
              <span style={{ fontSize: "16px" }}>🏢</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: "var(--muted, #8A93A6)", fontSize: "11px", fontWeight: "600", display: "block", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Trực thuộc công ty
                </span>
                <span style={{ fontWeight: "600", color: "var(--text, #1E2632)" }}>
                  {currentCompanyName}
                </span>
              </div>
            </div>
          ) : availableCompanies.length > 0 ? (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text, #1E2632)",
                  marginBottom: "6px",
                }}
              >
                Công ty trực thuộc <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid var(--line, #CBD5E1)",
                  background: "var(--panel, #FFFFFF)",
                  color: "var(--text, #1E2632)",
                  fontSize: "13.5px",
                  outline: "none",
                }}
              >
                {availableCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏢 {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Department Name Input */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--text, #1E2632)",
                marginBottom: "6px",
              }}
            >
              Tên phòng ban <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              disabled={loading}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: Phòng Kỹ thuật, Ban Marketing, Phòng Nhân sự..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid var(--line, #CBD5E1)",
                background: "var(--panel, #FFFFFF)",
                color: "var(--text, #1E2632)",
                fontSize: "13.5px",
                outline: "none",
                transition: "border-color 0.15s ease",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Order Index */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: "600",
                color: "var(--text, #1E2632)",
                marginBottom: "6px",
              }}
            >
              Thứ tự hiển thị (Order Index)
            </label>
            <input
              type="number"
              min={0}
              disabled={loading}
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid var(--line, #CBD5E1)",
                background: "var(--panel, #FFFFFF)",
                color: "var(--text, #1E2632)",
                fontSize: "13.5px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Google Drive Integration Note */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "rgba(124, 58, 237, 0.06)",
              border: "1px solid rgba(124, 58, 237, 0.15)",
              fontSize: "12.5px",
              color: "#5B21B6",
              lineHeight: "1.4",
            }}
          >
            <span style={{ fontSize: "16px", marginTop: "1px" }}>☁️</span>
            <div>
              <b>Đồng bộ Google Drive tự động:</b> Hệ thống sẽ tự động tạo thư mục đám mây <b>"Phòng {name.trim() || '...'}"</b> trong Google Drive của công ty để lưu trữ hồ sơ tài liệu.
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#B91C1C",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠️</span>
              <span style={{ flex: 1 }}>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "8px",
              paddingTop: "14px",
              borderTop: "1px solid var(--line, #ECEEF3)",
            }}
          >
            <Button type="button" variant="default" onClick={onClose} disabled={loading}>
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!name.trim() || loading}
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                borderColor: "#6D28D9",
                minWidth: "120px",
              }}
            >
              {loading ? "Đang tạo..." : "Tạo phòng ban"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
