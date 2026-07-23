import { useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
import { OkrFilterBar } from "../features/okr/OkrFilterBar";
import { OkrObjectiveCard } from "../features/okr/OkrObjectiveCard";
import { CreateObjectiveModal } from "../features/okr/CreateObjectiveModal";
import { useToast } from "../components/ui/Toast";
import { mockObjectives } from "../mocks/okr";
import type { Objective } from "../types/okr";

export function OkrPage() {
  const [objectives, setObjectives] = useState<Objective[]>(mockObjectives);
  const [period, setPeriod] = useState("Q3/2026");
  const [department, setDepartment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const filtered = objectives.filter(
    (o) => o.period === period && (department === "" || o.department === department)
  );

  function handleAddKeyResult(objective: Objective) {
    const title = window.prompt("Tên kết quả then chốt:");
    if (!title || !title.trim()) return;
    const targetStr = window.prompt("Mục tiêu cần đạt (số):", "100");
    const target = Number(targetStr);
    if (!targetStr || Number.isNaN(target)) return;
    setObjectives((prev) =>
      prev.map((o) =>
        o.id === objective.id
          ? { ...o, keyResults: [...o.keyResults, { id: `kr-${Date.now()}`, title: title.trim(), current: 0, target }] }
          : o
      )
    );
  }

  return (
    <AppShellPage initialNavId="okr">
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1>🎯 Mục tiêu (OKR)</h1>
          <p className="page-sub">
            Đặt <b>Objective</b> → gắn <b>Key Results</b> đo được → theo dõi tiến độ rollup theo phòng ban &amp; người phụ trách.
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          ✨ Mục tiêu mới
        </Button>
      </div>

      <OkrFilterBar period={period} onChangePeriod={setPeriod} department={department} onChangeDepartment={setDepartment} />

      {filtered.length === 0 ? (
        <Panel>
          <p className="muted" style={{ padding: 16 }}>
            Chưa có mục tiêu nào cho kỳ <b>{period}</b>. Bấm "Mục tiêu mới" để tạo.
          </p>
        </Panel>
      ) : (
        filtered.map((o) => <OkrObjectiveCard key={o.id} objective={o} onAddKeyResult={handleAddKeyResult} />)
      )}

      <CreateObjectiveModal
        isOpen={modalOpen}
        period={period}
        onClose={() => setModalOpen(false)}
        onCreate={(obj) => {
          setObjectives((prev) => [...prev, obj]);
          showToast("Đã tạo mục tiêu mới", "success");
        }}
      />
    </AppShellPage>
  );
}
