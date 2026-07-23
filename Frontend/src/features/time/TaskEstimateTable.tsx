import { Panel } from "../../components/ui/Panel";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { TaskEstimate, TimeLogEntry } from "../../types/timeTracking";

export interface TaskEstimateTableProps {
  estimates: TaskEstimate[];
  logs: TimeLogEntry[];
  onChangeEstimate: (taskName: string, hours: number) => void;
}

export function TaskEstimateTable({ estimates, logs, onChangeEstimate }: TaskEstimateTableProps) {
  return (
    <Panel title="🎯 Việc của tôi — ước lượng vs thực tế">
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Task</th>
            <th>Ước lượng (h)</th>
            <th>Đã log</th>
            <th style={{ width: 180 }}>Tiến độ giờ</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((est) => {
            const loggedMinutes = logs.filter((l) => l.taskName === est.taskName).reduce((sum, l) => sum + l.minutes, 0);
            const loggedH = Math.floor(loggedMinutes / 60);
            const loggedM = loggedMinutes % 60;
            const pct = est.estimateHours ? Math.min(100, Math.round((loggedMinutes / 60 / est.estimateHours) * 100)) : null;
            return (
              <tr key={est.taskName}>
                <td style={{ textAlign: "left" }}>{est.taskName}</td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    value={est.estimateHours ?? ""}
                    placeholder="—"
                    onChange={(e) => onChangeEstimate(est.taskName, Number(e.target.value))}
                    style={{ width: 70, padding: "4px 6px", border: "1px solid var(--line)", borderRadius: 7, textAlign: "center" }}
                  />
                </td>
                <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                  {loggedH}h{loggedM}m
                </td>
                <td>
                  {pct === null ? (
                    <span className="muted" style={{ fontSize: 12 }}>Chưa ước lượng</span>
                  ) : (
                    <ProgressBar progress={pct} color={pct >= 100 ? "#EF4444" : "var(--brand)"} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}
