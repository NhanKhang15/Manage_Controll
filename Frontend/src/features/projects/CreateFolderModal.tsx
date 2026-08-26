import { useState, useEffect, useRef, type FormEvent } from "react";
import { createProject } from "../../api/projects";
import type { TreeNode } from "../../api/companies";
import { Button } from "../../components/ui/Button";

// Tham chiếu ổn định — tránh mảng mặc định mới mỗi lần render khi prop không
// được truyền (xem giải thích ở CreateTaskModal.tsx).
const EMPTY_COMPANIES: { id: string; name: string }[] = [];
const EMPTY_DEPARTMENTS: { id: string; name: string; company_id?: string }[] = [];

export interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProject: TreeNode) => void;
  companyId?: string;
  departmentId?: string;
  parentId?: string;
  parentName?: string;
  parentType?: "company" | "department" | "project";
  availableCompanies?: { id: string; name: string }[];
  availableDepartments?: { id: string; name: string; company_id?: string }[];
}

export function CreateFolderModal({
  isOpen,
  onClose,
  onSuccess,
  companyId = "",
  departmentId = "",
  parentId = "",
  parentName = "",
  parentType = "company",
  availableCompanies = EMPTY_COMPANIES,
  availableDepartments = EMPTY_DEPARTMENTS,
}: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Triển khai");
  const [orderIndex, setOrderIndex] = useState(0);
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId);
  const [selectedDeptId, setSelectedDeptId] = useState(departmentId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSubfolder = Boolean(parentId) || parentType === "project";

  useEffect(() => {
    if (isOpen) {
      setName("");
      setStatus("Triển khai");
      setOrderIndex(0);
      setSelectedCompanyId(companyId || (availableCompanies[0]?.id ?? ""));
      setSelectedDeptId(departmentId);
      setError(null);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen, companyId, departmentId, parentId, availableCompanies]);

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
      let payload: {
        name: string;
        status?: string;
        company_id?: string;
        department_id?: string;
        parent_id?: string;
        order_index?: number;
      } = {
        name: trimmedName,
        status,
        order_index: Number(orderIndex) || 0,
      };

      if (isSubfolder && parentId) {
        payload.parent_id = parentId;
      } else if (departmentId || selectedDeptId) {
        payload.department_id = departmentId || selectedDeptId;
        if (companyId || selectedCompanyId) {
          payload.company_id = companyId || selectedCompanyId;
        }
      } else {
        payload.company_id = companyId || selectedCompanyId;
      }

      const newProject = await createProject(payload);
      onSuccess(newProject);
      onClose();
    } catch (err: any) {
      setError(err.message || "Không thể tạo folder. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  }

  const parentLabel =
    parentType === "project"
      ? "Thư mục cha"
      : parentType === "department"
      ? "Phòng ban quản lý"
      : "Công ty trực thuộc";

  const parentIcon = parentType === "project" ? "📁" : parentType === "department" ? "🏛️" : "🏢";

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
          maxWidth: "490px",
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
                background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "22px",
                border: "1px solid rgba(5, 150, 105, 0.15)",
                boxShadow: "0 2px 6px rgba(5, 150, 105, 0.12)",
              }}
            >
              📁
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
                {isSubfolder ? "Tạo folder con mới" : "Tạo folder / dự án mới"}
              </h2>
              <p
                style={{
                  margin: "3px 0 0 0",
                  fontSize: "12.5px",
                  color: "var(--muted, #8A93A6)",
                  lineHeight: "1.4",
                }}
              >
                {isSubfolder
                  ? `Thư mục con bên trong "${parentName || 'Thư mục cha'}"`
                  : "Khởi tạo không gian dự án / thư mục để tổ chức công việc"}
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
          {/* Parent Context Badge */}
          {parentName ? (
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
              <span style={{ fontSize: "16px" }}>{parentIcon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: "var(--muted, #8A93A6)", fontSize: "11px", fontWeight: "600", display: "block", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  {parentLabel}
                </span>
                <span style={{ fontWeight: "600", color: "var(--text, #1E2632)" }}>
                  {parentName}
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "3px 8px",
                  borderRadius: "99px",
                  background: "#ECFDF5",
                  color: "#059669",
                }}
              >
                {isSubfolder ? "Thư mục con" : "Dự án"}
              </span>
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
                Công ty quản lý <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
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

          {/* Folder / Project Name Input */}
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
              {isSubfolder ? "Tên thư mục con" : "Tên folder / dự án"}{" "}
              <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
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
              placeholder={isSubfolder ? "VD: Thiết kế UI, Tài liệu giai đoạn 1..." : "VD: Dự án Website E-commerce, Quản lý Vận hành..."}
              style={{
                width: "100%",
                padding: "10px 12px",
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

          {/* Status & Order Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
                Trạng thái folder / dự án
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "1px solid var(--line, #CBD5E1)",
                  background: "var(--panel, #FFFFFF)",
                  color: "var(--text, #1E2632)",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value="Triển khai">🚀 Triển khai</option>
                <option value="Đang thực hiện">⚡ Đang thực hiện</option>
                <option value="Lên kế hoạch">📝 Lên kế hoạch</option>
                <option value="Tạm dừng">⏸️ Tạm dừng</option>
                <option value="Hoàn thành">✅ Hoàn thành</option>
              </select>
            </div>

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
                Thứ tự sắp xếp
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
          </div>

          {/* Google Drive Integration Note */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "rgba(5, 150, 105, 0.06)",
              border: "1px solid rgba(5, 150, 105, 0.15)",
              fontSize: "12.5px",
              color: "#065F46",
              lineHeight: "1.4",
            }}
          >
            <span style={{ fontSize: "16px", marginTop: "1px" }}>☁️</span>
            <div>
              <b>Đồng bộ Google Drive:</b> Thư mục Drive tương ứng sẽ được tự động tạo bên trong thư mục cha và liên kết vào hệ thống.
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

          {/* Department selector if departments are available and not pre-bound */}
          {!parentName && availableDepartments.length > 0 && (
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
                Phòng ban trực thuộc (Tuỳ chọn)
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "1px solid var(--line, #CBD5E1)",
                  background: "var(--panel, #FFFFFF)",
                  color: "var(--text, #1E2632)",
                  fontSize: "13.5px",
                  outline: "none",
                }}
              >
                <option value="">— Trực tiếp thuộc công ty —</option>
                {availableDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    🏛️ {d.name}
                  </option>
                ))}
              </select>
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
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                borderColor: "#047857",
                minWidth: "120px",
              }}
            >
              {loading ? "Đang tạo..." : isSubfolder ? "Tạo folder con" : "Tạo folder / dự án"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
