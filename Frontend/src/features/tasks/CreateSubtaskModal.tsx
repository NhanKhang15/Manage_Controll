import { useState, useEffect, useRef, type FormEvent } from "react";
import { createTask } from "../../api/tasks";
import { getEmployees, type EmployeeListItem } from "../../api/employees";
import { Button } from "../../components/ui/Button";

// Tham chiếu ổn định — `= []` trực tiếp trong tham số tạo mảng MỚI mỗi lần
// render khi prop không được truyền, khiến useEffect phụ thuộc mảng đó chạy
// lại vô hạn (xem giải thích tương tự ở CreateTaskModal.tsx).
const EMPTY_EMPLOYEES: EmployeeListItem[] = [];

export interface CreateSubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSubtask: any) => void;
  parentTask: {
    id: string;
    name: string;
    projectName?: string;
    departmentName?: string;
    dueDate?: string | null;
  } | null;
  companyId?: string;
  availableEmployees?: EmployeeListItem[];
}

export function CreateSubtaskModal({
  isOpen,
  onClose,
  onSuccess,
  parentTask,
  companyId = "",
  availableEmployees = EMPTY_EMPLOYEES,
}: CreateSubtaskModalProps) {
  const [name, setName] = useState("");
  const [picId, setPicId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Cần làm");
  const [effortPoints, setEffortPoints] = useState<number | null>(null);
  const [isFlagged, setIsFlagged] = useState(false);
  const [isProblem, setIsProblem] = useState(false);
  const [canAutomate, setCanAutomate] = useState(false);
  const [notes, setNotes] = useState("");

  const [employees, setEmployees] = useState<EmployeeListItem[]>(availableEmployees);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPicId("");
      setDueDate("");
      setStatus("Cần làm");
      setEffortPoints(null);
      setIsFlagged(false);
      setIsProblem(false);
      setCanAutomate(false);
      setNotes("");
      setError(null);
      setLoading(false);

      if (availableEmployees.length > 0) {
        setEmployees(availableEmployees);
      } else if (companyId) {
        getEmployees(companyId, { compact: true })
          .then(setEmployees)
          .catch(() => setEmployees([]));
      }

      setTimeout(() => nameInputRef.current?.focus(), 60);
    }
  }, [isOpen, parentTask, companyId, availableEmployees]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !parentTask) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || loading || !parentTask) return;

    setLoading(true);
    setError(null);

    try {
      const newSubtask = await createTask({
        parent_id: parentTask.id,
        name: trimmedName,
        pic_id: picId || null,
        due_date: dueDate || null,
        status,
        effort_points: effortPoints,
        is_flagged: isFlagged,
        is_problem: isProblem,
        can_automate: canAutomate,
        notes: notes.trim(),
      });
      onSuccess(newSubtask);
      onClose();
    } catch (err: any) {
      setError(err.message || "Không thể tạo việc con. Vui lòng kiểm tra lại kết nối.");
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
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        placeItems: "center",
        zIndex: 999,
        padding: "20px",
        overflowY: "auto",
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
          maxWidth: "540px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--panel, #FFFFFF)",
          borderRadius: "18px",
          border: "1px solid var(--line, #ECEEF3)",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          padding: "24px 26px",
          overflow: "hidden",
          position: "relative",
          animation: "slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "22px",
                border: "1px solid rgba(217, 119, 6, 0.15)",
                boxShadow: "0 2px 6px rgba(217, 119, 6, 0.12)",
              }}
            >
              🌿
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
                Tạo việc con mới (Subtask)
              </h2>
              <p
                style={{
                  margin: "3px 0 0 0",
                  fontSize: "12.5px",
                  color: "var(--muted, #8A93A6)",
                  lineHeight: "1.4",
                }}
              >
                Chia nhỏ công việc để quản lý chi tiết và dễ bàn giao
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
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            overflowY: "auto",
            paddingRight: "4px",
            flex: 1,
          }}
        >
          {/* Parent Task Banner */}
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
            <span style={{ fontSize: "16px" }}>📋</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ color: "var(--muted, #8A93A6)", fontSize: "11px", fontWeight: "600", display: "block", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Việc cha
              </span>
              <span style={{ fontWeight: "600", color: "var(--text, #1E2632)" }}>
                {parentTask.name}
              </span>
            </div>
            {parentTask.dueDate && (
              <span
                style={{
                  fontSize: "11.5px",
                  color: "var(--muted, #64748B)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  background: "#F1F5F9",
                }}
              >
                Hạn cha: {parentTask.dueDate}
              </span>
            )}
          </div>

          {/* Subtask Name */}
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
              Tên việc con <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              required
              disabled={loading}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: Thu thập số liệu kế toán, Rà soát điều khoản phụ lục..."
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

          {/* PIC & Due Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
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
                Người phụ trách việc con (PIC)
              </label>
              <select
                value={picId}
                onChange={(e) => setPicId(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "1px solid var(--line, #CBD5E1)",
                  background: "var(--panel, #FFFFFF)",
                  color: "var(--text, #1E2632)",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value="">— Chưa gán người làm —</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    👤 {emp.full_name} {emp.position_title ? `(${emp.position_title})` : ""}
                  </option>
                ))}
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
                Hạn hoàn thành
              </label>
              <input
                type="date"
                disabled={loading}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid var(--line, #CBD5E1)",
                  background: "var(--panel, #FFFFFF)",
                  color: "var(--text, #1E2632)",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Status & Effort Points */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "12px", alignItems: "center" }}>
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
                Trạng thái việc con
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
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value="Cần làm">📌 Cần làm</option>
                <option value="Đang làm">⚡ Đang làm</option>
                <option value="Ý tưởng">💡 Ý tưởng</option>
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
                Độ phức tạp
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { val: 1, label: "1 (Nhỏ)" },
                  { val: 3, label: "3 (Vừa)" },
                  { val: 5, label: "5 (Lớn)" },
                  { val: 8, label: "8 (Rất lớn)" },
                ].map((item) => {
                  const isSelected = effortPoints === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setEffortPoints(isSelected ? null : item.val)}
                      style={{
                        flex: 1,
                        padding: "6px 2px",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontWeight: "600",
                        border: `1.5px solid ${isSelected ? "#D97706" : "var(--line, #CBD5E1)"}`,
                        background: isSelected ? "#FEF3C7" : "var(--panel, #FFFFFF)",
                        color: isSelected ? "#B45309" : "var(--text, #1E2632)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Flags */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: "600",
                color: "var(--text, #1E2632)",
                marginBottom: "8px",
              }}
            >
              Đặc tính & Cờ theo dõi
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 8px",
                  borderRadius: "8px",
                  background: isFlagged ? "#FFFBEB" : "var(--bg, #F8FAFC)",
                  border: `1px solid ${isFlagged ? "#FCD34D" : "var(--line, #E2E8F0)"}`,
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  checked={isFlagged}
                  onChange={(e) => setIsFlagged(e.target.checked)}
                  style={{ width: "14px", height: "14px" }}
                />
                <span>🚩 Gắn cờ</span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 8px",
                  borderRadius: "8px",
                  background: isProblem ? "#FEF2F2" : "var(--bg, #F8FAFC)",
                  border: `1px solid ${isProblem ? "#FCA5A5" : "var(--line, #E2E8F0)"}`,
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  checked={isProblem}
                  onChange={(e) => setIsProblem(e.target.checked)}
                  style={{ width: "14px", height: "14px" }}
                />
                <span>⚠️ Vấn đề</span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 8px",
                  borderRadius: "8px",
                  background: canAutomate ? "#F0FDF4" : "var(--bg, #F8FAFC)",
                  border: `1px solid ${canAutomate ? "#86EFAC" : "var(--line, #E2E8F0)"}`,
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  checked={canAutomate}
                  onChange={(e) => setCanAutomate(e.target.checked)}
                  style={{ width: "14px", height: "14px" }}
                />
                <span>🤖 AI Auto</span>
              </label>
            </div>
          </div>

          {/* Notes / Details */}
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
              Yêu cầu thực hiện việc con
            </label>
            <textarea
              rows={3}
              disabled={loading}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập tiêu chí hoàn thành, các bước thực hiện việc con..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid var(--line, #CBD5E1)",
                background: "var(--panel, #FFFFFF)",
                color: "var(--text, #1E2632)",
                fontSize: "13px",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
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
              marginTop: "6px",
              paddingTop: "14px",
              borderTop: "1px solid var(--line, #ECEEF3)",
              flexShrink: 0,
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
                background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
                borderColor: "#B45309",
                minWidth: "120px",
              }}
            >
              {loading ? "Đang tạo..." : "Tạo việc con"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
