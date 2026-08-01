import { useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function PayrollPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"my" | "approve" | "finance">("my");

  return (
    <AppShellPage initialNavId="payroll">
      <div className="page-head">
        <h1>💰 Lương &amp; Tài chính</h1>
        <p className="page-sub">Duyệt bảng lương do kế toán đề xuất &amp; xem báo cáo chi phí / doanh thu.</p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ display: "flex", gap: 6, marginBottom: 18, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
        <button
          className={`tab ${activeTab === "my" ? "on" : ""}`}
          onClick={() => setActiveTab("my")}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: "none",
            background: activeTab === "my" ? "var(--brand-soft)" : "transparent",
            color: activeTab === "my" ? "var(--brand)" : "var(--muted)",
            fontWeight: activeTab === "my" ? 700 : 500,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Phiếu lương của tôi
        </button>
        <button
          className={`tab ${activeTab === "approve" ? "on" : ""}`}
          onClick={() => setActiveTab("approve")}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: "none",
            background: activeTab === "approve" ? "var(--brand-soft)" : "transparent",
            color: activeTab === "approve" ? "var(--brand)" : "var(--muted)",
            fontWeight: activeTab === "approve" ? 700 : 500,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ✅ Duyệt lương
        </button>
        <button
          className={`tab ${activeTab === "finance" ? "on" : ""}`}
          onClick={() => setActiveTab("finance")}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: "none",
            background: activeTab === "finance" ? "var(--brand-soft)" : "transparent",
            color: activeTab === "finance" ? "var(--brand)" : "var(--muted)",
            fontWeight: activeTab === "finance" ? 700 : 500,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          📊 Báo cáo tài chính
        </button>
      </div>

      {/* Tab 1: Phiếu lương của tôi */}
      {activeTab === "my" && (
        <>
          <Panel className="payslip">
            <div className="panel-h">Phiếu lương mới nhất — Tháng 06/2026</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                marginTop: 12,
              }}
            >
              <div style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)" }}>
                <span className="muted" style={{ fontSize: 12, display: "block" }}>Lương cơ bản</span>
                <b style={{ fontSize: 16 }}>40 triệu</b>
              </div>
              <div style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)" }}>
                <span className="muted" style={{ fontSize: 12, display: "block" }}>Phụ cấp</span>
                <b style={{ fontSize: 16 }}>3 triệu</b>
              </div>
              <div style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)" }}>
                <span className="muted" style={{ fontSize: 12, display: "block" }}>Thưởng</span>
                <b style={{ fontSize: 16, color: "var(--ok)" }}>+0</b>
              </div>
              <div style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)" }}>
                <span className="muted" style={{ fontSize: 12, display: "block" }}>Tổng thu nhập (gross)</span>
                <b style={{ fontSize: 16 }}>43 triệu</b>
              </div>
              <div style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)" }}>
                <span className="muted" style={{ fontSize: 12, display: "block" }}>Bảo hiểm</span>
                <b style={{ fontSize: 16, color: "var(--danger)" }}>−0</b>
              </div>
              <div style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)" }}>
                <span className="muted" style={{ fontSize: 12, display: "block" }}>Thuế TNCN</span>
                <b style={{ fontSize: 16, color: "var(--danger)" }}>−0</b>
              </div>
              <div style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)" }}>
                <span className="muted" style={{ fontSize: 12, display: "block" }}>Khấu trừ khác</span>
                <b style={{ fontSize: 16, color: "var(--danger)" }}>−0</b>
              </div>
              <div style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)" }}>
                <span className="muted" style={{ fontSize: 12, display: "block" }}>Ngày công</span>
                <b style={{ fontSize: 16 }}>22</b>
              </div>
              <div style={{ padding: "10px 14px", border: "2px solid var(--brand)", borderRadius: 10, background: "var(--brand-soft)", gridColumn: "1 / -1" }}>
                <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600, display: "block" }}>Thực nhận</span>
                <b style={{ fontSize: 22, color: "var(--brand)" }}>43 triệu</b>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="panel-h">Lịch sử phiếu lương của tôi</div>
            <div className="table-wrap">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Kỳ lương</th>
                    <th>Cơ bản</th>
                    <th>Thưởng</th>
                    <th>Bảo hiểm</th>
                    <th>Thuế</th>
                    <th>Thực nhận</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tháng 06/2026</td>
                    <td>40 triệu</td>
                    <td style={{ color: "var(--ok)" }}>0</td>
                    <td style={{ color: "var(--danger)" }}>0</td>
                    <td style={{ color: "var(--danger)" }}>0</td>
                    <td>
                      <b>43 triệu</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Tháng 05/2026</td>
                    <td>40 triệu</td>
                    <td style={{ color: "var(--ok)" }}>+2 triệu</td>
                    <td style={{ color: "var(--danger)" }}>0</td>
                    <td style={{ color: "var(--danger)" }}>0</td>
                    <td>
                      <b>45 triệu</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

      {/* Tab 2: Duyệt lương */}
      {activeTab === "approve" && (
        <Panel>
          <div className="panel-h">Bảng lương chờ duyệt — Tháng 06/2026</div>
          <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
            Danh sách đề xuất bảng lương từ bộ phận Kế toán. CEO hoặc Trưởng phòng cần kiểm tra và phê duyệt.
          </p>
          <div className="table-wrap">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Phòng ban</th>
                  <th>Lương cơ bản</th>
                  <th>Thưởng</th>
                  <th>Thực nhận</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <b>Lê Xuân Huy</b>
                  </td>
                  <td>Ban Giám đốc</td>
                  <td>40 triệu</td>
                  <td>+3 triệu</td>
                  <td>
                    <b>43 triệu</b>
                  </td>
                  <td>
                    <Button size="sm" variant="approve" onClick={() => showToast("Đã duyệt lương Lê Xuân Huy", "success")}>
                      Duyệt
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Joseph Tuấn</b>
                  </td>
                  <td>Sản phẩm</td>
                  <td>25 triệu</td>
                  <td>+1 triệu</td>
                  <td>
                    <b>26 triệu</b>
                  </td>
                  <td>
                    <Button size="sm" variant="approve" onClick={() => showToast("Đã duyệt lương Joseph Tuấn", "success")}>
                      Duyệt
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Tab 3: Báo cáo tài chính */}
      {activeTab === "finance" && (
        <Panel>
          <div className="panel-h">📊 Báo cáo tài chính &amp; Chi phí quỹ lương</div>
          <div className="kpi-grid dash-kpi" style={{ marginTop: 12, marginBottom: 16 }}>
            <div className="kpi">
              <span className="kpi-ico" style={{ background: "rgba(79, 110, 247, 0.15)", color: "#4F6EF7" }}>
                💵
              </span>
              <div className="kpi-meta">
                <b>69 triệu</b>
                <small>Tổng quỹ lương tháng 06</small>
              </div>
            </div>
            <div className="kpi">
              <span className="kpi-ico" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                📈
              </span>
              <div className="kpi-meta">
                <b>+12.5%</b>
                <small>Tăng trưởng so với tháng trước</small>
              </div>
            </div>
          </div>
          <p className="setting-note">
            Báo cáo ngân sách tài chính tự động tính toán dựa trên dữ liệu hợp đồng lao động và bảng chấm công thực tế.
          </p>
        </Panel>
      )}
    </AppShellPage>
  );
}
