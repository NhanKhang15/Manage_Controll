import { useEffect, useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { trackedTaskNames } from "../../mocks/timeTracking";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/**
 * TimerPanel
 * Đồng hồ bấm giờ cho task đang chọn — start/stop, log phút khi dừng.
 * CSS gốc tham chiếu: .panel (id=timerBox)
 */
export interface TimerPanelProps {
  onStop: (taskName: string, minutes: number) => void;
}

export function TimerPanel({ onStop }: TimerPanelProps) {
  const [taskName, setTaskName] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function handleStart() {
    if (!taskName) return;
    setElapsed(0);
    setRunning(true);
  }

  function handleStop() {
    setRunning(false);
    const minutes = Math.max(1, Math.round(elapsed / 60));
    onStop(taskName, minutes);
    setElapsed(0);
  }

  return (
    <Panel title="⏱️ Đồng hồ bấm giờ" style={{ border: "2px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <select
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          disabled={running}
          style={{ padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, minWidth: 260 }}
        >
          <option value="">— Chọn task đang làm —</option>
          {trackedTaskNames.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {running && (
          <span style={{ fontSize: 20, fontWeight: 700, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>
            {formatElapsed(elapsed)}
          </span>
        )}

        {running ? (
          <Button variant="reject" onClick={handleStop}>
            ⏹ Dừng &amp; lưu công
          </Button>
        ) : (
          <Button variant="primary" onClick={handleStart} disabled={!taskName}>
            ▶ Bắt đầu bấm giờ
          </Button>
        )}
      </div>
    </Panel>
  );
}
