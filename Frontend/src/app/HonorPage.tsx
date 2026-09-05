import { useState, useEffect } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { getAvatarProps } from "../utils/avatar";
import { useAuth } from "../auth/AuthContext";
import { getLeaderboard, type LeaderboardEntry, type ScoringPeriod } from "../api/scoring";

function PodiumSpot({
  entry,
  medal,
  size,
  barHeight,
}: {
  entry: LeaderboardEntry | undefined;
  medal: string;
  size: number;
  barHeight: number;
}) {
  const ava = getAvatarProps(entry ?? { full_name: "—" });
  return (
    <div style={{ textAlign: "center", width: 150 }}>
      <div style={{ fontSize: size > 60 ? 34 : 26 }}>{medal}</div>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          margin: "4px auto",
          fontSize: size > 60 ? 24 : 18,
          background: ava.backgroundColor,
          color: "#fff",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid #fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {entry ? ava.initials : "—"}
      </div>
      <div style={{ fontWeight: 700, fontSize: size > 60 ? 16 : 14 }}>{entry?.full_name ?? "Chưa có dữ liệu"}</div>
      <div className="muted" style={{ fontSize: 12 }}>
        {entry?.position_title || ""}
      </div>
      <div
        style={{
          marginTop: 6,
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          color: "#fff",
          borderRadius: "10px 10px 0 0",
          height: barHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxShadow: "0 -2px 8px rgba(245,158,11,0.3)",
        }}
      >
        <div style={{ fontSize: size > 60 ? 24 : 22, fontWeight: 800 }}>{entry?.period_points ?? 0}</div>
        <div style={{ fontSize: 11, opacity: 0.9 }}>điểm hoạt động</div>
      </div>
    </div>
  );
}

export function HonorPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const [period, setPeriod] = useState<ScoringPeriod>("month");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!companyId) return;
    getLeaderboard(companyId, period)
      .then((data) => setEntries([...data].sort((a, b) => b.period_points - a.period_points)))
      .catch(() => setEntries([]));
  }, [companyId, period]);

  // Chỉ vinh danh người thực sự có điểm hoạt động trong kỳ đang xem — khớp
  // hành vi trang mẫu (không xếp hạng người 0 điểm, không độn placeholder giả).
  const active = entries.filter((e) => e.period_points > 0);
  const [top1, top2, top3, ...rest] = active;

  const periodLabel = { today: "Hôm nay", week: "Tuần này", month: "Tháng này", year: "Năm nay", all: "Tất cả" }[period];

  return (
    <AppShellPage initialNavId="honor">
      <div className="page-head">
        <h1>🏆 Bảng vàng nhân viên</h1>
        <p className="page-sub">Vinh danh những nhân viên năng động, đóng góp nhiều nhất — cập nhật theo thời gian thực.</p>
      </div>

      {/* Period Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <Button size="sm" variant={period === "today" ? "primary" : "ghost"} onClick={() => setPeriod("today")}>
          Hôm nay
        </Button>
        <Button size="sm" variant={period === "week" ? "primary" : "ghost"} onClick={() => setPeriod("week")}>
          Tuần này
        </Button>
        <Button size="sm" variant={period === "month" ? "primary" : "ghost"} onClick={() => setPeriod("month")}>
          Tháng này
        </Button>
        <Button size="sm" variant={period === "year" ? "primary" : "ghost"} onClick={() => setPeriod("year")}>
          Năm nay
        </Button>
      </div>

      {/* Top 3 Podium — chỉ hiện ô của người thực sự có điểm, không độn giả */}
      {active.length === 0 ? (
        <p className="muted" style={{ textAlign: "center", padding: 24 }}>
          Chưa có ai hoạt động trong {periodLabel.toLowerCase()}.
        </p>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
          {top2 ? <PodiumSpot entry={top2} medal="🥈" size={54} barHeight={118} /> : null}
          <PodiumSpot entry={top1} medal="🥇" size={68} barHeight={150} />
          {top3 ? <PodiumSpot entry={top3} medal="🥉" size={54} barHeight={100} /> : null}
        </div>
      )}

      {/* Leaderboard Table #4+ — chỉ hiện khi có người xếp sau top 3 */}
      {rest.length > 0 ? (
        <Panel>
          <div className="panel-h">Bảng xếp hạng {periodLabel}</div>
          <div style={{ overflowX: "auto" }}>
            <table className="task-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Nhân viên</th>
                  <th>Phòng ban</th>
                  <th>Điểm hoạt động</th>
                  <th>Cấp bậc</th>
                  <th>Điểm tích luỹ</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((user, index) => {
                  const { initials, backgroundColor } = getAvatarProps(user);
                  return (
                    <tr key={user.id}>
                      <td>
                        <b>{index + 4}</b>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
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
                            }}
                          >
                            {initials}
                          </span>
                          <span>{user.full_name}</span>
                        </div>
                      </td>
                      <td className="muted">{user.department || "Chưa gán"}</td>
                      <td>
                        <b>{user.period_points}</b>
                      </td>
                      <td>Level {user.level}</td>
                      <td className="muted">{user.total_points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}
    </AppShellPage>
  );
}
