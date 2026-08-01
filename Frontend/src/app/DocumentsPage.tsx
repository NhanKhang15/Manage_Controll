import { useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export interface EmployeeDoc {
  id: string;
  empName: string;
  docType: string;
  title: string;
  note?: string;
  createdAt: string;
}

export function DocumentsPage() {
  const { showToast } = useToast();
  const [selectedEmp, setSelectedEmp] = useState("Joseph Tuấn");
  const [targetEmp, setTargetEmp] = useState("Joseph Tuấn");
  const [docType, setDocType] = useState("Hợp đồng lao động");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const [docs, setDocs] = useState<EmployeeDoc[]>([]);

  function handleAddDocument(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newDoc: EmployeeDoc = {
      id: `doc-${Date.now()}`,
      empName: targetEmp,
      docType,
      title: title.trim(),
      note,
      createdAt: "Hôm nay",
    };

    setDocs((prev) => [newDoc, ...prev]);
    setTitle("");
    setNote("");
    showToast("Đã lưu và đính kèm văn bản thành công", "success");
  }

  return (
    <AppShellPage initialNavId="documents">
      <div className="page-head">
        <h1>📂 Văn bản của tôi</h1>
        <p className="page-sub">
          Tất cả văn bản liên quan đến bạn — hợp đồng, quyết định bổ nhiệm, khen thưởng, kỷ luật… Bấm <b>Xem</b> để đọc ngay bằng PDF viewer.
        </p>
      </div>

      {/* Select Employee */}
      <Panel>
        <div className="panel-h">🔎 Xem hồ sơ nhân viên</div>
        <form className="settings-form" style={{ maxWidth: 420 }}>
          <label>
            Nhân viên
            <select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
              <option value="Joseph Tuấn">Joseph Tuấn</option>
              <option value="Lê Xuân Huy">Lê Xuân Huy</option>
              <option value="Trần Hữu Thành">Trần Hữu Thành</option>
              <option value="Nguyễn Thu Lan">Nguyễn Thu Lan</option>
            </select>
          </label>
        </form>
      </Panel>

      {/* Electronic Contracts TCVN */}
      <Panel>
        <div className="panel-h">📜 Hợp đồng điện tử (TCVN)</div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
          Văn bản công ty soạn theo chuẩn TCVN — bấm để xem &amp; lưu PDF.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button size="sm" variant="ghost" onClick={() => showToast("Mở Hợp đồng lao động", "default")}>
            📄 Hợp đồng lao động
          </Button>
          <Button size="sm" variant="ghost" onClick={() => showToast("Mở Thỏa thuận bảo mật (NDA)", "default")}>
            🔒 Thỏa thuận bảo mật (NDA)
          </Button>
        </div>
      </Panel>

      {/* Documents List */}
      <Panel>
        <div className="panel-h">📄 Văn bản ({docs.length})</div>
        {docs.length === 0 ? (
          <p className="muted" style={{ fontSize: 13, padding: "4px 0" }}>Chưa có văn bản nào.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {docs.map((d) => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}>
                <div>
                  <b>{d.title}</b> <span className="muted">({d.docType} · {d.empName})</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => showToast(`Xem văn bản ${d.title}`, "default")}>
                  📄 Xem PDF
                </Button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* System Appointments */}
      <Panel>
        <div className="panel-h">🎖️ Quyết định bổ nhiệm / thăng chức (hệ thống)</div>
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th>Số QĐ</th>
                <th>Hình thức</th>
                <th>Chức vụ</th>
                <th>Hiệu lực</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>01/QĐ</b></td>
                <td>Thăng chức</td>
                <td>CPO</td>
                <td className="muted">2026-07-12</td>
                <td>
                  <Button size="sm" variant="ghost" onClick={() => showToast("Xem Quyết định", "default")}>
                    📄 Xem QĐ
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Add Document Form */}
      <Panel>
        <div className="panel-h">➕ Thêm văn bản cho nhân viên</div>
        <form onSubmit={handleAddDocument} className="settings-form" style={{ maxWidth: 640 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ flex: 1, minWidth: 200 }}>
              Nhân viên
              <select value={targetEmp} onChange={(e) => setTargetEmp(e.target.value)}>
                <option value="Joseph Tuấn">Joseph Tuấn</option>
                <option value="Lê Xuân Huy">Lê Xuân Huy</option>
                <option value="Nguyễn Thu Lan">Nguyễn Thu Lan</option>
              </select>
            </label>
            <label style={{ flex: 1, minWidth: 200 }}>
              Loại văn bản
              <select value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="Hợp đồng lao động">Hợp đồng lao động</option>
                <option value="Quyết định bổ nhiệm">Quyết định bổ nhiệm</option>
                <option value="Khen thưởng">Khen thưởng</option>
                <option value="Khác">Khác</option>
              </select>
            </label>
          </div>

          <label>
            Tiêu đề
            <input
              type="text"
              required
              placeholder="VD: HĐLĐ số 123/2026 — Nguyễn Văn A"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label>
            Tệp (PDF khuyến nghị · doc/docx/ảnh)
            <input type="file" accept=".pdf,.doc,.docx,image/*" />
          </label>

          <label>
            Ghi chú (tuỳ chọn)
            <input type="text" placeholder="Ghi chú ngắn" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>

          <Button variant="primary" type="submit" style={{ alignSelf: "flex-start", marginTop: 8 }}>
            Lưu văn bản
          </Button>
        </form>
      </Panel>
    </AppShellPage>
  );
}
