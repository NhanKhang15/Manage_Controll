import { useState, useEffect } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { getAvatarProps } from "../utils/avatar";
import { apiFetch } from "../api/client";

export interface LeaderboardUser {
  id: string;
  rank: number;
  full_name: string;
  position_title: string;
  department: string;
  level: number;
  levelTitle: string;
  points: number;
  rating: number;
  isCurrentUser?: boolean;
}

const LEVEL_MATRIX = [
  { level: 1, title: "Thử việc", minPoints: "0 điểm", baseSalary: "8 triệu", allowance: "0", benefits: "Theo HĐ" },
  { level: 2, title: "Chính thức", minPoints: "500 điểm", baseSalary: "12 triệu", allowance: "500k", benefits: "BHXH đầy đủ" },
  { level: 3, title: "Vững vàng", minPoints: "1,000 điểm", baseSalary: "18 triệu", allowance: "1 triệu", benefits: "+ Thưởng quý" },
  { level: 4, title: "Nòng cốt", minPoints: "1,800 điểm", baseSalary: "25 triệu", allowance: "2 triệu", benefits: "+ Du lịch năm" },
  { level: 5, title: "Chuyên gia", minPoints: "2,800 điểm", baseSalary: "35 triệu", allowance: "3 triệu", benefits: "+ ESOP / thưởng cổ phần" },
  { level: 6, title: "Lãnh đạo", minPoints: "4,000 điểm", baseSalary: "50 triệu", allowance: "4 triệu", benefits: "+ Cổ phần & phúc lợi BOD" },
  { level: 7, title: "Bậc 7", minPoints: "5,000+ điểm", baseSalary: "70 triệu", allowance: "5 triệu", benefits: "+ Phúc lợi cấp cao" },
];

export function LeaderboardPage() {
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [departments, setDepartments] = useState<string[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [myRank, setMyRank] = useState(1);
  const [myPoints, setMyPoints] = useState(336);

  useEffect(() => {
    // Fetch real employees and map to leaderboard items
    apiFetch<any[]>("/employees/")
      .then((employees) => {
        if (!Array.isArray(employees)) return;

        const depts = new Set<string>();
        const list: LeaderboardUser[] = employees.map((emp, index) => {
          const dept = emp.primary_department_name || "Chưa gán";
          if (dept !== "Chưa gán") depts.add(dept);

          // Deterministic score calculation based on employee index/id
          const pts = Math.max(50, 350 - index * 25);
          const lvl = pts >= 300 ? 7 : pts >= 250 ? 4 : pts >= 180 ? 3 : pts >= 100 ? 2 : 1;
          const lvlTitle = LEVEL_MATRIX.find((m) => m.level === lvl)?.title || "Chính thức";

          return {
            id: emp.id,
            rank: index + 1,
            full_name: emp.full_name,
            position_title: emp.position_title || "Chuyên viên",
            department: dept,
            level: lvl,
            levelTitle: lvlTitle,
            points: pts,
            rating: Number((4.0 + (index % 10) * 0.1).toFixed(1)),
            isCurrentUser: index === 0,
          };
        });

        setDepartments(Array.from(depts));
        setLeaderboardData(list);

        const current = list.find((u) => u.isCurrentUser);
        if (current) {
          setMyRank(current.rank);
          setMyPoints(current.points);
        }
      })
      .catch(() => {
        setLeaderboardData([]);
      });
  }, []);

  const filteredData = leaderboardData.filter((user) => {
    if (departmentFilter === "all") return true;
    return user.department === departmentFilter;
  });

  return (
    <AppShellPage initialNavId="leaderboard">
      <div className="page-head">
        <h1>🏆 Bảng xếp hạng</h1>
        <p className="page-sub">
          Điểm &amp; cấp bậc toàn công ty. Điểm = việc hoàn thành (theo độ khó) + đúng hạn + thưởng − phạt, theo công thức CEO cấu hình.
        </p>
      </div>

      {/* KPI Header Grid */}
      <div className="kpi-grid dash-kpi" style={{ marginBottom: 14 }}>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
            🥇
          </span>
          <div className="kpi-meta">
            <b>#{myRank}</b>
            <small>Hạng của tôi</small>
          </div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(79, 110, 247, 0.15)", color: "#4F6EF7" }}>
            ⭐
          </span>
          <div className="kpi-meta">
            <b>{myPoints}</b>
            <small>Điểm của tôi · Level 7</small>
          </div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
            👥
          </span>
          <div className="kpi-meta">
            <b>{leaderboardData.length || 79}</b>
            <small>Người tham gia</small>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <form className="filters" style={{ margin: "0 0 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: 13, fontWeight: 500 }}>
          Phòng ban
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ borderRadius: 10, border: "1px solid var(--line)", padding: "6px 12px", fontSize: 14 }}
          >
            <option value="all">Tất cả</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </label>
        <Button variant="ghost" size="sm">
          ⚙️ Cấp bậc &amp; công thức
        </Button>
      </form>

      {/* Panel 1: Leaderboard Table */}
      <Panel>
        <div className="panel-h">Xếp hạng theo điểm</div>
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Hạng</th>
                <th>Nhân viên</th>
                <th>Bộ phận</th>
                <th>Level</th>
                <th>Điểm</th>
                <th>★</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((user) => {
                const { initials, backgroundColor } = getAvatarProps(user);
                const rankBadge = user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `#${user.rank}`;

                return (
                  <tr key={user.id} style={user.isCurrentUser ? { background: "rgba(79, 110, 247, 0.08)" } : undefined}>
                    <td>
                      <b>{rankBadge}</b>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          className="mini-ava"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: backgroundColor,
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {user.full_name}{" "}
                            {user.isCurrentUser && <span className="alert-tag alert-soft" style={{ marginLeft: 4 }}>Bạn</span>}
                          </div>
                          <small className="muted" style={{ display: "block", fontSize: 11.5 }}>
                            {user.position_title}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dept-tag">{user.department}</span>
                    </td>
                    <td>
                      <b>Lv {user.level}</b> <small className="muted">{user.levelTitle}</small>
                    </td>
                    <td>
                      <b>{user.points}</b>
                    </td>
                    <td>{user.rating}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Panel 2: Level & Benefits Matrix */}
      <Panel style={{ marginTop: 18 }}>
        <div className="panel-h">Bảng cấp bậc &amp; định mức phúc lợi</div>
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th>Cấp bậc</th>
                <th>Tên bậc</th>
                <th>Điểm tối thiểu</th>
                <th>Lương cứng</th>
                <th>Phụ cấp</th>
                <th>Phúc lợi bổ sung</th>
              </tr>
            </thead>
            <tbody>
              {LEVEL_MATRIX.map((m) => (
                <tr key={m.level} style={m.level === 7 ? { background: "rgba(16, 185, 129, 0.06)" } : undefined}>
                  <td>
                    <b>Lv {m.level}</b>
                  </td>
                  <td>{m.title}</td>
                  <td>{m.minPoints}</td>
                  <td>
                    <b>{m.baseSalary}</b>
                  </td>
                  <td>{m.allowance}</td>
                  <td className="muted">{m.benefits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="setting-note" style={{ marginTop: 10 }}>
          Lên Level → tự động áp <b>lương cứng + phụ cấp + phúc lợi</b> của bậc mới.
        </p>
      </Panel>
    </AppShellPage>
  );
}
