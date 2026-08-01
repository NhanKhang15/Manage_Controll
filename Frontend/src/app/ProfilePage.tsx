import { useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function ProfilePage() {
  const { showToast } = useToast();

  const [phone, setPhone] = useState("0944333222");
  const [zalo, setZalo] = useState("0944333222");
  const [address, setAddress] = useState("");
  const [dependents, setDependents] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [dreams, setDreams] = useState("");

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    showToast("Đã lưu hồ sơ cá nhân thành công", "success");
  }

  return (
    <AppShellPage initialNavId="profile">
      <div className="page-head">
        <h1>👤 Hồ sơ của tôi</h1>
        <p className="page-sub">Thông tin cá nhân của bạn. Mục công ty (chức danh, phòng ban, cấp bậc) do tổ chức quản lý.</p>
      </div>

      {/* Panel 1: Company Info */}
      <Panel>
        <div className="panel-h">🏢 Thông tin công ty</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, padding: "4px 2px" }}>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Họ tên</div>
            <b style={{ fontSize: 15 }}>Joseph Tuấn</b>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Email</div>
            <span style={{ fontSize: 14 }}>tuan@tng.vn</span>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Chức danh</div>
            <span style={{ fontSize: 14 }}>CPO</span>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Phòng ban</div>
            <span style={{ fontSize: 14 }}>Sản phẩm</span>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Vai trò</div>
            <span style={{ fontSize: 14 }}>Ban lãnh đạo</span>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Cấp bậc</div>
            <span style={{ fontSize: 14 }}>Level 7 · 0 điểm</span>
          </div>
        </div>
      </Panel>

      {/* Panel 2: Personal Info Form */}
      <Panel>
        <div className="panel-h">📝 Thông tin cá nhân (bạn tự cập nhật)</div>
        <form onSubmit={handleSaveProfile} className="settings-form" style={{ maxWidth: 720 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ flex: 1, minWidth: 200 }}>
              📞 Số điện thoại
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" />
            </label>
            <label style={{ flex: 1, minWidth: 200 }}>
              💬 Zalo
              <input type="text" value={zalo} onChange={(e) => setZalo(e.target.value)} placeholder="Số Zalo" />
            </label>
          </div>

          <label>
            🏠 Địa chỉ
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
          </label>

          <label>
            👨‍👩‍👧 Người phụ thuộc
            <textarea
              rows={3}
              value={dependents}
              onChange={(e) => setDependents(e.target.value)}
              placeholder={`Mỗi người 1 dòng — VD: Con: Nguyễn An (2018); Mẹ: Trần Hoa (1960)…`}
            />
          </label>

          <label>
            🎯 Sở thích
            <input type="text" value={hobbies} onChange={(e) => setHobbies(e.target.value)} placeholder="VD: Bóng đá, đọc sách, du lịch, nhiếp ảnh…" />
          </label>

          <label>
            ✨ Mơ ước / mục tiêu cá nhân
            <textarea
              rows={2}
              value={dreams}
              onChange={(e) => setDreams(e.target.value)}
              placeholder="Điều bạn mong muốn đạt được trong công việc & cuộc sống…"
            />
          </label>

          <Button variant="primary" type="submit" style={{ alignSelf: "flex-start", marginTop: 8 }}>
            Lưu hồ sơ
          </Button>
        </form>
      </Panel>
    </AppShellPage>
  );
}
