import { useState, useEffect, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../auth/AuthContext";
import {
  getFormula,
  saveFormula,
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  recalculateScores,
  type LevelTierItem,
} from "../api/scoring";

export function LevelsPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [diffPoints, setDiffPoints] = useState(3);
  const [onTimeBonus, setOnTimeBonus] = useState(5);
  const [autoApplySalary, setAutoApplySalary] = useState(true);
  const [levels, setLevels] = useState<LevelTierItem[]>([]);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([getFormula(companyId), getLevels(companyId)])
      .then(([formula, lvl]) => {
        setDiffPoints(formula.points_per_effort_unit);
        setOnTimeBonus(formula.on_time_bonus);
        setAutoApplySalary(formula.auto_apply_salary);
        setLevels(lvl);
      })
      .catch(() => showToast("Không tải được cấu hình cấp bậc", "danger"))
      .finally(() => setLoading(false));
  }, [companyId, showToast]);

  function handleSaveFormula(e: FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    saveFormula(companyId, {
      points_per_effort_unit: diffPoints,
      on_time_bonus: onTimeBonus,
      auto_apply_salary: autoApplySalary,
    })
      .then(() => showToast("Đã lưu công thức tính điểm", "success"))
      .catch((err) => showToast(err instanceof Error ? err.message : "Lưu công thức thất bại", "danger"));
  }

  function handleRecalculate() {
    if (!companyId) return;
    setRecalculating(true);
    recalculateScores(companyId)
      .then((res) => showToast(`Đã tính lại điểm cho ${res.updated} nhân viên và áp bậc lương`, "success"))
      .catch((err) => showToast(err instanceof Error ? err.message : "Tính lại điểm thất bại", "danger"))
      .finally(() => setRecalculating(false));
  }

  function handleAddLevel() {
    if (!companyId) return;
    const nextLevel = (levels[levels.length - 1]?.level ?? 0) + 1;
    createLevel(companyId, { level: nextLevel, name: `Bậc ${nextLevel}`, min_points: 0, base_salary: 0, allowance: 0 })
      .then((tier) => setLevels((prev) => [...prev, tier]))
      .catch((err) => showToast(err instanceof Error ? err.message : "Thêm Level thất bại", "danger"));
  }

  function patchLevel(id: string, patch: Partial<LevelTierItem>) {
    setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function handleSaveLevel(lvl: LevelTierItem) {
    updateLevel(lvl.id, {
      name: lvl.name,
      min_points: lvl.min_points,
      base_salary: lvl.base_salary,
      allowance: lvl.allowance,
      benefits: lvl.benefits,
    })
      .then(() => showToast(`Đã lưu Lv ${lvl.level}`, "success"))
      .catch((err) => showToast(err instanceof Error ? err.message : "Lưu thất bại", "danger"));
  }

  function handleDeleteLevel(lvl: LevelTierItem) {
    deleteLevel(lvl.id)
      .then(() => {
        setLevels((prev) => prev.filter((l) => l.id !== lvl.id));
        showToast(`Đã xoá Lv ${lvl.level}`, "default");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Xoá thất bại", "danger"));
  }

  return (
    <AppShellPage initialNavId="levels">
      <div className="page-head">
        <h1>⚙️ Cấp bậc &amp; công thức điểm</h1>
        <p className="page-sub">
          CEO đặt cách tính điểm và thang Level — bậc lương + phúc lợi. Lên Level tự áp bậc lương mới cho kỳ lương kế tiếp.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Đang tải dữ liệu từ máy chủ...</div>
      ) : (
        <>
          {/* 1. Formula Panel */}
          <Panel>
            <div className="panel-h">1️⃣ Công thức tính điểm</div>
            <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
              Điểm mỗi người = Σ (việc hoàn thành × độ khó × điểm/đơn-vị) + (mỗi việc đúng hạn × thưởng đúng hạn). Độ khó: Nhỏ=1 · Vừa=3 · Lớn=5 · Rất lớn=8 đơn vị.
            </p>
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
                <span>
                  Tự động áp <b>lương cứng + phụ cấp</b> theo Level khi tính lương
                </span>
              </label>

              <Button variant="primary" type="submit" style={{ alignSelf: "flex-start", marginTop: 8 }}>
                Lưu công thức
              </Button>

              <p className="setting-note" style={{ marginTop: 10 }}>
                Ví dụ: 1 việc <b>Lớn</b> (5 đơn vị) đúng hạn, điểm/đơn vị = {diffPoints} → {5 * diffPoints} + {onTimeBonus} ={" "}
                <b>{5 * diffPoints + onTimeBonus} điểm</b>.
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
                    <th>Phúc lợi</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {levels.map((lvl, index) => (
                    <tr key={lvl.id}>
                      <td>
                        <b>Lv {lvl.level}</b>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={lvl.name}
                          onChange={(e) => patchLevel(lvl.id, { name: e.target.value })}
                          style={{ padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={lvl.min_points}
                          onChange={(e) => patchLevel(lvl.id, { min_points: Number(e.target.value) })}
                          style={{ padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13, width: 90 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={lvl.base_salary}
                          onChange={(e) => patchLevel(lvl.id, { base_salary: Number(e.target.value) })}
                          style={{ padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13, width: 120 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={lvl.allowance}
                          onChange={(e) => patchLevel(lvl.id, { allowance: Number(e.target.value) })}
                          style={{ padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13, width: 100 }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={lvl.benefits}
                          onChange={(e) => patchLevel(lvl.id, { benefits: e.target.value })}
                          style={{ padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13, width: 160 }}
                        />
                      </td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <Button size="sm" variant="ghost" onClick={() => handleSaveLevel(lvl)}>
                          Lưu
                        </Button>
                        {index > 0 ? (
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteLevel(lvl)}>
                            Xoá
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <Button variant="ghost" size="sm" onClick={handleAddLevel}>
                ＋ Thêm Level {(levels[levels.length - 1]?.level ?? 0) + 1}
              </Button>
              <Button variant="primary" size="sm" onClick={handleRecalculate} disabled={recalculating}>
                ⚙️ {recalculating ? "Đang tính..." : "Tính lại điểm & áp bậc lương cho toàn công ty"}
              </Button>
            </div>
          </Panel>
        </>
      )}
    </AppShellPage>
  );
}
