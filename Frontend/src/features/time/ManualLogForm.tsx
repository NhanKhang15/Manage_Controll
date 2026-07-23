import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { trackedTaskNames } from "../../mocks/timeTracking";

export interface ManualLogFormProps {
  onSubmit: (taskName: string, minutes: number, date: string, note: string) => void;
}

export function ManualLogForm({ onSubmit }: ManualLogFormProps) {
  const [taskName, setTaskName] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  function handleSubmit() {
    if (!taskName || hours * 60 + minutes <= 0) return;
    onSubmit(taskName, hours * 60 + minutes, date, note.trim());
    setNote("");
  }

  return (
    <Panel title="✍️ Log công thủ công" style={{ flex: 1, minWidth: 300 }}>
      <form className="settings-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <label>
          Task
          <select value={taskName} onChange={(e) => setTaskName(e.target.value)} required>
            <option value="">— Chọn task —</option>
            {trackedTaskNames.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ flex: 1, minWidth: 90 }}>
            Giờ
            <input type="number" min={0} max={24} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </label>
          <label style={{ flex: 1, minWidth: 90 }}>
            Phút
            <input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
          </label>
          <label style={{ flex: 1, minWidth: 140 }}>
            Ngày
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <label>
          Ghi chú
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Làm gì trong thời gian này…" />
        </label>
        <Button variant="primary" type="submit">
          ➕ Lưu công
        </Button>
      </form>
    </Panel>
  );
}
