import { useMemo, useState } from "react";
import type { Person } from "../../types/people";
import { PeopleGrid, type ViewMode } from "./PeopleGrid";
import { PEOPLE_TOTAL, mockPeople } from "../../mocks/people";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

const DEPARTMENTS = ["Ban Giám đốc", "Công nghệ", "Kinh doanh", "Kế toán", "Marketing", "Nhân sự", "Sản phẩm"];
const ROLES = ["Ban lãnh đạo", "Trưởng phòng / nhóm", "Giám đốc Tài chính (CFO)", "Nhân viên"];

export function PeopleView() {
  const [people] = useState<Person[]>(mockPeople);
  const [tab, setTab] = useState<"all" | "pending">("all");
  const [query, setQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("0");
  const [selectedRole, setSelectedRole] = useState("0");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [selectedPersonForMeeting, setSelectedPersonForMeeting] = useState<Person | null>(null);
  const [meetingTopic, setMeetingTopic] = useState("");
  const { showToast } = useToast();

  const filteredPeople = useMemo(() => {
    const search = query.trim().toLowerCase();
    return people.filter((person) => {
      const matchesSearch =
        !search ||
        person.name.toLowerCase().includes(search) ||
        person.title.toLowerCase().includes(search) ||
        person.email.toLowerCase().includes(search);
      const matchesDept = selectedDept === "0" || person.dept === selectedDept;
      const matchesRole = selectedRole === "0" || person.role === selectedRole;
      return matchesSearch && matchesDept && matchesRole;
    });
  }, [people, query, selectedDept, selectedRole]);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTopic.trim() || !selectedPersonForMeeting) return;
    showToast(`Đã đặt lịch họp với ${selectedPersonForMeeting.name}: "${meetingTopic}"`, "success");
    setSelectedPersonForMeeting(null);
    setMeetingTopic("");
  };

  return (
    <div>
      <div className="page-head">
        <h1>Nhân sự</h1>
        <p className="page-sub">
          Danh bạ nhân viên toàn công ty · <b>{PEOPLE_TOTAL}</b> người
        </p>
        <div className="tabs">
          <button type="button" className={`tab ${tab === "all" ? "on" : ""}`} onClick={() => setTab("all")}>
            Danh bạ
          </button>
          <button type="button" className={`tab ${tab === "pending" ? "on" : ""}`} onClick={() => setTab("pending")}>
            Chờ duyệt
          </button>
        </div>
      </div>

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <input
          className="filter-search"
          type="text"
          placeholder="Tìm tên nhân viên..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
          <option value="0">Mọi phòng ban</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="0">Mọi vai trò</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <Button variant="ghost" size="sm">
          Lọc
        </Button>
        <div className="view-switch" aria-label="Đổi kiểu xem">
          <button type="button" className={`vs ${viewMode === "card" ? "on" : ""}`} onClick={() => setViewMode("card")} title="Thẻ">
            ▦
          </button>
          <button type="button" className={`vs ${viewMode === "list" ? "on" : ""}`} onClick={() => setViewMode("list")} title="Danh sách">
            ☰
          </button>
          <button type="button" className={`vs ${viewMode === "org" ? "on" : ""}`} onClick={() => setViewMode("org")} title="Sơ đồ tổ chức">
            🏢
          </button>
        </div>
      </form>

      <PeopleGrid people={filteredPeople} viewMode={viewMode} onBookMeeting={setSelectedPersonForMeeting} />

      {selectedPersonForMeeting ? (
        <Modal isOpen title={`Đặt lịch họp với ${selectedPersonForMeeting.name}`} onClose={() => setSelectedPersonForMeeting(null)}>
          <form className="book-form" onSubmit={handleBookSubmit}>
            <label>
              Chủ đề cuộc họp
              <textarea
                rows={4}
                placeholder="VD: Thảo luận kế hoạch dự án..."
                value={meetingTopic}
                onChange={(e) => setMeetingTopic(e.target.value)}
                required
              />
            </label>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setSelectedPersonForMeeting(null)}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Xác nhận đặt lịch
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
