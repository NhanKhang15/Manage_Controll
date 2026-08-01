import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";

export function StatisticsPage() {
  const depts = [
    { name: "Công nghệ", count: 12 },
    { name: "Kinh doanh", count: 11 },
    { name: "Marketing", count: 11 },
    { name: "Sales", count: 10 },
    { name: "Nhân sự", count: 10 },
    { name: "Vận hành", count: 9 },
    { name: "Sản phẩm", count: 9 },
    { name: "Ban Giám đốc", count: 3 },
    { name: "Kế toán", count: 2 },
  ];

  const topContribs = [
    { rank: "#1", name: "Lê Xuân Huy", title: "Giám đốc", points: "336 điểm · ★ 4.6" },
    { rank: "#2", name: "Nguyễn Thu Lan", title: "Trưởng nhóm Tech", points: "120 điểm · ★ 4.5" },
    { rank: "#3", name: "Mai Trang", title: "Nhân viên Sales", points: "80 điểm · ★ 4.2" },
    { rank: "#4", name: "Đặng Quốc Huy", title: "Kỹ sư", points: "9 điểm · ★ 4.3" },
    { rank: "#5", name: "Trần Hữu Thành", title: "Chủ tịch HĐQT", points: "0 điểm · ★ 4.8" },
  ];

  return (
    <AppShellPage initialNavId="statistics">
      <div className="page-head">
        <h1>Thống kê</h1>
        <p className="page-sub">Bức tranh tổng quan toàn tổ chức.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(79,110,247,0.12)", color: "#4F6EF7" }}>👥</span>
          <div className="kpi-meta"><b>79</b><small>Nhân sự</small></div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>🏢</span>
          <div className="kpi-meta"><b>9</b><small>Phòng ban</small></div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>📂</span>
          <div className="kpi-meta"><b>2</b><small>Dự án</small></div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>✅</span>
          <div className="kpi-meta"><b>8/21</b><small>Việc hoàn thành</small></div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>⏰</span>
          <div className="kpi-meta"><b>6</b><small>Việc trễ hạn</small></div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>✋</span>
          <div className="kpi-meta"><b>3</b><small>Chờ duyệt</small></div>
        </div>
      </div>

      {/* Progress & Dept Distribution Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
        <Panel>
          <div className="panel-h">Tiến độ công việc</div>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 110, height: 110, borderRadius: "50%", border: "10px solid var(--brand)", margin: "0 auto", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 26, color: "var(--brand)" }}>
              38%
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 16, fontSize: 13 }}>
              <span>🟢 Xong (8)</span>
              <span>🔵 Đang làm (4)</span>
              <span>🔴 Trễ hạn (6)</span>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="panel-h">Nhân sự theo phòng ban</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {depts.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 100, flexShrink: 0 }}>{d.name}</span>
                <div style={{ flex: 1, height: 8, background: "var(--line)", borderRadius: 99 }}>
                  <div style={{ width: `${(d.count / 15) * 100}%`, height: "100%", background: "var(--brand)", borderRadius: 99 }} />
                </div>
                <b style={{ width: 24, textAlign: "right" }}>{d.count}</b>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Contribution Honor Board */}
      <Panel>
        <div className="panel-h">🏆 Bảng vàng đóng góp</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topContribs.map((item) => (
            <div key={item.rank} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <b style={{ color: "var(--brand)", fontSize: 15 }}>{item.rank}</b>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                  <small className="muted">{item.title}</small>
                </div>
              </div>
              <b>{item.points}</b>
            </div>
          ))}
        </div>
      </Panel>
    </AppShellPage>
  );
}
