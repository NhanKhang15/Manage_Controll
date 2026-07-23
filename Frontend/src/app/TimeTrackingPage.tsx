import { useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { TimerPanel } from "../features/time/TimerPanel";
import { ManualLogForm } from "../features/time/ManualLogForm";
import { WeekSummaryPanel } from "../features/time/WeekSummaryPanel";
import { TaskEstimateTable } from "../features/time/TaskEstimateTable";
import { useToast } from "../components/ui/Toast";
import { mockTaskEstimates, mockWeekLogs } from "../mocks/timeTracking";
import type { TaskEstimate, TimeLogEntry } from "../types/timeTracking";

const WEEK_LABELS = ["Tuần 13/07 – 19/07/2026", "Tuần 20/07 – 26/07/2026", "Tuần 27/07 – 02/08/2026"];

export function TimeTrackingPage() {
  const [logs, setLogs] = useState<TimeLogEntry[]>(mockWeekLogs);
  const [estimates, setEstimates] = useState<TaskEstimate[]>(mockTaskEstimates);
  const [weekIndex, setWeekIndex] = useState(1);
  const { showToast } = useToast();

  function addLog(taskName: string, minutes: number, date: string, note: string) {
    setLogs((prev) => [
      { id: `log-${Date.now()}`, taskName, minutes, date: new Date(date).toLocaleDateString("vi-VN"), note: note || undefined },
      ...prev,
    ]);
    showToast("Đã lưu công", "success");
  }

  return (
    <AppShellPage initialNavId="time">
      <div className="page-head">
        <h1>⏱️ Chấm giờ &amp; ước lượng</h1>
        <p className="page-sub">Bấm giờ khi làm việc, hoặc log công thủ công. Theo dõi thời gian thực tế so với ước lượng của từng task.</p>
      </div>

      <TimerPanel onStop={(taskName, minutes) => addLog(taskName, minutes, new Date().toISOString(), "Bấm giờ tự động")} />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginTop: 16 }}>
        <ManualLogForm onSubmit={addLog} />
        <WeekSummaryPanel
          weekLabel={WEEK_LABELS[weekIndex]}
          logs={logs}
          onPrevWeek={() => setWeekIndex((i) => Math.max(0, i - 1))}
          onThisWeek={() => setWeekIndex(1)}
          onNextWeek={() => setWeekIndex((i) => Math.min(WEEK_LABELS.length - 1, i + 1))}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <TaskEstimateTable
          estimates={estimates}
          logs={logs}
          onChangeEstimate={(taskName, hours) =>
            setEstimates((prev) => prev.map((e) => (e.taskName === taskName ? { ...e, estimateHours: hours } : e)))
          }
        />
      </div>
    </AppShellPage>
  );
}
