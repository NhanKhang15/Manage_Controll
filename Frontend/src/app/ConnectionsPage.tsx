import { useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function ConnectionsPage() {
  const { showToast } = useToast();
  const [gcalId, setGcalId] = useState("");
  const [zaloOaId, setZaloOaId] = useState("");
  const [zaloToken, setZaloToken] = useState("");
  const [gsheetId, setGsheetId] = useState("");
  const [gsheetGid, setGsheetGid] = useState("0");
  const [mailFrom, setMailFrom] = useState("");
  const [mailName, setMailName] = useState("Vela AI");

  function handleSave(name: string) {
    showToast(`Đã lưu cấu hình ${name}`, "success");
  }

  return (
    <AppShellPage initialNavId="connections">
      <div className="page-head">
        <h1>🔗 Kết nối</h1>
        <p className="page-sub">
          Tích hợp Google Drive, Calendar, Zalo của công ty. <b>Chỉ Admin / BOD</b> thấy trang này.
        </p>
      </div>

      <div
        style={{
          padding: "12px 16px",
          background: "var(--brand-soft)",
          color: "var(--brand)",
          borderRadius: 12,
          fontSize: 13,
          marginBottom: 18,
        }}
      >
        ℹ️ Các kết nối cần <b>khóa API/OAuth của công ty</b>. Google → tạo project ở <b>Google Cloud Console</b> (OAuth Client ID/Secret); Zalo → tạo <b>Official Account</b> + App lấy OA Token.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {/* Google Drive */}
        <Panel style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24, padding: 8, background: "rgba(31,164,100,0.12)", borderRadius: 10 }}>📁</span>
              <div>
                <b>Google Drive công ty</b>
                <small className="muted" style={{ display: "block" }}>Truy xuất &amp; lấy link file từ Drive công ty</small>
              </div>
            </div>
            <span className="alert-tag" style={{ background: "var(--line)", color: "var(--muted)" }}>○ Chưa kết nối</span>
          </div>
          <p className="setting-note" style={{ marginTop: 10 }}>🔒 Chỉ <b>Admin</b> mới cấu hình &amp; kết nối Google Drive công ty.</p>
        </Panel>

        {/* Google Calendar */}
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, padding: 6, background: "rgba(66,133,244,0.12)", borderRadius: 8 }}>📆</span>
              <div>
                <b>Google Calendar</b>
                <small className="muted" style={{ display: "block" }}>Đồng bộ lịch họp</small>
              </div>
            </div>
            <span className="alert-tag" style={{ background: "var(--line)", color: "var(--muted)" }}>○ Chưa kết nối</span>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSave("Google Calendar"); }} className="settings-form">
            <label>
              Calendar ID
              <input
                type="text"
                placeholder="company@group.calendar.google.com"
                value={gcalId}
                onChange={(e) => setGcalId(e.target.value)}
              />
            </label>
            <Button variant="primary" size="sm" type="submit">Lưu</Button>
          </form>
        </Panel>

        {/* Zalo OA */}
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, padding: 6, background: "rgba(0,104,255,0.12)", borderRadius: 8 }}>💬</span>
              <div>
                <b>Zalo OA</b>
                <small className="muted" style={{ display: "block" }}>Gửi tin nhắn Official Account</small>
              </div>
            </div>
            <span className="alert-tag" style={{ background: "var(--line)", color: "var(--muted)" }}>○ Chưa kết nối</span>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSave("Zalo OA"); }} className="settings-form">
            <label>
              OA ID
              <input type="text" placeholder="OA ID" value={zaloOaId} onChange={(e) => setZaloOaId(e.target.value)} />
            </label>
            <label>
              OA Access Token
              <input type="text" placeholder="Zalo OA token" value={zaloToken} onChange={(e) => setZaloToken(e.target.value)} />
            </label>
            <Button variant="primary" size="sm" type="submit">Lưu</Button>
          </form>
        </Panel>

        {/* Google Sheet */}
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, padding: 6, background: "rgba(15,157,88,0.12)", borderRadius: 8 }}>📊</span>
              <div>
                <b>Google Sheet — Khách hàng</b>
                <small className="muted" style={{ display: "block" }}>Đồng bộ danh sách KH</small>
              </div>
            </div>
            <span className="alert-tag" style={{ background: "var(--line)", color: "var(--muted)" }}>○ Chưa kết nối</span>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSave("Google Sheet"); }} className="settings-form">
            <label>
              Sheet ID hoặc link
              <input type="text" placeholder="Dán link Google Sheet hoặc ID" value={gsheetId} onChange={(e) => setGsheetId(e.target.value)} />
            </label>
            <label>
              GID trang tính (tuỳ chọn)
              <input type="text" placeholder="0 (mặc định)" value={gsheetGid} onChange={(e) => setGsheetGid(e.target.value)} />
            </label>
            <Button variant="primary" size="sm" type="submit">Lưu</Button>
          </form>
        </Panel>

        {/* Email */}
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, padding: 6, background: "rgba(234,67,53,0.12)", borderRadius: 8 }}>✉️</span>
              <div>
                <b>Email &amp; Cổng khách hàng</b>
                <small className="muted" style={{ display: "block" }}>Gửi lời mời verify</small>
              </div>
            </div>
            <span className="alert-tag" style={{ background: "var(--line)", color: "var(--muted)" }}>○ Chưa kết nối</span>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSave("Email"); }} className="settings-form">
            <label>
              Email gửi đi (From)
              <input type="email" placeholder="no-reply@company.vn" value={mailFrom} onChange={(e) => setMailFrom(e.target.value)} />
            </label>
            <label>
              Tên hiển thị người gửi
              <input type="text" placeholder="Vela AI" value={mailName} onChange={(e) => setMailName(e.target.value)} />
            </label>
            <Button variant="primary" size="sm" type="submit">Lưu</Button>
          </form>
        </Panel>
      </div>
    </AppShellPage>
  );
}
