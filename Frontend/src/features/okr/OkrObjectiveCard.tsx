import { Panel } from "../../components/ui/Panel";
import { Chip } from "../../components/ui/Chip";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { DEPT_COLOR } from "../../mocks/okr";
import type { Objective } from "../../types/okr";

function krProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

/**
 * OkrObjectiveCard
 * 1 Objective + danh sách Key Result kèm % hoàn thành từng KR.
 * CSS gốc tham chiếu: .panel (mới: .kr-row cho từng key result)
 */
export interface OkrObjectiveCardProps {
  objective: Objective;
  onAddKeyResult: (objective: Objective) => void;
}

export function OkrObjectiveCard({ objective, onAddKeyResult }: OkrObjectiveCardProps) {
  const overall =
    objective.keyResults.length === 0
      ? 0
      : Math.round(objective.keyResults.reduce((sum, kr) => sum + krProgress(kr.current, kr.target), 0) / objective.keyResults.length);

  return (
    <Panel style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <Chip label={objective.department} color={DEPT_COLOR[objective.department]} />
            <span className="muted" style={{ fontSize: 12.5 }}>
              {objective.period} · {objective.owner}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🎯 {objective.title}</h3>
        </div>
        <b style={{ color: "var(--brand)" }}>{overall}%</b>
      </div>

      <ProgressBar progress={overall} size="big" />

      <div style={{ marginTop: 12 }}>
        {objective.keyResults.map((kr) => {
          const pct = krProgress(kr.current, kr.target);
          return (
            <div key={kr.id} className="kr-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, marginBottom: 4 }}>{kr.title}</div>
                <ProgressBar progress={pct} color="#10B981" />
              </div>
              <span className="muted" style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>
                {kr.current}/{kr.target}
              </span>
            </div>
          );
        })}
      </div>

      <Button variant="ghost" size="sm" onClick={() => onAddKeyResult(objective)}>
        + Thêm kết quả then chốt
      </Button>
    </Panel>
  );
}
