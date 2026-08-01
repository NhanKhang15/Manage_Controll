import { useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function LeavePage() {
  const { showToast } = useToast();
  const [leaveType, setLeaveType] = useState("annual");
  const [startDate, setStartDate] = useState("2026-07-28");
  const [endDate, setEndDate] = useState("2026-07-28");
  const [reason, setReason] = useState("");
  const [myLeaves, setMyLeaves] = useState<any[]>([]);

  function handleSubmitLeave(e: FormEvent) {
    e.preventDefault();
    const newLeave = {
      id: `lv-${Date.now()}`,
      type: leaveType === "annual" ? "Nghỉ phép năm" : leaveType === "sick" ? "Nghỉ ốm" : "Nghỉ không lương",
      start: startDate,
      end: endDate,
      reason,
      status: "Chờ duyệt",
    };
    setMyLeaves((prev) => [newLeave, ...prev]);
    setReason("");
    showToast("Đã gửi đơn nghỉ phép thành công", "success");
  }

  return (
    <AppShellPage initialNavId="leave">
      <div className="page-head">
        <h1>🌴 Nghỉ phép</h1>
        <p className="page-sub">Xin nghỉ và theo dõi đơn.</p>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>🗓️</span>
          <div className="kpi-meta">
            <b>12</b>
            <small>Phép năm (ngày)</small>
          </div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>➖</span>
          <div className="kpi-meta">
            <b>0</b>
            <small>Đã dùng</small>
          </div>
        </div>
        <div className="kpi">
          <span className="kpi-ico" style={{ background: "rgba(79,110,247,0.12)", color: "#4F6EF7" }}>☑️</span>
          <div className="kpi-meta">
            <b>12</b>
            <small>Còn lại</small>
          </div>
        </div>
      </div>

      {/* Leave Application Form */}
      <Panel>
        <div className="panel-h">Tạo đơn nghỉ phép</div>
        <form onSubmit={handleSubmitLeave} className="settings-form leave-form" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ flex: 1, minWidth: 140 }}>
            Loại nghỉ
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
              <option value="annual">Nghỉ phép năm</option>
              <option value="sick">Nghỉ ốm</option>
              <option value="unpaid">Nghỉ không lương</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <label style={{ flex: 1, minWidth: 130 }}>
            Từ ngày
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>
          <label style={{ flex: 1, minWidth: 130 }}>
            Đến ngày
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </label>
          <label style={{ flex: 2, minWidth: 200 }}>
            Lý do
            <input
              type="text"
              placeholder="Lý do nghỉ…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <Button variant="primary" type="submit" style={{ flexShrink: 0 }}>
            Gửi đơn
          </Button>
        </form>
      </Panel>

      {/* Approvals Pending */}
      <Panel>
        <div className="panel-h">Đơn của phòng / cần duyệt</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid var(--line-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mini-ava" style={{ width: 24, height: 24, borderRadius: "50%", background: "#0EA5E922", color: "#0EA5E9", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                TL
              </span>
              <span><b>Nguyễn Thu Lan</b> · Nghỉ phép năm</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="muted" style={{ fontSize: 13 }}>12/07–13/07 (2đ)</span>
              <div style={{ display: "flex", gap: 6 }}>
                <Button size="sm" variant="approve" onClick={() => showToast("Đã duyệt đơn Nguyễn Thu Lan", "success")}>✓</Button>
                <Button size="sm" variant="reject" onClick={() => showToast("Đã từ chối đơn", "default")}>✕</Button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mini-ava" style={{ width: 24, height: 24, borderRadius: "50%", background: "#10B98122", color: "#10B981", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                QH
              </span>
              <span><b>Đặng Quốc Huy</b> · Nghỉ ốm</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="muted" style={{ fontSize: 13 }}>04/07–04/07 (1đ)</span>
              <span className="alert-tag alert-soft">Đã duyệt</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* My Leave Applications */}
      <Panel>
        <div className="panel-h">Đơn của tôi</div>
        {myLeaves.length === 0 ? (
          <p className="muted" style={{ fontSize: 13, padding: "4px 0" }}>Chưa có đơn nào.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myLeaves.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}>
                <div>
                  <b>{item.type}</b> ({item.start} - {item.end}) <span className="muted">{item.reason && `• ${item.reason}`}</span>
                </div>
                <span className="alert-tag" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShellPage>
  );
}
