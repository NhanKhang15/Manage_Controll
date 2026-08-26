import { useState, useEffect, useRef, type FormEvent } from "react";
import { createTask } from "../../api/tasks";
import { getEmployees, type EmployeeListItem } from "../../api/employees";
import { Button } from "../../components/ui/Button";

// Tham chiếu ổn định cho giá trị mặc định — `= []` trực tiếp trong tham số sẽ
// tạo mảng MỚI mỗi lần component render khi prop không được truyền, khiến
// useEffect có mảng đó trong dependency chạy lại vô hạn (setEmployees bên
// trong effect → re-render → mảng default mới → effect chạy lại → ...).
const EMPTY_PROJECTS: { id: string; name: string }[] = [];
const EMPTY_DEPARTMENTS: { id: string; name: string }[] = [];
const EMPTY_EMPLOYEES: EmployeeListItem[] = [];

export interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTask: any) => void;
  companyId?: string;
  defaultProjectId?: string;
  defaultDepartmentId?: string;
  availableProjects?: { id: string; name: string }[];
  availableDepartments?: { id: string; name: string }[];
  availableEmployees?: EmployeeListItem[];
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
  companyId = "",
  defaultProjectId = "",
  defaultDepartmentId = "",
  availableProjects = EMPTY_PROJECTS,
  availableDepartments = EMPTY_DEPARTMENTS,
  availableEmployees = EMPTY_EMPLOYEES,
}: CreateTaskModalProps) {
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [departmentId, setDepartmentId] = useState(defaultDepartmentId);
  const [picId, setPicId] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Cần làm");
  const [effortPoints, setEffortPoints] = useState<number | null>(null);
  const [isMilestone, setIsMilestone] = useState(false);
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
      setProjectId(defaultProjectId || (availableProjects[0]?.id ?? ""));
      setDepartmentId(defaultDepartmentId || (availableDepartments[0]?.id ?? ""));
      setPicId("");
      setAssigneeIds([]);
      setDueDate("");
      setStatus("Cần làm");
      setEffortPoints(null);
      setIsMilestone(false);
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
  }, [isOpen, defaultProjectId, defaultDepartmentId, companyId, availableProjects, availableDepartments, availableEmployees]);

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

  function toggleAssignee(empId: string) {
    setAssigneeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || loading) return;

    if (!projectId && !departmentId) {
      setError("Vui lòng chọn Dự án hoặc Phòng ban cho công việc.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newTask = await createTask({
        name: trimmedName,
        project_id: projectId || undefined,
        department_id: departmentId || undefined,
        pic_id: picId || null,
        assignee_ids: assigneeIds.length ? assigneeIds : undefined,
        due_date: dueDate || null,
        status,
        effort_points: effortPoints,
        is_milestone: isMilestone,
        is_flagged: isFlagged,
        is_problem: isProblem,
        can_automate: canAutomate,
        notes: notes.trim(),
      });
      onSuccess(newTask);
      onClose();
    } catch (err: any) {
      setError(err.message || "Không thể tạo công việc. Vui lòng kiểm tra lại thông tin.");
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
          maxWidth: "580px",
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
                background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
                color: "#4F46E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "22px",
                border: "1px solid rgba(79, 70, 229, 0.15)",
                boxShadow: "0 2px 6px rgba(79, 70, 229, 0.12)",
              }}
            >
              📋
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
                Tạo công việc mới
              </h2>
              <p
                style={{
                  margin: "3px 0 0 0",
                  fontSize: "12.5px",
                  color: "var(--muted, #8A93A6)",
                  lineHeight: "1.4",
                }}
              >
                Giao việc, chỉ định người phụ trách và theo dõi tiến độ
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
          {/* Task Name */}
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
              Tên công việc <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
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
              placeholder="VD: Thiết kế mockup trang chủ, Kiểm tra hợp đồng pháp lý..."
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

          {/* Project & Department Row */}
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
                Dự án / Folder
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
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
                <option value="">— Chọn Dự án / Folder —</option>
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
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
                Phòng ban phụ trách
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
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
                <option value="">— Chọn Phòng ban —</option>
                {availableDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    🏛️ {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PIC (Người phụ trách chính) & Due Date Row */}
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
                Người phụ trách chính (PIC)
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
                <option value="">— Chưa gán người phụ trách —</option>
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

          {/* Status & Effort Points Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignItems: "center" }}>
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
                Trạng thái ban đầu
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
                Độ phức tạp (Effort Points)
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
                        border: `1.5px solid ${isSelected ? "#4F46E5" : "var(--line, #CBD5E1)"}`,
                        background: isSelected ? "#EEF2FF" : "var(--panel, #FFFFFF)",
                        color: isSelected ? "#4F46E5" : "var(--text, #1E2632)",
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

          {/* Special Flags Toggles */}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: isFlagged ? "#FFFBEB" : "var(--bg, #F8FAFC)",
                  border: `1px solid ${isFlagged ? "#FCD34D" : "var(--line, #E2E8F0)"}`,
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  checked={isFlagged}
                  onChange={(e) => setIsFlagged(e.target.checked)}
                  style={{ width: "15px", height: "15px" }}
                />
                <span>🚩 Gắn cờ quan trọng</span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: isMilestone ? "#F5F3FF" : "var(--bg, #F8FAFC)",
                  border: `1px solid ${isMilestone ? "#C4B5FD" : "var(--line, #E2E8F0)"}`,
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  checked={isMilestone}
                  onChange={(e) => setIsMilestone(e.target.checked)}
                  style={{ width: "15px", height: "15px" }}
                />
                <span>🎯 Cột mốc (Milestone)</span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: isProblem ? "#FEF2F2" : "var(--bg, #F8FAFC)",
                  border: `1px solid ${isProblem ? "#FCA5A5" : "var(--line, #E2E8F0)"}`,
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  checked={isProblem}
                  onChange={(e) => setIsProblem(e.target.checked)}
                  style={{ width: "15px", height: "15px" }}
                />
                <span>⚠️ Có vấn đề / Rủi ro</span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: canAutomate ? "#F0FDF4" : "var(--bg, #F8FAFC)",
                  border: `1px solid ${canAutomate ? "#86EFAC" : "var(--line, #E2E8F0)"}`,
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  checked={canAutomate}
                  onChange={(e) => setCanAutomate(e.target.checked)}
                  style={{ width: "15px", height: "15px" }}
                />
                <span>🤖 Tự động hoá AI</span>
              </label>
            </div>
          </div>

          {/* Assignees (Người phối hợp) */}
          {employees.length > 0 && (
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
                Người tham gia phối hợp ({assigneeIds.length})
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  maxHeight: "84px",
                  overflowY: "auto",
                  padding: "6px",
                  background: "var(--bg, #F8FAFC)",
                  border: "1px solid var(--line, #E2E8F0)",
                  borderRadius: "10px",
                }}
              >
                {employees.map((emp) => {
                  const isChecked = assigneeIds.includes(emp.id);
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => toggleAssignee(emp.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        border: `1px solid ${isChecked ? "#4F46E5" : "var(--line, #CBD5E1)"}`,
                        background: isChecked ? "#EEF2FF" : "var(--panel, #FFFFFF)",
                        color: isChecked ? "#4F46E5" : "var(--text, #1E2632)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>{isChecked ? "✓" : "+"}</span>
                      <span>{emp.full_name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes / Description */}
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
              Mô tả chi tiết & Ghi chú
            </label>
            <textarea
              rows={3}
              disabled={loading}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập yêu cầu thực hiện, tiêu chí nghiệm thu hoặc ghi chú cho người nhận việc..."
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

          {/* Google Docs Note */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "rgba(79, 70, 229, 0.06)",
              border: "1px solid rgba(79, 70, 229, 0.15)",
              fontSize: "12px",
              color: "#3730A3",
              lineHeight: "1.4",
            }}
          >
            <span style={{ fontSize: "16px", marginTop: "1px" }}>📄</span>
            <div>
              <b>Tự động tạo Google Doc:</b> Một tài liệu Google Doc theo chuẩn công việc sẽ được tự động khởi tạo trên Google Drive và đính kèm vào thẻ việc này.
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
                background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
                borderColor: "#4338CA",
                minWidth: "120px",
              }}
            >
              {loading ? "Đang tạo..." : "Tạo công việc"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
