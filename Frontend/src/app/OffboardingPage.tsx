import { useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function OffboardingPage() {
  const { showToast } = useToast();
  const [leavingUserId, setLeavingUserId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [kind, setKind] = useState("thoi_viec");
  const [effectiveDate, setEffectiveDate] = useState("2026-07-28");
  const [reason, setReason] = useState("");
  const [handoverNote, setHandoverNote] = useState("");

  const [history, setHistory] = useState<any[]>([]);

  function handleProcessOffboarding(e: FormEvent) {
    e.preventDefault();
    if (!leavingUserId || !recipientId) {
      showToast("Vui lòng chọn nhân viên nghỉ và người nhận bàn giao", "default");
      return;
    }
    const item = {
      id: `off-${Date.now()}`,
      decisionNo: `01/QĐ-TV`,
      user: "Joseph Tuấn",
      kind: kind === "thoi_viec" ? "Thôi việc (theo nguyện vọng)" : "Chấm dứt HĐLĐ",
      recipient: "Lê Xuân Huy",
      transferred: "Tất cả công việc & KH",
      effectiveDate,
    };
    setHistory((prev) => [item, ...prev]);
    showToast("Đã xử lý nghỉ việc & bàn giao thành công", "success");
  }

  return (
    <AppShellPage initialNavId="offboarding">
      <div className="page-head">
        <h1>👋 Nghỉ việc / Bàn giao</h1>
        <p className="page-sub">
          Chọn nhân viên nghỉ + người nhận bàn giao → tự <b>chuyển toàn bộ việc/dự án/khách hàng</b>, <b>vô hiệu hóa tài khoản</b> (giữ lịch sử) và sinh <b>Quyết định thôi việc theo TCVN</b>.
        </p>
      </div>

      <Panel>
        <div className="panel-h">Xử lý nghỉ việc</div>
        <form onSubmit={handleProcessOffboarding} className="settings-form" style={{ maxWidth: 640 }}>
          <label>
            Nhân viên nghỉ việc
            <select value={leavingUserId} onChange={(e) => setLeavingUserId(e.target.value)} required>
              <option value="">— Chọn nhân viên —</option>
              <option value="9">Joseph Tuấn — CPO</option>
              <option value="1">Lê Xuân Huy — Giám đốc</option>
              <option value="2">Trần Hữu Thành — Chủ tịch HĐQT</option>
              <option value="4">Hoàng Sơn — Trưởng phòng KD</option>
              <option value="3">Nguyễn Thu Lan — Trưởng nhóm Tech</option>
            </select>
          </label>

          <label>
            Người nhận bàn giao
            <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required>
              <option value="">— Chọn người nhận —</option>
              <option value="1">Lê Xuân Huy — Giám đốc</option>
              <option value="9">Joseph Tuấn — CPO</option>
              <option value="75">Trần Quản Nhân — Giám đốc Nhân sự</option>
            </select>
          </label>

          <label>
            Hình thức
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="thoi_viec">Thôi việc (theo nguyện vọng)</option>
              <option value="sa_thai">Chấm dứt HĐLĐ</option>
            </select>
          </label>

          <label>
            Ngày hiệu lực
            <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          </label>

          <label>
            Lý do (tuỳ chọn)
            <input type="text" placeholder="VD: đơn xin nghỉ việc ngày…" value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>

          <label>
            Ghi chú bàn giao (tuỳ chọn)
            <input type="text" placeholder="VD: bàn giao thêm tài khoản email, tài liệu phòng…" value={handoverNote} onChange={(e) => setHandoverNote(e.target.value)} />
          </label>

          <Button variant="primary" type="submit" style={{ alignSelf: "flex-start", marginTop: 8 }}>
            👋 Cho nghỉ &amp; bàn giao &amp; xuất văn bản
          </Button>

          <p className="setting-note" style={{ marginTop: 12 }}>
            Toàn bộ <b>công việc chưa xong</b>, <b>dự án</b> và <b>khách hàng</b> của người nghỉ sẽ chuyển sang người nhận. Người nhận &amp; cấp trên nhận thông báo. Tài khoản người nghỉ bị vô hiệu hóa nhưng dữ liệu lịch sử vẫn giữ.
          </p>
        </form>
      </Panel>

      <Panel>
        <div className="panel-h">Lịch sử nghỉ việc</div>
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)" }}>SỐ QĐ</th>
                <th style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)" }}>NHÂN VIÊN</th>
                <th style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)" }}>HÌNH THỨC</th>
                <th style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)" }}>BÀN GIAO CHO</th>
                <th style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)" }}>ĐÃ CHUYỂN</th>
                <th style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)" }}>HIỆU LỰC</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: "center", padding: 24, fontSize: 13 }}>
                    Chưa có.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id}>
                    <td><b>{h.decisionNo}</b></td>
                    <td>{h.user}</td>
                    <td>{h.kind}</td>
                    <td>{h.recipient}</td>
                    <td>{h.transferred}</td>
                    <td className="muted">{h.effectiveDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShellPage>
  );
}
