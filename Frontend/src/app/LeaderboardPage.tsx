import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { getAvatarProps } from "../utils/avatar";
import { useAuth } from "../auth/AuthContext";
import { getLeaderboard, getLevels, type LeaderboardEntry, type LevelTierItem } from "../api/scoring";

export function LeaderboardPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const navigate = useNavigate();

  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [levels, setLevels] = useState<LevelTierItem[]>([]);

  useEffect(() => {
    if (!companyId) return;
    Promise.all([getLeaderboard(companyId, "all"), getLevels(companyId)])
      .then(([lb, lvl]) => {
        setEntries([...lb].sort((a, b) => b.total_points - a.total_points));
        setLevels(lvl);
      })
      .catch(() => {
        setEntries([]);
        setLevels([]);
      });
  }, [companyId]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) if (e.department) set.add(e.department);
    return Array.from(set).sort();
  }, [entries]);

  const filteredData = entries.filter((e) => departmentFilter === "all" || e.department === departmentFilter);

  const myEntry = employee ? entries.find((e) => e.id === employee.id) : undefined;
  const myRank = myEntry ? entries.indexOf(myEntry) + 1 : 0;

  return (
    <AppShellPage initialNavId="leaderboard">
      <div className="page-head">
        <h1>🏆 Bảng xếp hạng</h1>
        <p className="page-sub">
          Điểm &amp; cấp bậc toàn công ty. Điểm = việc hoàn thành (theo độ khó) + đúng hạn, theo công thức CEO cấu hình.
        </p>
      </div>

      {/* KPI Header Grid */}
      <div className="kpi-grid dash-kpi" style={{ marginBottom: 14 }}>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
            🥇
          </span>
          <div className="kpi-meta">
            <b>{myRank ? `#${myRank}` : "—"}</b>
            <small>Hạng của tôi</small>
          </div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(79, 110, 247, 0.15)", color: "#4F6EF7" }}>
            ⭐
          </span>
          <div className="kpi-meta">
            <b>{myEntry?.total_points ?? 0}</b>
            <small>Điểm của tôi · Level {myEntry?.level ?? 1}</small>
          </div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
            👥
          </span>
          <div className="kpi-meta">
            <b>{entries.length}</b>
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
        <Button variant="ghost" size="sm" onClick={() => navigate("/levels")}>
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
                const rank = entries.indexOf(user) + 1;
                const rankBadge = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
                const isCurrentUser = employee?.id === user.id;

                return (
                  <tr key={user.id} style={isCurrentUser ? { background: "rgba(79, 110, 247, 0.08)" } : undefined}>
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
                            {user.full_name} {isCurrentUser && <span className="alert-tag alert-soft" style={{ marginLeft: 4 }}>Bạn</span>}
                          </div>
                          <small className="muted" style={{ display: "block", fontSize: 11.5 }}>
                            {user.position_title || "Chuyên viên"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dept-tag">{user.department || "Chưa gán"}</span>
                    </td>
                    <td>
                      <b>Lv {user.level}</b> <small className="muted">{user.level_title}</small>
                    </td>
                    <td>
                      <b>{user.total_points}</b>
                    </td>
                    <td>{user.rating.toFixed(1)}</td>
                  </tr>
                );
              })}
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: "center", padding: 16 }}>
                    Chưa có dữ liệu.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Panel 2: Level & Benefits Matrix */}
      <Panel style={{ marginTop: 18 }}>
        <div className="panel-h">Thang cấp bậc &amp; phúc lợi</div>
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Tên bậc</th>
                <th>Mốc điểm</th>
                <th>Lương cứng/tháng</th>
                <th>Phụ cấp</th>
                <th>Phúc lợi</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((m) => (
                <tr key={m.id} style={m.level === levels.length ? { background: "rgba(16, 185, 129, 0.06)" } : undefined}>
                  <td>
                    <b>Lv {m.level}</b>
                  </td>
                  <td>{m.name}</td>
                  <td>{m.min_points.toLocaleString("vi-VN")} điểm</td>
                  <td>
                    <b>{(m.base_salary / 1_000_000).toLocaleString("vi-VN")} triệu</b>
                  </td>
                  <td>{m.allowance ? `${(m.allowance / 1_000).toLocaleString("vi-VN")}k` : "0"}</td>
                  <td className="muted">{m.benefits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="setting-note" style={{ marginTop: 10 }}>
          Lên Level → tự động áp <b>lương cứng + phụ cấp + phúc lợi</b> của bậc mới (theo quy định CEO đặt trong{" "}
          <a href="/levels" onClick={(e) => { e.preventDefault(); navigate("/levels"); }}>
            Cấp bậc &amp; công thức
          </a>
          ).
        </p>
      </Panel>
    </AppShellPage>
  );
}
