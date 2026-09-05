import { useEffect, useMemo, useState } from "react";
import type { Person } from "../../types/people";
import { normalizeRoleLabel } from "../../types/people";
import { PeopleGrid, type ViewMode } from "./PeopleGrid";
import { PendingAccountsPanel } from "./PendingAccountsPanel";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../auth/AuthContext";
import {
  getEmployees,
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  reactToEmployee,
  type EmployeeListItem,
  type PendingEmployee,
  type ReactionType,
} from "../../api/employees";
import { getDepartments, type DepartmentOption } from "../../api/companies";

const PAGE_SIZE = 20;

function toPerson(e: EmployeeListItem): Person {
  return {
    id: e.id,
    name: e.full_name,
    title: e.position_title ?? "—",
    dept: e.primary_department_name || "—",
    role: normalizeRoleLabel(e.role_in_company),
    email: e.email,
    phone: e.phone ?? undefined,
    zalo: e.zalo ?? undefined,
    avatarSrc: e.avatar_url ?? undefined,
    managerId: e.manager_id ?? undefined,
    managerName: e.manager_name ?? undefined,
    managerTitle: e.manager_title ?? undefined,
    directReportsCount: e.direct_reports_count,
    rating: e.rating,
    level: e.level,
    points: e.points,
    likes: e.likes_count,
    dislikes: e.dislikes_count,
    userLiked: e.viewer_reaction === "like",
    userDisliked: e.viewer_reaction === "dislike",
  };
}

export function PeopleView() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [tab, setTab] = useState<"all" | "pending">("all");
  const [query, setQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("0");
  const [selectedRole, setSelectedRole] = useState("0");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [page, setPage] = useState(1);
  const [selectedPersonForMeeting, setSelectedPersonForMeeting] = useState<Person | null>(null);
  const [meetingTopic, setMeetingTopic] = useState("");

  const [pendingLoading, setPendingLoading] = useState(false);
  const [pending, setPending] = useState<PendingEmployee[]>([]);
  const [canManagePending, setCanManagePending] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    setLoading(true);
    Promise.all([getEmployees(companyId), getDepartments(companyId)])
      .then(([emps, depts]) => {
        if (!isMounted) return;
        setPeople(emps.map(toPerson));
        setDepartments(depts);
      })
      .catch(() => showToast("Không tải được danh bạ nhân viên", "danger"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [companyId, showToast]);

  useEffect(() => {
    if (tab !== "pending" || !companyId) return;
    let isMounted = true;
    setPendingLoading(true);
    getPendingEmployees(companyId)
      .then((res) => {
        if (!isMounted) return;
        setPending(res.results);
        setCanManagePending(res.can_manage);
      })
      .catch(() => showToast("Không tải được danh sách chờ duyệt", "danger"))
      .finally(() => {
        if (isMounted) setPendingLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [tab, companyId, showToast]);

  const roles = useMemo(() => {
    const set = new Set<string>();
    for (const p of people) if (p.role) set.add(p.role);
    return Array.from(set).sort();
  }, [people]);

  const filteredPeople = useMemo(() => {
    const search = query.trim().toLowerCase();
    return people.filter((person) => {
      const matchesSearch =
        !search ||
        person.name.toLowerCase().includes(search) ||
        person.title.toLowerCase().includes(search) ||
        (person.email ?? "").toLowerCase().includes(search);
      const matchesDept = selectedDept === "0" || person.dept === selectedDept;
      const matchesRole = selectedRole === "0" || person.role === selectedRole;
      return matchesSearch && matchesDept && matchesRole;
    });
  }, [people, query, selectedDept, selectedRole]);

  useEffect(() => {
    setPage(1);
  }, [query, selectedDept, selectedRole, viewMode]);

  const pageCount = Math.max(1, Math.ceil(filteredPeople.length / PAGE_SIZE));
  const pagedPeople =
    viewMode === "org" ? filteredPeople : filteredPeople.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTopic.trim() || !selectedPersonForMeeting) return;
    showToast(`Đã đặt lịch họp với ${selectedPersonForMeeting.name}: "${meetingTopic}"`, "success");
    setSelectedPersonForMeeting(null);
    setMeetingTopic("");
  };

  function handleReact(person: Person, type: ReactionType) {
    reactToEmployee(person.id, type)
      .then((res) => {
        setPeople((prev) =>
          prev.map((p) =>
            p.id !== person.id
              ? p
              : {
                  ...p,
                  likes: res.likes_count,
                  dislikes: res.dislikes_count,
                  rating: res.rating,
                  level: res.level,
                  points: res.points,
                  userLiked: res.viewer_reaction === "like",
                  userDisliked: res.viewer_reaction === "dislike",
                }
          )
        );
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Không gửi được đánh giá", "danger"));
  }

  function handleApprove(item: PendingEmployee) {
    approveEmployee(item.id)
      .then(() => {
        setPending((prev) => prev.filter((p) => p.id !== item.id));
        showToast(`Đã duyệt tài khoản ${item.full_name}`, "success");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Duyệt tài khoản thất bại", "danger"));
  }

  function handleReject(item: PendingEmployee) {
    rejectEmployee(item.id)
      .then(() => {
        setPending((prev) => prev.filter((p) => p.id !== item.id));
        showToast(`Đã từ chối tài khoản ${item.full_name}`, "success");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Từ chối tài khoản thất bại", "danger"));
  }

  return (
    <div>
      <div className="page-head">
        <h1>Nhân sự</h1>
        <p className="page-sub">
          Danh bạ nhân viên toàn công ty · <b>{people.length}</b> người
        </p>
        <div className="tabs">
          <button type="button" className={`tab ${tab === "all" ? "on" : ""}`} onClick={() => setTab("all")}>
            Danh bạ
          </button>
          <button type="button" className={`tab ${tab === "pending" ? "on" : ""}`} onClick={() => setTab("pending")}>
            Chờ duyệt{pending.length > 0 ? ` (${pending.length})` : ""}
          </button>
        </div>
      </div>

      {tab === "pending" ? (
        pendingLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Đang tải dữ liệu từ máy chủ...</div>
        ) : (
          <PendingAccountsPanel items={pending} canManage={canManagePending} onApprove={handleApprove} onReject={handleReject} />
        )
      ) : (
        <>
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
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="0">Mọi vai trò</option>
              {roles.map((role) => (
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

          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Đang tải dữ liệu từ máy chủ...</div>
          ) : (
            <>
              <PeopleGrid
                people={pagedPeople}
                viewMode={viewMode}
                currentPersonId={employee?.id}
                onBookMeeting={setSelectedPersonForMeeting}
                onReact={handleReact}
              />
              {viewMode !== "org" && pageCount > 1 ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
                  <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                    ‹ Trước
                  </Button>
                  <span>
                    Trang {page}/{pageCount}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>
                    Sau ›
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </>
      )}

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
