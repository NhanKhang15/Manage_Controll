import { useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function AutomationsPage() {
  const { showToast } = useToast();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiBuilding, setIsAiBuilding] = useState(false);

  const [workflows, setWorkflows] = useState([
    { id: "wf1", name: "A", nodes: 0, status: "Đang bật", runs: 0 },
    { id: "wf2", name: "aaa", nodes: 0, status: "Đang bật", runs: 0 },
    { id: "wf3", name: "Tự động: Thu thập & nhập liệu KH", nodes: 3, status: "Đang bật", runs: 1 },
  ]);

  function handleAiBuildWorkflow(e: FormEvent) {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      showToast("Vui lòng nhập mô tả bằng lời để AI dựng luồng", "default");
      return;
    }
    setIsAiBuilding(true);
    setTimeout(() => {
      const newWf = {
        id: `wf-${Date.now()}`,
        name: `Tự động: ${aiPrompt.slice(0, 24)}...`,
        nodes: 4,
        status: "Đang bật",
        runs: 0,
      };
      setWorkflows((prev) => [newWf, ...prev]);
      setIsAiBuilding(false);
      setAiPrompt("");
      showToast("AI đã tự động thiết lập luồng làm việc!", "success");
    }, 900);
  }

  return (
    <AppShellPage initialNavId="automations">
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Luồng tự động</h1>
          <p className="page-sub">Kéo-thả loại công việc → hành động tiếp theo, đặt thời gian &amp; ghi chú cho AI.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => showToast("Tạo luồng mới", "default")}>
          + Tạo luồng
        </Button>
      </div>

      {/* AI Workflow Generator Panel */}
      <Panel>
        <div className="panel-h">✨ Không rảnh? Mô tả bằng lời — AI tự dựng luồng cho bạn</div>
        <form onSubmit={handleAiBuildWorkflow} className="settings-form" style={{ maxWidth: 720 }}>
          <label>
            <textarea
              rows={3}
              placeholder="VD: Khi có khách hàng mới ký hợp đồng, tạo việc chuẩn bị hồ sơ onboarding giao cho sale, nhắc kế toán xuất hoá đơn, soạn email chào mừng, rồi đẩy về báo cáo."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
          </label>
          <Button variant="primary" type="submit" disabled={isAiBuilding} style={{ alignSelf: "flex-start", marginTop: 4 }}>
            {isAiBuilding ? "⏳ AI đang thiết lập luồng..." : "✨ Tạo luồng bằng AI"}
          </Button>
        </form>
      </Panel>

      {/* Workflow Cards List */}
      <Panel>
        <div className="panel-h">Luồng tự động hiện có ({workflows.length})</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {workflows.map((wf) => (
            <div
              key={wf.id}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "var(--bg)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b>{wf.name}</b>
                <span className="alert-tag alert-soft" style={{ fontSize: 11 }}>• {wf.status}</span>
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                🧩 {wf.nodes} node · ⏱ Chạy tay · ▶ {wf.runs} lần chạy
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Recent Workflow Execution Logs */}
      <Panel>
        <div className="panel-h">📊 Kết quả gần đây (đã đẩy vào Báo cáo)</div>
        <div style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13 }}>
          <b>Tự động: Thu thập &amp; nhập liệu KH</b> <small className="muted">11:34 11/07 · chạy tay</small>
          <div style={{ marginTop: 6, fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            <span>▶ Khởi đầu: Khi đến kỳ: Thu thập &amp; nhập liệu KH</span>
            <span>✅ Tạo việc: Thu thập &amp; nhập liệu KH</span>
            <span>📊 Đẩy kết quả về Báo cáo công việc</span>
          </div>
        </div>
      </Panel>
    </AppShellPage>
  );
}
