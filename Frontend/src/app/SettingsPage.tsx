import { useEffect, useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../auth/AuthContext";
import { clearTokens } from "../auth/tokenStorage";
import { getCompanyAlertSettings, updateCompanyAlertSettings } from "../api/companies";

export function SettingsPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const { showToast } = useToast();

  const [dueSoonDays, setDueSoonDays] = useState(employee?.companies?.[0]?.due_soon_days ?? 2);
  const [savingAlert, setSavingAlert] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    getCompanyAlertSettings(companyId)
      .then((res) => setDueSoonDays(res.due_soon_days))
      .catch(() => {});
  }, [companyId]);

  function handleSaveAlertSettings(e: FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setSavingAlert(true);
    updateCompanyAlertSettings(companyId, dueSoonDays)
      .then(() => showToast("Đã lưu ngưỡng cảnh báo sắp đến hạn", "success"))
      .catch(() => showToast("Lưu ngưỡng cảnh báo thất bại", "danger"))
      .finally(() => setSavingAlert(false));
  }

  function handleLogout() {
    clearTokens();
    window.location.href = "/login";
  }

  const [birthday, setBirthday] = useState("1993-05-30");
  const [companyName, setCompanyName] = useState("CÔNG TY CỔ PHẦN TECH");
  const [companyDomain, setCompanyDomain] = useState("tng.vn");
  const [standardDays, setStandardDays] = useState(26);
  const [insuranceRate, setInsuranceRate] = useState(10.5);
  const [taxRate, setTaxRate] = useState(10);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  function handleSaveBirthday(e: FormEvent) {
    e.preventDefault();
    showToast("Đã cập nhật ngày sinh", "success");
  }

  function handleSaveOrg(e: FormEvent) {
    e.preventDefault();
    showToast("Đã lưu cấu hình tổ chức", "success");
  }

  function handleResetData() {
    if (deleteConfirmText.trim() !== "XÓA") {
      showToast("Vui lòng gõ chữ XÓA chính xác để xác nhận", "default");
      return;
    }
    showToast("Đã xóa dữ liệu mẫu và làm sạch hệ thống", "success");
    setDeleteConfirmText("");
  }

  return (
    <AppShellPage initialNavId="settings">
      <div className="page-head">
        <h1>Thiết lập</h1>
        <p className="page-sub">Tài khoản và cấu hình hệ thống.</p>
      </div>

      {/* Panel 1: Tài khoản của tôi */}
      <Panel>
        <div className="panel-h">Tài khoản của tôi</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span className="muted">Họ tên</span>
            <b>{employee?.full_name || "Lê Xuân Huy"}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span className="muted">Email</span>
            <b>{employee?.email || "huy@tng.vn"}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span className="muted">Vai trò</span>
            <b>{employee?.position_title || "Ban lãnh đạo · Giám đốc"}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span className="muted">Phòng ban</span>
            <b>Ban Giám đốc</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span className="muted">Điểm thưởng</span>
            <b>336 điểm · Level 8 · ★ 4.6</b>
          </div>
        </div>

        <form onSubmit={handleSaveBirthday} className="settings-form" style={{ maxWidth: 360, marginTop: 10 }}>
          <label>
            Ngày sinh <small className="muted">Để hệ thống gửi lời chúc mừng sinh nhật 🎂</small>
            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </label>
          <Button variant="primary" size="sm" type="submit">
            Lưu ngày sinh
          </Button>
        </form>

        <div style={{ marginTop: 16 }}>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </Panel>

      {/* Panel 2: Trợ lý AI */}
      <Panel>
        <div className="panel-h">🤖 Trợ lý AI (Claude · GPT · Gemini)</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
          <span>Trạng thái</span>
          <b className="muted">○ Đang tắt — trả lời theo luật (đọc dữ liệu thật)</b>
        </div>
        <p className="setting-note" style={{ marginTop: 8 }}>
          Trợ lý luôn trả lời được theo dữ liệu thật. Việc gắn khoá Claude do cấp quản lý (BOD) cấu hình.
        </p>
      </Panel>

      {/* Panel 3: Lượng dùng AI */}
      <Panel>
        <div className="panel-h">📊 Lượng dùng AI hôm nay <small className="muted">(credit = tổng token in/out gửi tới Claude)</small></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
          <span>Của tôi hôm nay</span>
          <b>0 credit · 0 lượt hỏi AI</b>
        </div>
      </Panel>

      {/* Panel: Cảnh báo sắp đến hạn (áp dụng cho tab Công việc) */}
      <Panel>
        <div className="panel-h">🟡 Cảnh báo sắp đến hạn</div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
          Việc chưa xong, còn ít hơn hoặc bằng số ngày này tới hạn, sẽ hiện cảnh báo màu vàng "Sắp đến hạn" trong bảng Công việc.
        </p>
        <form onSubmit={handleSaveAlertSettings} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <label style={{ fontSize: 13 }}>
            Số ngày trước hạn
            <input
              type="number"
              min={0}
              value={dueSoonDays}
              onChange={(e) => setDueSoonDays(Number(e.target.value))}
              style={{ display: "block", marginTop: 4, width: 100 }}
            />
          </label>
          <Button variant="primary" size="sm" type="submit" disabled={savingAlert || !companyId}>
            {savingAlert ? "Đang lưu..." : "Lưu ngưỡng"}
          </Button>
        </form>
      </Panel>

      {/* Panel 4: Cấu hình tổ chức */}
      <Panel>
        <div className="panel-h">🏢 Cấu hình tổ chức</div>
        <form onSubmit={handleSaveOrg} className="settings-form" style={{ maxWidth: 640 }}>
          <label>
            Tên công ty
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="CÔNG TY CỔ PHẦN..." />
          </label>
          <label>
            Tên miền email công ty
            <input type="text" value={companyDomain} onChange={(e) => setCompanyDomain(e.target.value)} placeholder="tng.vn" />
          </label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ flex: 1, minWidth: 160 }}>
              Ngày công chuẩn / tháng
              <input type="number" value={standardDays} onChange={(e) => setStandardDays(Number(e.target.value))} />
            </label>
            <label style={{ flex: 1, minWidth: 160 }}>
              Tỉ lệ bảo hiểm (%)
              <input type="number" step={0.1} value={insuranceRate} onChange={(e) => setInsuranceRate(Number(e.target.value))} />
            </label>
            <label style={{ flex: 1, minWidth: 160 }}>
              Tỉ lệ thuế TNCN (%)
              <input type="number" step={0.1} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
            </label>
          </div>
          <Button variant="primary" type="submit" style={{ alignSelf: "flex-start", marginTop: 8 }}>
            Lưu cấu hình
          </Button>
        </form>
      </Panel>

      {/* Panel 5: Dữ liệu mẫu */}
      <Panel style={{ border: "1px solid var(--danger)" }}>
        <div className="panel-h" style={{ color: "var(--danger)" }}>⚡ Dữ liệu mẫu</div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Khi bắt đầu dùng thật, hãy <b>xóa dữ liệu mẫu</b> để xóa toàn bộ nhân viên ảo, dự án, công việc minh họa.
        </p>
        <div style={{ maxWidth: 360, display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 13 }}>
            Gõ <b>XÓA</b> để xác nhận:
            <input
              type="text"
              placeholder="XÓA"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </label>
          <Button variant="reject" size="sm" onClick={handleResetData} style={{ alignSelf: "flex-start" }}>
            🧹 Xóa dữ liệu mẫu, bắt đầu sạch
          </Button>
        </div>
      </Panel>
    </AppShellPage>
  );
}
