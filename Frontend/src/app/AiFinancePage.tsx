import { useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function AiFinancePage() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState("2026-07");
  const [pastedData, setPastedData] = useState("");
  const [question, setQuestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState("");

  function handleAiAnalyze(e: FormEvent) {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      setAiAnalysisResult(
        `📊 BÁO CÁO PHÂN TÍCH TÀI CHÍNH AI (KỲ ${period}):\n` +
          `• Tổng thu: 50.000.000 VNĐ\n` +
          `• Tổng chi: 120.000.000 VNĐ\n` +
          `• Dòng tiền thuần: -70.000.000 VNĐ\n\n` +
          `💡 KHUYẾN NGHỊ CỦA AI:\n` +
          `1. Quỹ lương chiếm tỷ trọng lớn trong tổng chi. Cần tối ưu chi phí dự án ngắn hạn.\n` +
          `2. Tăng cường thu hồi công nợ KH A trong tuần tới để cân bằng dòng tiền âm.\n` +
          `3. Đánh giá lại ngân sách chi tiêu phòng ban.`
      );
      setIsAnalyzing(false);
      showToast("AI đã hoàn tất phân tích tài chính", "success");
    }, 900);
  }

  return (
    <AppShellPage initialNavId="ai-finance">
      <div className="page-head">
        <h1>💵 Tài chính AI</h1>
        <p className="page-sub">Import dữ liệu kế toán → AI tư vấn dòng tiền, thu chi. Kèm báo cáo thu–chi từ hệ thống.</p>
      </div>

      {/* Filter bar */}
      <form onSubmit={(e) => { e.preventDefault(); showToast(`Tải báo cáo kỳ ${period}`, "default"); }} className="filters" style={{ margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: 13 }}>
          Kỳ báo cáo
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "6px 12px", fontSize: 13 }}
          />
        </label>
        <Button variant="ghost" size="sm" type="submit">
          Xem
        </Button>
      </form>

      {/* System Report Panel */}
      <Panel>
        <div className="panel-h">📊 Báo cáo thu – chi hệ thống — Tháng 07/2026</div>
        <div className="kpi-grid dash-kpi" style={{ marginBottom: 14 }}>
          <div className="kpi">
            <span className="kpi-ico" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>📈</span>
            <div className="kpi-meta">
              <b>0</b>
              <small>Doanh thu</small>
            </div>
          </div>
          <div className="kpi">
            <span className="kpi-ico" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>📉</span>
            <div className="kpi-meta">
              <b>0</b>
              <small>Tổng chi phí</small>
            </div>
          </div>
          <div className="kpi">
            <span className="kpi-ico" style={{ background: "rgba(79,110,247,0.12)", color: "#4F6EF7" }}>💰</span>
            <div className="kpi-meta">
              <b style={{ color: "var(--ok)" }}>0</b>
              <small>Lợi nhuận</small>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="task-table">
            <tbody>
              <tr>
                <td>Quỹ lương (đã duyệt)</td>
                <td style={{ textAlign: "right", color: "var(--danger)" }}>0</td>
              </tr>
              <tr>
                <td>Chi phí khác (finance_entries)</td>
                <td style={{ textAlign: "right", color: "var(--danger)" }}>0</td>
              </tr>
              <tr>
                <td>Đề xuất mua sắm/tạm ứng đã duyệt</td>
                <td style={{ textAlign: "right", color: "var(--danger)" }}>0</td>
              </tr>
              <tr style={{ background: "var(--bg)", fontWeight: 700 }}>
                <td>TỔNG CHI</td>
                <td style={{ textAlign: "right" }}>0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      {/* AI Advisory Panel */}
      <Panel>
        <div className="panel-h">📥 Import dữ liệu kế toán → AI tư vấn</div>
        <p className="setting-note" style={{ marginBottom: 12 }}>
          Xuất từ phần mềm kế toán (MISA, Fast, Excel…) ra <b>file CSV (UTF-8)</b> rồi tải lên, hoặc dán bảng số liệu. AI sẽ phân tích <b>dòng tiền, thu–chi</b> và đưa khuyến nghị.
        </p>

        <form onSubmit={handleAiAnalyze} className="settings-form" style={{ maxWidth: 720 }}>
          <label>
            Tải file CSV (sổ quỹ / thu chi / công nợ…)
            <input type="file" accept=".csv,.txt" />
          </label>

          <label>
            Hoặc dán dữ liệu (mỗi dòng 1 giao dịch, ngăn cách bằng dấu phẩy)
            <textarea
              rows={5}
              placeholder={`Ngày,Diễn giải,Thu,Chi\n01/07,Thu tiền KH A,50000000,\n03/07,Trả lương,,120000000`}
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
            />
          </label>

          <label>
            Câu hỏi / yêu cầu cho AI (tuỳ chọn)
            <input
              type="text"
              placeholder="VD: Dòng tiền tháng này có rủi ro gì? Nên cắt giảm khoản nào?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>

          <Button variant="primary" type="submit" disabled={isAnalyzing} style={{ alignSelf: "flex-start", marginTop: 8 }}>
            {isAnalyzing ? "⏳ AI đang phân tích..." : "🤖 Phân tích & tư vấn"}
          </Button>
        </form>

        {aiAnalysisResult && (
          <div style={{ marginTop: 16, padding: 14, background: "var(--brand-soft)", borderRadius: 10, border: "1px solid var(--brand)" }}>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "var(--text)", fontFamily: "inherit" }}>
              {aiAnalysisResult}
            </pre>
          </div>
        )}
      </Panel>
    </AppShellPage>
  );
}
