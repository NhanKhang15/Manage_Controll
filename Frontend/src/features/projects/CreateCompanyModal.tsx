import { useState, useEffect, useRef, type FormEvent } from "react";
import { createCompanyWithFolder, type TreeNode } from "../../api/companies";
import { Button } from "../../components/ui/Button";

export interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCompany: TreeNode) => void;
  parentCompany?: { id: string; name: string } | null;
  availableParents?: { id: string; name: string }[];
}

export function CreateCompanyModal({
  isOpen,
  onClose,
  onSuccess,
  parentCompany = null,
  availableParents = [],
}: CreateCompanyModalProps) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [companyType, setCompanyType] = useState<"root" | "sub">("root");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setError(null);
      setLoading(false);
      if (parentCompany) {
        setCompanyType("sub");
        setParentId(parentCompany.id);
      } else {
        setCompanyType("root");
        setParentId("");
      }
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen, parentCompany]);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || loading) return;

    setLoading(true);
    setError(null);

    try {
      const finalParentId = parentCompany?.id || (companyType === "sub" && parentId ? parentId : null);
      const newCompany = await createCompanyWithFolder({
        name: trimmedName,
        parent_id: finalParentId,
      });
      onSuccess(newCompany);
      onClose();
    } catch (err: any) {
      setError(err.message || "Không thể tạo công ty. Vui lòng kiểm tra lại kết nối hoặc thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const isChildCreation = Boolean(parentCompany);

  return (
    <div
      className="modal-back"
      style={{
        display: "grid",
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
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
          maxWidth: "490px",
          background: "var(--panel, #FFFFFF)",
          borderRadius: "18px",
          border: "1px solid var(--line, #ECEEF3)",
          boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.04)",
          padding: "26px",
          overflow: "hidden",
          position: "relative",
          animation: "slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Brand Icon */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, var(--brand-soft, #EEF1FE) 0%, #E0E7FF 100%)",
                color: "var(--brand, #4F6EF7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "20px",
                border: "1px solid rgba(79, 110, 247, 0.15)",
                boxShadow: "0 2px 6px rgba(79, 110, 247, 0.12)",
              }}
            >
              🏢
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
                {isChildCreation ? "Tạo công ty con" : "Tạo công ty mới"}
              </h2>
              <p
                style={{
                  margin: "3px 0 0 0",
                  fontSize: "12.5px",
                  color: "var(--muted, #8A93A6)",
                  lineHeight: "1.4",
                }}
              >
                {isChildCreation
                  ? `Thêm đơn vị thành viên trực thuộc ${parentCompany?.name}`
                  : "Khởi tạo đơn vị kinh doanh và thiết lập không gian số"}
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
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "var(--line-2, #F1F3F7)";
                e.currentTarget.style.color = "var(--text, #1E2632)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--muted, #8A93A6)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="settings-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Parent Company Badge (when pre-selected) */}
          {isChildCreation && parentCompany && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                background: "var(--bg, #FBFBFD)",
                border: "1px solid var(--line, #ECEEF3)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            >
              <span style={{ fontSize: "16px" }}>🌳</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: "var(--muted, #8A93A6)", fontSize: "11.5px", fontWeight: "600", display: "block", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Đơn vị trực thuộc
                </span>
                <span style={{ fontWeight: "600", color: "var(--text, #1E2632)" }}>
                  {parentCompany.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "3px 8px",
                  borderRadius: "99px",
                  background: "var(--brand-soft, #EEF1FE)",
                  color: "var(--brand, #4F6EF7)",
                }}
              >
                Cấp dưới
              </span>
            </div>
          )}

          {/* Company Type selection (only if not pre-bound to a parent and parents exist) */}
          {!isChildCreation && availableParents.length > 0 && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text, #1E2632)",
                  marginBottom: "8px",
                }}
              >
                Mô hình tổ chức
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setCompanyType("root")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: `1.5px solid ${companyType === "root" ? "var(--brand, #4F6EF7)" : "var(--line, #ECEEF3)"}`,
                    background: companyType === "root" ? "var(--brand-soft, #EEF1FE)" : "var(--panel, #FFFFFF)",
                    color: companyType === "root" ? "var(--brand, #4F6EF7)" : "var(--text, #1E2632)",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>🏛️</span>
                  <span>Cấp cao nhất (Mẹ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCompanyType("sub");
                    if (!parentId && availableParents[0]) setParentId(availableParents[0].id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: `1.5px solid ${companyType === "sub" ? "var(--brand, #4F6EF7)" : "var(--line, #ECEEF3)"}`,
                    background: companyType === "sub" ? "var(--brand-soft, #EEF1FE)" : "var(--panel, #FFFFFF)",
                    color: companyType === "sub" ? "var(--brand, #4F6EF7)" : "var(--text, #1E2632)",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>🌳</span>
                  <span>Công ty con</span>
                </button>
              </div>

              {companyType === "sub" && (
                <div style={{ marginTop: "10px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--muted, #8A93A6)",
                      marginBottom: "5px",
                    }}
                  >
                    Chọn công ty mẹ
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "10px",
                      border: "1px solid var(--line, #ECEEF3)",
                      background: "var(--bg, #FBFBFD)",
                      fontSize: "13.5px",
                      color: "var(--text, #1E2632)",
                      fontFamily: "inherit",
                    }}
                  >
                    {availableParents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Company Name Input */}
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
              Tên công ty / Đơn vị <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
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
                placeholder="VD: Công ty Cổ phần Vela Software..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: `1px solid ${error ? "var(--danger, #EF4444)" : "var(--line, #ECEEF3)"}`,
                  borderRadius: "10px",
                  fontSize: "14px",
                  background: "var(--bg, #FBFBFD)",
                  color: "var(--text, #1E2632)",
                  fontFamily: "inherit",
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.15s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand, #4F6EF7)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px var(--brand-soft, #EEF1FE)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? "var(--danger, #EF4444)" : "var(--line, #ECEEF3)";
                  e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(0, 0, 0, 0.02)";
                }}
              />
              {name && !loading && (
                <button
                  type="button"
                  onClick={() => setName("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "none",
                    border: "none",
                    color: "var(--muted, #8A93A6)",
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: "4px",
                    borderRadius: "50%",
                  }}
                  title="Xóa chữ"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Google Drive Integration Callout */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(79, 110, 247, 0.05) 0%, rgba(238, 241, 254, 0.6) 100%)",
              border: "1px solid rgba(79, 110, 247, 0.16)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "var(--panel, #FFFFFF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "15px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              📁
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "12.5px",
                  fontWeight: "700",
                  color: "var(--brand, #4F6EF7)",
                  marginBottom: "2px",
                }}
              >
                Tự động đồng bộ Google Drive
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#475569",
                  lineHeight: "1.45",
                }}
              >
                Hệ thống sẽ tự động khởi tạo 1 thư mục riêng trên Google Drive mang tên công ty để quản lý tài liệu và hợp đồng.
              </p>
              <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "var(--brand, #4F6EF7)",
                    background: "rgba(255, 255, 255, 0.8)",
                    padding: "2px 7px",
                    borderRadius: "6px",
                    border: "1px solid rgba(79, 110, 247, 0.15)",
                  }}
                >
                  ⚡ Khởi tạo tức thì
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#059669",
                    background: "rgba(255, 255, 255, 0.8)",
                    padding: "2px 7px",
                    borderRadius: "6px",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  🔒 Phân quyền bảo mật
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#B91C1C",
                fontSize: "13px",
                fontWeight: "500",
                animation: "fadeIn 0.15s ease",
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
              paddingTop: "6px",
              borderTop: "1px solid var(--line-2, #F1F3F7)",
              marginTop: "4px",
            }}
          >
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={onClose}
              style={{
                padding: "9px 16px",
                fontSize: "13.5px",
                fontWeight: "600",
                color: "var(--muted, #8A93A6)",
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !name.trim()}
              style={{
                padding: "9px 20px",
                fontSize: "13.5px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: name.trim() && !loading ? "0 2px 8px rgba(79, 110, 247, 0.3)" : "none",
                opacity: !name.trim() || loading ? 0.65 : 1,
                cursor: !name.trim() || loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <svg
                    style={{
                      width: "15px",
                      height: "15px",
                      animation: "spin 0.8s linear infinite",
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      style={{ opacity: 0.25 }}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      style={{ opacity: 0.85 }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Đang khởi tạo thư mục...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>{isChildCreation ? "Tạo công ty con" : "Tạo công ty"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
