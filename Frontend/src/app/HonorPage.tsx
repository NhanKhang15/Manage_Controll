import { useState, useEffect } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { getAvatarProps } from "../utils/avatar";
import { apiFetch } from "../api/client";

export interface HonorUser {
  id: string;
  rank: number;
  full_name: string;
  position_title: string;
  department: string;
  activityPoints: number;
  level: number;
  accumulatedPoints: number;
}

export function HonorPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">("month");
  const [honorUsers, setHonorUsers] = useState<HonorUser[]>([]);

  useEffect(() => {
    apiFetch<any[]>("/employees/")
      .then((data) => {
        if (!Array.isArray(data)) return;
        const list: HonorUser[] = data.map((emp, index) => ({
          id: emp.id,
          rank: index + 1,
          full_name: emp.full_name,
          position_title: emp.position_title || "Chuyên viên",
          department: emp.primary_department_name || "Ban Giám đốc",
          activityPoints: Math.max(1, 80 - index * 12),
          level: Math.max(1, 7 - index),
          accumulatedPoints: Math.max(0, 336 - index * 50),
        }));
        setHonorUsers(list);
      })
      .catch(() => setHonorUsers([]));
  }, [period]);

  const top1 = honorUsers[0] || { full_name: "Lê Xuân Huy", position_title: "Giám đốc", activityPoints: 74 };
  const top2 = honorUsers[1] || { full_name: "Joseph Tuấn", position_title: "CPO", activityPoints: 8 };
  const top3 = honorUsers[2] || { full_name: "Nguyễn Thu Lan", position_title: "Trưởng nhóm Tech", activityPoints: 7 };

  const top1Ava = getAvatarProps(top1);
  const top2Ava = getAvatarProps(top2);
  const top3Ava = getAvatarProps(top3);

  const remainingUsers = honorUsers.slice(3);

  return (
    <AppShellPage initialNavId="honor">
      <div className="page-head">
        <h1>🏆 Bảng vàng nhân viên</h1>
        <p className="page-sub">
          Vinh danh những nhân viên năng động, đóng góp nhiều nhất — cập nhật theo thời gian thực.
        </p>
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

      {/* Top 3 Podium */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 22,
        }}
      >
        {/* #2 Left */}
        <div style={{ textAlign: "center", width: 150 }}>
          <div style={{ fontSize: 26 }}>🥈</div>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              margin: "4px auto",
              fontSize: 18,
              background: top2Ava.backgroundColor,
              color: "#fff",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {top2Ava.initials}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{top2.full_name}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {top2.position_title}
          </div>
          <div
            style={{
              marginTop: 6,
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "#fff",
              borderRadius: "10px 10px 0 0",
              height: 118,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: "0 -2px 8px rgba(245,158,11,0.3)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800 }}>{top2.activityPoints}</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>điểm hoạt động</div>
          </div>
        </div>

        {/* #1 Center (Tallest) */}
        <div style={{ textAlign: "center", width: 150 }}>
          <div style={{ fontSize: 34 }}>🥇</div>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              margin: "4px auto",
              fontSize: 24,
              background: top1Ava.backgroundColor,
              color: "#fff",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            }}
          >
            {top1Ava.initials}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{top1.full_name}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {top1.position_title}
          </div>
          <div
            style={{
              marginTop: 6,
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "#fff",
              borderRadius: "10px 10px 0 0",
              height: 150,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: "0 -2px 8px rgba(245,158,11,0.3)",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800 }}>{top1.activityPoints}</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>điểm hoạt động</div>
          </div>
        </div>

        {/* #3 Right */}
        <div style={{ textAlign: "center", width: 150 }}>
          <div style={{ fontSize: 26 }}>🥉</div>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              margin: "4px auto",
              fontSize: 18,
              background: top3Ava.backgroundColor,
              color: "#fff",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {top3Ava.initials}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{top3.full_name}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {top3.position_title}
          </div>
          <div
            style={{
              marginTop: 6,
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "#fff",
              borderRadius: "10px 10px 0 0",
              height: 100,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: "0 -2px 8px rgba(245,158,11,0.3)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800 }}>{top3.activityPoints}</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>điểm hoạt động</div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table #4+ */}
      <Panel>
        <div className="panel-h">
          Bảng xếp hạng {period === "today" ? "Hôm nay" : period === "week" ? "Tuần này" : period === "month" ? "Tháng này" : "Năm nay"}
        </div>
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
              {remainingUsers.map((user) => {
                const { initials, backgroundColor } = getAvatarProps(user);
                return (
                  <tr key={user.id}>
                    <td>
                      <b>{user.rank}</b>
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
                    <td className="muted">{user.department}</td>
                    <td>
                      <b>{user.activityPoints}</b>
                    </td>
                    <td>Level {user.level}</td>
                    <td className="muted">{user.accumulatedPoints}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShellPage>
  );
}
