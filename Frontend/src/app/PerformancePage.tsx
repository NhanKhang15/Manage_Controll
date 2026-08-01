import { useState, useEffect } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { getAvatarProps } from "../utils/avatar";
import { apiFetch } from "../api/client";

export interface PerfUser {
  id: string;
  full_name: string;
  position_title: string;
  department: string;
  score: number;
  status: "Tốt" | "Khá" | "Cần cải thiện" | "Thấp";
  resultScore: number;
  onTimeScore: number;
  qualityScore: number;
  proactiveScore: number;
  valueContribScore: number;
  cost: string;
}

export function PerformancePage() {
  const [period, setPeriod] = useState("2026-07");
  const [teamMembers, setTeamMembers] = useState<PerfUser[]>([]);

  useEffect(() => {
    apiFetch<any[]>("/employees/")
      .then((data) => {
        if (!Array.isArray(data)) return;
        const list: PerfUser[] = data.map((emp, index) => {
          const score = Math.max(20, 85 - index * 6);
          const status = score >= 80 ? "Tốt" : score >= 65 ? "Khá" : score >= 40 ? "Cần cải thiện" : "Thấp";
          return {
            id: emp.id,
            full_name: emp.full_name,
            position_title: emp.position_title || "Chuyên viên",
            department: emp.primary_department_name || "Chung",
            score,
            status,
            resultScore: Math.max(0, 90 - index * 7),
            onTimeScore: Math.max(10, 85 - index * 5),
            qualityScore: Math.max(30, 95 - index * 4),
            proactiveScore: Math.max(20, 88 - index * 6),
            valueContribScore: index === 0 ? 30 : 0,
            cost: `${12 + (index % 5) * 6} triệu`,
          };
        });
        setTeamMembers(list);
      })
      .catch(() => setTeamMembers([]));
  }, [period]);

  return (
    <AppShellPage initialNavId="performance">
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Hiệu suất</h1>
          <p className="page-sub">Đánh giá 5 chiều &amp; chỉ số đóng góp hiệu quả công việc</p>
        </div>
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          Kỳ:
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
          />
        </label>
      </div>

      {/* Personal Performance Overview Panel */}
      <Panel className="perf-self">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {/* Gauge & Main Info */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                border: "8px solid var(--brand)",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 24,
                color: "var(--brand)",
                flexShrink: 0,
              }}
            >
              85
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                Lê Xuân Huy <span className="alert-tag alert-soft" style={{ marginLeft: 6 }}>Tốt</span>
              </div>
              <div className="muted" style={{ fontSize: 12, margin: "4px 0" }}>
                Nhóm nghề: <b>Ban Giám đốc</b> · Kỳ {period}
              </div>
              <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 2 }}>
                <span>✅ 12 việc xong (150 điểm nỗ lực)</span>
                <span>⏱ Đúng hạn 12/12 (100%)</span>
              </div>
            </div>
          </div>

          {/* 5-Dimensional Progress Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Kết quả", val: 90, weight: "30%" },
              { label: "Đúng hạn", val: 100, weight: "15%" },
              { label: "Chất lượng", val: 92, weight: "20%" },
              { label: "Chủ động", val: 88, weight: "15%" },
              { label: "Đóng góp giá trị", val: 75, weight: "20%" },
            ].map((dim) => (
              <div key={dim.label} style={{ fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span>
                    {dim.label} <small className="muted">· {dim.weight}</small>
                  </span>
                  <b>{dim.val}</b>
                </div>
                <div style={{ height: 6, width: "100%", background: "var(--line)", borderRadius: 99 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${dim.val}%`,
                      background: "var(--brand)",
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Levers & Contributions Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 16 }}>
        <Panel>
          <div className="panel-h">🎯 2 đòn bẩy cải thiện lớn nhất</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                <b>Kết quả</b> <span className="muted">(90/100)</span>{" "}
                <span style={{ color: "var(--ok)", float: "right" }}>+10 điểm tiềm năng</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Hoàn thành thêm việc khó (đánh dấu độ khó Lớn/Rất lớn) trong kỳ.
              </div>
            </div>
            <div style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                <b>Đóng góp giá trị</b> <span className="muted">(75/100)</span>{" "}
                <span style={{ color: "var(--ok)", float: "right" }}>+25 điểm tiềm năng</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Tham gia dự án tạo doanh thu, đóng góp phần việc trọng yếu.
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="panel-h">💰 Đóng góp giá trị (chi phí / doanh thu)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, textAlign: "center", marginBottom: 12 }}>
            <div style={{ padding: 10, background: "var(--bg)", borderRadius: 8 }}>
              <span className="muted" style={{ fontSize: 11, display: "block" }}>Doanh thu quy đổi</span>
              <b style={{ fontSize: 15 }}>120 triệu</b>
            </div>
            <div style={{ padding: 10, background: "var(--bg)", borderRadius: 8 }}>
              <span className="muted" style={{ fontSize: 11, display: "block" }}>Chi phí (lương/kỳ)</span>
              <b style={{ fontSize: 15 }}>43 triệu</b>
            </div>
            <div style={{ padding: 10, background: "var(--bg)", borderRadius: 8 }}>
              <span className="muted" style={{ fontSize: 11, display: "block" }}>Chỉ số đóng góp</span>
              <b style={{ fontSize: 15, color: "var(--ok)" }}>2.8×</b>
            </div>
          </div>
          <p className="muted" style={{ fontSize: 12 }}>
            Doanh thu quy đổi dựa trên phần việc bạn đóng góp vào dự án có doanh thu.
          </p>
        </Panel>
      </div>

      {/* Team Performance Table */}
      <Panel style={{ marginTop: 16 }}>
        <div className="panel-h">👥 Hiệu suất toàn nhóm ({teamMembers.length} người) · Kỳ {period}</div>
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Phòng ban</th>
                <th>Điểm</th>
                <th>Kết quả</th>
                <th>Đúng hạn</th>
                <th>Chất lượng</th>
                <th>Chủ động</th>
                <th>Đóng góp GT</th>
                <th>Chi phí</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m) => {
                const { initials, backgroundColor } = getAvatarProps(m);
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: backgroundColor,
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {initials}
                        </span>
                        <b>{m.full_name}</b>
                      </div>
                    </td>
                    <td className="muted">{m.department}</td>
                    <td>
                      <b>{m.score}</b>{" "}
                      <span
                        className="alert-tag"
                        style={{
                          background: m.status === "Tốt" ? "#BBF7D0" : m.status === "Khá" ? "#BFDBFE" : "#FEE2E2",
                          color: m.status === "Tốt" ? "#166534" : m.status === "Khá" ? "#1E40AF" : "#991B1B",
                          fontSize: 11,
                        }}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td>{m.resultScore}</td>
                    <td>{m.onTimeScore}</td>
                    <td>{m.qualityScore}</td>
                    <td>{m.proactiveScore}</td>
                    <td>{m.valueContribScore}</td>
                    <td className="muted">{m.cost}</td>
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
