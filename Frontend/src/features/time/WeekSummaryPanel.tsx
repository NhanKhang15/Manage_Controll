import { Panel } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import type { TimeLogEntry } from "../../types/timeTracking";

export interface WeekSummaryPanelProps {
  weekLabel: string;
  logs: TimeLogEntry[];
  onPrevWeek: () => void;
  onThisWeek: () => void;
  onNextWeek: () => void;
}

export function WeekSummaryPanel({ weekLabel, logs, onPrevWeek, onThisWeek, onNextWeek }: WeekSummaryPanelProps) {
  const totalMinutes = logs.reduce((sum, l) => sum + l.minutes, 0);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return (
    <Panel style={{ flex: 1.2, minWidth: 320 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontWeight: 700 }}>📅 {weekLabel}</span>
        <span style={{ display: "flex", gap: 6 }}>
          <Button variant="ghost" size="sm" onClick={onPrevWeek}>←</Button>
          <Button variant="ghost" size="sm" onClick={onThisWeek}>Tuần này</Button>
          <Button variant="ghost" size="sm" onClick={onNextWeek}>→</Button>
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#3b82f6", margin: "2px 0 8px" }}>
        {h}h{m > 0 ? ` ${m}m` : ""} <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>tổng tuần</span>
      </div>
      {logs.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>Chưa có công nào trong tuần này.</p>
      ) : (
        logs.map((l) => (
          <div key={l.id} className="dash-row">
            <div className="dash-row-title">{l.taskName}{l.note ? ` — ${l.note}` : ""}</div>
            <span className="muted" style={{ fontSize: 12.5 }}>{l.date}</span>
            <b style={{ fontSize: 13 }}>{Math.floor(l.minutes / 60)}h{l.minutes % 60}m</b>
          </div>
        ))
      )}
    </Panel>
  );
}
