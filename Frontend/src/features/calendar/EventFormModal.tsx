import { useState, useEffect, useRef, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { createEvent, getDrivers, uploadFile } from "../../api/events";
import { apiFetch } from "../../api/client";
import { currentUser } from "../../mocks/user";

export interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
  defaultDate: string;
  selectedCompanyId?: string;
}

export function EventFormModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  defaultDate,
  selectedCompanyId = "",
}: EventFormModalProps) {
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
      setError(null);
      setLoading(false);
      setTimeout(() => titleInputRef.current?.focus(), 50);

      // Fetch drivers & employees
      if (selectedCompanyId) {
        getDrivers(selectedCompanyId).then(setDrivers).catch(() => {});
        apiFetch(`/employees/?company_id=${selectedCompanyId}`).then(setEmployees).catch(() => {});
      } else {
        apiFetch(`/employees/`).then(setEmployees).catch(() => {});
      }
    }
  }, [isOpen, defaultDate, selectedCompanyId]);

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
    if (!title.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      await createEvent(
        {
          company_id: selectedCompanyId,
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
        },
        currentUser.employeeId
      );

      onSubmitSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Không thể tạo lịch. Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} title="Thêm lịch" onClose={onClose}>
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
          Tiêu đề <span className="text-red-500">*</span>
          <input
            ref={titleInputRef}
            type="text"
            required
            disabled={loading}
            placeholder="Họp giao ban, demo khách hàng…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ flex: 1 }}>
            Ngày <span className="text-red-500">*</span>
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

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>👥 Mời tham gia</div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={inviteAllCompany}
                  onChange={(e) => setInviteAllCompany(e.target.checked)}
                />
                <span>Cả công ty</span>
              </label>

              {!inviteAllCompany && (
                <div style={{ paddingLeft: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Nhân viên:</div>
                  <input
                    type="text"
                    placeholder="Tìm tên nhân viên..."
                    value={empQuery}
                    onChange={(e) => setEmpQuery(e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13, marginBottom: 6 }}
                  />
                  <div style={{ maxHeight: 120, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, paddingRight: 4 }}>
                    {filteredEmployees.map((emp) => (
                      <label key={emp.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={selectedEmpIds.includes(emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedEmpIds([...selectedEmpIds, emp.id]);
                            else setSelectedEmpIds(selectedEmpIds.filter((id) => id !== emp.id));
                          }}
                        />
                        <span>{emp.full_name} ({emp.position_title || emp.email})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* File Attachments */}
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>📎 File đính kèm</div>
          <input type="file" multiple onChange={handleFileUpload} disabled={uploadingFile || loading} style={{ fontSize: 13 }} />
          {uploadingFile && <span style={{ fontSize: 12, color: "var(--muted)" }}> Đang tải file lên...</span>}
          {attachments.length > 0 && (
            <ul style={{ marginTop: 6, fontSize: 12, paddingLeft: 16 }}>
              {attachments.map((att, idx) => (
                <li key={idx}>
                  <a href={att.url} target="_blank" rel="noreferrer" style={{ color: "var(--brand)" }}>
                    {att.name}
                  </a>
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
          <Button variant="primary" type="submit" disabled={loading || !title.trim()}>
            {loading ? "Đang lưu..." : "Lưu lịch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
