import { useState, type FormEvent } from "react";
import { Panel } from "../../components/ui/Panel";
import { useToast } from "../../components/ui/Toast";

export function IdentityDocsForm() {
  const { showToast } = useToast();
  const [mst, setMst] = useState("");
  const [bhxh, setBhxh] = useState("");
  const [cccd, setCccd] = useState("");
  const [vneid, setVneid] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    showToast("Đã lưu hồ sơ BHXH/Thuế/Định danh", "success");
  }

  return (
    <Panel>
      <div className="panel-h">🪪 Hồ sơ BHXH / Thuế / Định danh</div>
      <p className="setting-note" style={{ margin: "0 6px 10px" }}>
        Khai mã số &amp; tải minh chứng để công ty đăng ký <b>bảo hiểm xã hội</b> và <b>thuế TNCN</b>. Liên kết trực tiếp
        tới cổng nhà nước: <a href="https://vneid.gov.vn/" target="_blank" rel="noreferrer">VNeID</a> ·{" "}
        <a href="https://dichvucong.baohiemxahoi.gov.vn/" target="_blank" rel="noreferrer">Cổng BHXH (VssID)</a> ·{" "}
        <a href="https://canhan.gdt.gov.vn/" target="_blank" rel="noreferrer">Thuế điện tử (eTax)</a>.
      </p>
      <form onSubmit={handleSubmit} className="settings-form" style={{ maxWidth: 640 }}>
        <div className="fld-2col">
          <label>Mã số thuế (MST) <input type="text" value={mst} onChange={(e) => setMst(e.target.value)} placeholder="10 số" /></label>
          <label>Số sổ BHXH <input type="text" value={bhxh} onChange={(e) => setBhxh(e.target.value)} placeholder="Nếu đã có" /></label>
          <label>Số CCCD <input type="text" value={cccd} onChange={(e) => setCccd(e.target.value)} placeholder="12 số" /></label>
          <label>Tài khoản VNeID (mức 2) <input type="text" value={vneid} onChange={(e) => setVneid(e.target.value)} placeholder="Số định danh / SĐT VNeID" /></label>
        </div>
        <label>Minh chứng BHXH (ảnh/PDF) <input type="file" accept=".pdf,image/*" /></label>
        <label>Minh chứng thuế/CCCD (ảnh/PDF) <input type="file" accept=".pdf,image/*" /></label>
        <label>Ghi chú (tuỳ chọn) <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: đã có sổ BHXH ở công ty cũ…" /></label>
        <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>💾 Lưu hồ sơ</button>
      </form>
    </Panel>
  );
}
