import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import type { ProjectOption } from "./types";

export interface QuickAddTaskProps {
  projects: ProjectOption[];
  onCreate: (name: string, projectId: string) => Promise<void>;
}

export function QuickAddTask({ projects, onCreate }: QuickAddTaskProps) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!title.trim() || !projectId || submitting) return;
    setSubmitting(true);
    try {
      await onCreate(title.trim(), projectId);
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Panel>
      <div className="panel-h">➕ Thêm công việc nhanh</div>
      <div className="qt-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tên công việc mới…"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">— Chọn dự án —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!title.trim() || !projectId || submitting}
          onClick={handleCreate}
        >
          {submitting ? "Đang tạo…" : "+ Tạo công việc"}
        </button>
      </div>
    </Panel>
  );
}
