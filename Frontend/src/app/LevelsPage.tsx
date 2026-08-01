import { useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function LevelsPage() {
  const { showToast } = useToast();

  const [diffPoints, setDiffPoints] = useState(3);
  const [onTimeBonus, setOnTimeBonus] = useState(5);
  const [autoApplySalary, setAutoApplySalary] = useState(true);

  const [levels, setLevels] = useState([
    { level: 1, name: "Thử việc", points: 0, baseSalary: 8000000, allowance: 0 },
    { level: 2, name: "Chính thức", points: 500, baseSalary: 12000000, allowance: 500000 },
    { level: 3, name: "Vững vàng", points: 1000, baseSalary: 18000000, allowance: 1000000 },
    { level: 4, name: "Nòng cốt", points: 1800, baseSalary: 25000000, allowance: 1500000 },
    { level: 5, name: "Chuyên gia", points: 2800, baseSalary: 35000000, allowance: 2500000 },
    { level: 6, name: "Lãnh đạo", points: 4000, baseSalary: 50000000, allowance: 4000000 },
    { level: 7, name: "Bậc 7", points: 5500, baseSalary: 70000000, allowance: 5000000 },
  ]);

  function handleSaveFormula(e: FormEvent) {
    e.preventDefault();
    showToast("Đã lưu công thức tính điểm", "success");
  }

  function handleRecalculate() {
    showToast("Đã tính lại điểm và áp bậc lương cho toàn công ty", "success");
  }

  return (
    <AppShellPage initialNavId="levels">
      <div className="page-head">
        <h1>⚙️ Cấp bậc &amp; công thức điểm</h1>
        <p className="page-sub">
          CEO đặt cách tính điểm và thang Level — bậc lương + phúc lợi. Lên Level tự áp bậc lương mới cho kỳ lương kế tiếp.
        </p>
      </div>

      {/* 1. Formula Panel */}
      <Panel>
        <div className="panel-h">1️⃣ Công thức tính điểm</div>
        <form onSubmit={handleSaveFormula} className="settings-form" style={{ maxWidth: 640 }}>
          <label>
            Điểm cho mỗi đơn vị độ khó
            <input type="number" value={diffPoints} onChange={(e) => setDiffPoints(Number(e.target.value))} />
          </label>
          <label>
            Thưởng điểm mỗi việc đúng hạn
            <input type="number" value={onTimeBonus} onChange={(e) => setOnTimeBonus(Number(e.target.value))} />
          </label>

          <label style={{ flexDirection: "row", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
            <input type="checkbox" checked={autoApplySalary} onChange={(e) => setAutoApplySalary(e.target.checked)} />
            <span>Tự động áp <b>lương cứng + phụ cấp</b> theo Level khi tính lương</span>
          </label>

          <Button variant="primary" type="submit" style={{ alignSelf: "flex-start", marginTop: 8 }}>
            Lưu công thức
          </Button>

          <p className="setting-note" style={{ marginTop: 10 }}>
            Ví dụ: 1 việc <b>Lớn</b> (5 đơn vị) đúng hạn, điểm/đơn vị = 3 → 15 + 5 = <b>20 điểm</b>.
          </p>
        </form>
      </Panel>

      {/* 2. Level Matrix Panel */}
      <Panel>
        <div className="panel-h">2️⃣ Thang cấp bậc → bậc lương &amp; phúc lợi</div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Mỗi Level: mốc điểm để đạt, lương cứng/tháng, phụ cấp, phúc lợi kèm theo. Đạt đủ mốc điểm → tự lên Level.
        </p>

        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Tên bậc</th>
                <th>Mốc điểm</th>
                <th>Lương cứng/tháng (đ)</th>
                <th>Phụ cấp (đ)</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((lvl, index) => (
                <tr key={lvl.level}>
                  <td><b>Lv {lvl.level}</b></td>
                  <td>
                    <input
                      type="text"
                      value={lvl.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLevels((prev) => prev.map((item, i) => (i === index ? { ...item, name: val } : item)));
                      }}
                      style={{ padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13 }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={lvl.points}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLevels((prev) => prev.map((item, i) => (i === index ? { ...item, points: val } : item)));
                      }}
                      style={{ padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13, width: 90 }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={lvl.baseSalary}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLevels((prev) => prev.map((item, i) => (i === index ? { ...item, baseSalary: val } : item)));
                      }}
                      style={{ padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13, width: 120 }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={lvl.allowance}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLevels((prev) => prev.map((item, i) => (i === index ? { ...item, allowance: val } : item)));
                      }}
                      style={{ padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13, width: 100 }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <Button variant="ghost" size="sm" onClick={() => showToast("Thêm Level mới", "default")}>
            + Thêm Level
          </Button>
          <Button variant="primary" size="sm" onClick={handleRecalculate}>
            ⚙️ Tính lại điểm &amp; áp bậc lương cho toàn công ty
          </Button>
        </div>
      </Panel>
    </AppShellPage>
  );
}
