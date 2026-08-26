import { useState, useEffect, useRef, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { createEvent, updateEvent, getDrivers, uploadFile } from "../../api/events";
import { apiFetch } from "../../api/client";
import type { CalendarEventItem } from "../../types/calendar";
import { getAvatarProps } from "../../utils/avatar";

export interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
  defaultDate: string;
  selectedCompanyId?: string;
  editingEvent?: CalendarEventItem | null;
}

export function EventFormModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  defaultDate,
  selectedCompanyId = "",
  editingEvent = null,
}: EventFormModalProps) {
  const isEditing = !!editingEvent;
  const [tabType, setTabType] = useState<"meeting" | "personal">("meeting");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [onlineMeetingLink, setOnlineMeetingLink] = useState("");
  const [content, setContent] = useState("");

  // Options
  const [needPickupCar, setNeedPickupCar] = useState(false);
  const [driverId, setDriverId] = useState("");
  const [drivers, setDrivers] = useState<any[]>([]);

  const [hasGift, setHasGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  const [inviteAllCompany, setInviteAllCompany] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);

  const [employees, setEmployees] = useState<any[]>([]);
  const [empQuery, setEmpQuery] = useState("");
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);

  const [attachments, setAttachments] = useState<{ url: string; name: string }[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setTabType(editingEvent.type === "personal" ? "personal" : "meeting");
        setTitle(editingEvent.title || "");
        setDate(editingEvent.eventDate || defaultDate);
        setStartTime(editingEvent.startTime || "09:00");
        setEndTime(editingEvent.endTime || "10:00");
        setLocation(editingEvent.location || "");
        setOnlineMeetingLink(editingEvent.onlineMeetingLink || "");
        setContent(editingEvent.content || "");
        setNeedPickupCar(Boolean(editingEvent.needPickupCar));
        setDriverId(editingEvent.driverId || "");
        setHasGift(Boolean(editingEvent.hasGift));
        setGiftNote(editingEvent.giftNote || "");
        setInviteAllCompany(Boolean(editingEvent.inviteAllCompany));
        setSelectedDeptIds(editingEvent.invitedDepartmentIds || []);
        setSelectedEmpIds(editingEvent.invitedEmployeeIds || []);
        setAttachments(editingEvent.attachments || []);
      } else {
        setTabType("meeting");
        setTitle("");
        setDate(defaultDate);
        setStartTime("09:00");
        setEndTime("10:00");
        setLocation("");
        setOnlineMeetingLink("");
        setContent("");
        setNeedPickupCar(false);
        setDriverId("");
        setHasGift(false);
        setGiftNote("");
        setInviteAllCompany(false);
        setSelectedDeptIds([]);
        setSelectedEmpIds([]);
        setAttachments([]);
      }
      setError(null);
      setLoading(false);
      setTimeout(() => titleInputRef.current?.focus(), 50);

      // Fetch drivers, departments & employees for target company
      const targetCompanyId = editingEvent?.companyId || selectedCompanyId;
      if (targetCompanyId) {
        getDrivers(targetCompanyId).then(setDrivers).catch(() => {});
        apiFetch(`/departments/?company_id=${targetCompanyId}`)
          .then((data) => setDepartments(Array.isArray(data) ? data : []))
          .catch(() => setDepartments([]));
        apiFetch(`/employees/?company_id=${targetCompanyId}`)
          .then((data) => setEmployees(Array.isArray(data) ? data : []))
          .catch(() => setEmployees([]));
      } else {
        getDrivers().then(setDrivers).catch(() => {});
        apiFetch(`/departments/`)
          .then((data) => setDepartments(Array.isArray(data) ? data : []))
          .catch(() => setDepartments([]));
        apiFetch(`/employees/`)
          .then((data) => setEmployees(Array.isArray(data) ? data : []))
          .catch(() => setEmployees([]));
      }
    }
  }, [isOpen, defaultDate, selectedCompanyId, editingEvent]);

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

  const filteredEmployees = employees.filter((e) =>
    e.full_name?.toLowerCase().includes(empQuery.toLowerCase()) ||
    e.email?.toLowerCase().includes(empQuery.toLowerCase())
  );

  const halfDepts = Math.ceil(departments.length / 2);
  const leftColDepts = departments.slice(0, halfDepts);
  const rightColDepts = departments.slice(halfDepts);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const res = await uploadFile(files[i]);
        setAttachments((prev) => [...prev, res]);
      }
    } catch (err: any) {
      setError(err.message || "Tải file thất bại");
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề (bắt buộc).");
      titleInputRef.current?.focus();
      return;
    }
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const companyIdToUse = (isEditing && editingEvent?.companyId) ? editingEvent.companyId : selectedCompanyId;
      const payload = {
        company_id: companyIdToUse,
        type: tabType,
        title: title.trim(),
        content: content.trim(),
        event_date: date,
        start_time: startTime,
        end_time: endTime,
        location: location.trim(),
        online_meeting_link: onlineMeetingLink.trim(),
        need_pickup_car: tabType === "meeting" && needPickupCar,
        driver_id: tabType === "meeting" && needPickupCar ? driverId : undefined,
        has_gift: tabType === "meeting" && hasGift,
        gift_note: tabType === "meeting" && hasGift ? giftNote : undefined,
        invite_all_company: tabType === "meeting" && inviteAllCompany,
        invited_department_ids: tabType === "meeting" && !inviteAllCompany ? selectedDeptIds : [],
        invited_employee_ids: tabType === "meeting" && !inviteAllCompany ? selectedEmpIds : [],
        attachment_urls: attachments,
      };

      if (isEditing && editingEvent) {
        await updateEvent(editingEvent.id, payload);
      } else {
        await createEvent(payload);
      }

      onSubmitSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Không thể lưu lịch. Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} title={isEditing ? "Sửa lịch" : "Thêm lịch"} onClose={onClose}>
      <form className="login-form space-y-4" onSubmit={handleSubmit}>
        {/* Tabs: Cuộc họp / Lịch cá nhân */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <label className="kind-opt" style={{ flex: 1, cursor: "pointer" }}>
            <input
              type="radio"
              name="tabType"
              checked={tabType === "meeting"}
              onChange={() => setTabType("meeting")}
            />
            <span style={{ fontWeight: 600 }}>🤝 Cuộc họp</span>
          </label>
          <label className="kind-opt" style={{ flex: 1, cursor: "pointer" }}>
            <input
              type="radio"
              name="tabType"
              checked={tabType === "personal"}
              onChange={() => setTabType("personal")}
            />
            <span style={{ fontWeight: 600 }}>🏠 Lịch cá nhân</span>
          </label>
        </div>

        <label>
          Tiêu đề <span className="text-red-500" title="Bắt buộc">*</span>
          <input
            ref={titleInputRef}
            type="text"
            required
            disabled={loading}
            placeholder="Họp giao ban, demo khách hàng…"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim() && error === "Vui lòng nhập tiêu đề (bắt buộc).") {
                setError(null);
              }
            }}
            style={{
              borderColor: error && !title.trim() ? "var(--red, #ef4444)" : undefined,
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ flex: 1 }}>
            Ngày 
            <input type="date" required disabled={loading} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label style={{ flex: 1 }}>
            Bắt đầu
            <input type="time" disabled={loading} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </label>
          <label style={{ flex: 1 }}>
            Kết thúc
            <input type="time" disabled={loading} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </label>
        </div>

        <label>
          Địa điểm
          <input
            type="text"
            disabled={loading}
            placeholder="Phòng họp 1 / Trực tuyến…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        {tabType === "meeting" && (
          <label>
            Link họp trực tuyến
            <input
              type="url"
              disabled={loading}
              placeholder="https://meet.google.com/..."
              value={onlineMeetingLink}
              onChange={(e) => setOnlineMeetingLink(e.target.value)}
            />
          </label>
        )}

        <label>
          Nội dung / Ghi chú
          <textarea
            rows={2}
            disabled={loading}
            placeholder="Chi tiết chương trình họp…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13.5 }}
          />
        </label>

        {/* Conditional fields for Meeting tab */}
        {tabType === "meeting" && (
          <>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={needPickupCar}
                  onChange={(e) => setNeedPickupCar(e.target.checked)}
                />
                🚗 Cần xe đưa đón
              </label>

              {needPickupCar && (
                <div style={{ marginTop: 8, paddingLeft: 24 }}>
                  <label style={{ fontSize: 13 }}>
                    Chọn tài xế <span className="text-red-500">*</span>
                    <select
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      required={needPickupCar}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", marginTop: 4 }}
                    >
                      <option value="">-- Chọn tài xế --</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name} ({d.phone || "Chưa có SĐT"})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={hasGift}
                  onChange={(e) => setHasGift(e.target.checked)}
                />
                🎁 Có quà tặng
              </label>

              {hasGift && (
                <div style={{ marginTop: 8, paddingLeft: 24 }}>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú quà tặng (loại quà, số lượng)..."
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13 }}
                  />
                </div>
              )}
            </div>

            {/* 1. Section Mời tham gia */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                Mời tham gia
              </div>

              {/* 2. Checkbox "Cả công ty" — full width, nổi bật */}
              <label
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  borderRadius: 8,
                  background: inviteAllCompany ? "rgba(99,102,241,0.08)" : "#f9fafb",
                  padding: "10px 12px",
                  marginBottom: 10,
                  cursor: "pointer",
                  border: inviteAllCompany ? "1px solid var(--brand)" : "1px solid #f3f4f6",
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="checkbox"
                  checked={inviteAllCompany}
                  onChange={(e) => setInviteAllCompany(e.target.checked)}
                  style={{ width: 16, height: 16, margin: 0, flexShrink: 0, cursor: "pointer", accentColor: "var(--brand)" }}
                />
                <span style={{ fontSize: 14, fontWeight: 500, color: "#1f2937" }}>🏢 Cả công ty</span>
              </label>

              {/* Dưới "Cả công ty": mờ đi & disable khi inviteAllCompany = true */}
              <div
                style={{
                  opacity: inviteAllCompany ? 0.45 : 1,
                  pointerEvents: inviteAllCompany ? "none" : "auto",
                  transition: "opacity 0.2s",
                }}
              >
                {/* 3. Lưới phòng ban — grid 2 cột */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 16px", marginBottom: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {leftColDepts.map((dept) => {
                      const isChecked = selectedDeptIds.includes(dept.id);
                      return (
                        <label
                          key={dept.id}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            padding: "5px 6px",
                            fontSize: 13.5,
                            color: "#374151",
                            cursor: "pointer",
                            borderRadius: 6,
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={inviteAllCompany}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedDeptIds([...selectedDeptIds, dept.id]);
                              else setSelectedDeptIds(selectedDeptIds.filter((id) => id !== dept.id));
                            }}
                            style={{ width: 15, height: 15, margin: 0, flexShrink: 0, cursor: "pointer", accentColor: "var(--brand)" }}
                          />
                          <span>{dept.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {rightColDepts.map((dept) => {
                      const isChecked = selectedDeptIds.includes(dept.id);
                      return (
                        <label
                          key={dept.id}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            padding: "5px 6px",
                            fontSize: 13.5,
                            color: "#374151",
                            cursor: "pointer",
                            borderRadius: 6,
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={inviteAllCompany}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedDeptIds([...selectedDeptIds, dept.id]);
                              else setSelectedDeptIds(selectedDeptIds.filter((id) => id !== dept.id));
                            }}
                            style={{ width: 15, height: 15, margin: 0, flexShrink: 0, cursor: "pointer", accentColor: "var(--brand)" }}
                          />
                          <span>{dept.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Tiêu đề phụ + ô tìm kiếm cùng 1 hàng */}
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 8 }}>
                  <span style={{ fontSize: 13.5, color: "#6b7280", fontWeight: 500 }}>Hoặc chọn từng người</span>
                  <input
                    type="text"
                    placeholder="Tìm tên..."
                    value={empQuery}
                    onChange={(e) => setEmpQuery(e.target.value)}
                    style={{
                      width: 180,
                      padding: "5px 12px",
                      borderRadius: 10,
                      border: "1px solid #d1d5db",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>

                {/* 5. Danh sách nhân viên — scrollable box, avatar 2 chữ cái */}
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    maxHeight: 200,
                    overflowY: "auto",
                    background: "#fff",
                  }}
                >
                  {filteredEmployees.length === 0 ? (
                    <div style={{ padding: 12, fontSize: 12.5, color: "#9ca3af", textAlign: "center" }}>
                      Không tìm thấy nhân viên nào
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const { initials, backgroundColor } = getAvatarProps(emp);
                      const isChecked = selectedEmpIds.includes(emp.id);
                      return (
                        <label
                          key={emp.id}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f3f4f6",
                            transition: "background 0.15s",
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={inviteAllCompany}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedEmpIds([...selectedEmpIds, emp.id]);
                              else setSelectedEmpIds(selectedEmpIds.filter((id) => id !== emp.id));
                            }}
                            style={{ width: 16, height: 16, margin: 0, flexShrink: 0, cursor: "pointer", accentColor: "var(--brand)" }}
                          />
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              backgroundColor,
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 500, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {emp.full_name}
                            </div>
                            {emp.primary_department_name ? (
                              <div style={{ fontSize: 11.5, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {emp.primary_department_name}
                              </div>
                            ) : null}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 6. Text hướng dẫn cuối */}
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12, lineHeight: 1.4 }}>
                Mời theo <b>bộ phận</b>, chọn <b>từng người</b>, hoặc gõ lệnh ở Trợ lý:{" "}
                <i>"Đặt lịch họp ... với phòng Kinh doanh 10h mai"</i>.
              </p>
            </div>
          </>
        )}

        {/* File Attachments */}
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>📎 File đính kèm</div>
          <input type="file" multiple onChange={handleFileUpload} disabled={uploadingFile || loading} style={{ fontSize: 13 }} />
          {uploadingFile && <span style={{ fontSize: 12, color: "var(--muted)" }}> Đang tải file lên...</span>}
          {attachments.length > 0 && (
            <ul style={{ marginTop: 6, fontSize: 12, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              {attachments.map((att, idx) => (
                <li key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--card-bg, #f9fafb)", padding: "4px 8px", borderRadius: 6 }}>
                  <a href={att.url} target="_blank" rel="noreferrer" style={{ color: "var(--brand)", textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "85%" }}>
                    📄 {att.name}
                  </a>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--red, #ef4444)",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: 14,
                      lineHeight: 1,
                      padding: "2px 6px",
                    }}
                    title="Xóa tệp đính kèm này"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 10 }}>
          <Button type="button" variant="ghost" disabled={loading} onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu lịch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
