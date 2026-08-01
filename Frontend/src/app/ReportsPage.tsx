import { useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function ReportsPage() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");

  return (
    <AppShellPage initialNavId="reports">
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Báo cáo công việc</h1>
          <p className="page-sub">Người lập: Lê Xuân Huy · Thứ Bảy, 01/08/2026 · Kỳ: Tuần này</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="ghost" onClick={() => showToast("Tải file Word (.docx)", "default")}>
            📘 Tải file Word
          </Button>
          <Button size="sm" variant="ghost" onClick={() => showToast("In / Xuất PDF", "default")}>
            🖨️ In / PDF
          </Button>
        </div>
      </div>

      {/* Period Filter & Send Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant={period === "today" ? "primary" : "ghost"} onClick={() => setPeriod("today")}>
            Hôm nay
          </Button>
          <Button size="sm" variant={period === "week" ? "primary" : "ghost"} onClick={() => setPeriod("week")}>
            Tuần này
          </Button>
          <Button size="sm" variant={period === "month" ? "primary" : "ghost"} onClick={() => setPeriod("month")}>
            Tháng này
          </Button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="primary" onClick={() => showToast("Đã gửi báo cáo cho Sếp trong hệ thống", "success")}>
            📢 Gửi Sếp trong hệ thống
          </Button>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>✅</span>
          <div className="kpi-meta"><b>8/21</b><small>Hoàn thành</small></div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(79,110,247,0.12)", color: "#4F6EF7" }}>🔧</span>
          <div className="kpi-meta"><b>4</b><small>Đang làm</small></div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>⏰</span>
          <div className="kpi-meta"><b>6</b><small>Trễ hạn</small></div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>📁</span>
          <div className="kpi-meta"><b>2</b><small>Dự án</small></div>
        </div>
      </div>

      {/* Overdue Tasks Panel */}
      <Panel style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
        <div className="panel-h" style={{ color: "var(--danger)" }}>⚠️ Công việc trễ hạn (6)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { name: "Tập huấn đội Sales", proj: "Tuyển dụng & Onboarding", date: "06-07" },
            { name: "Soạn tài liệu hướng dẫn", proj: "Tuyển dụng & Onboarding", date: "09-07" },
            { name: "Đồng bộ sàn TMĐT (Shopee/Lazada)", proj: "Số hóa quy trình bán hàng", date: "10-07" },
            { name: "Thu thập & nhập liệu KH", proj: "Số hóa quy trình bán hàng", date: "11-07" },
          ].map((t) => (
            <div key={t.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "6px 0", borderBottom: "1px solid var(--line-2)" }}>
              <span><b>• {t.name}</b> <small className="muted">({t.proj})</small></span>
              <span className="alert-tag" style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 11 }}>{t.date}</span>
            </div>
          ))}
        </div>
      </Panel>
    </AppShellPage>
  );
}
