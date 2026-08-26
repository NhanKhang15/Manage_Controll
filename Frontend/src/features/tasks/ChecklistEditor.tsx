import { useState, type FormEvent } from "react";
import type { TaskChecklistItemDto } from "../../api/companies";

export interface ChecklistEditorProps {
  items: TaskChecklistItemDto[];
  onToggle: (item: TaskChecklistItemDto) => void;
  onAdd: (text: string) => void;
  onDelete: (item: TaskChecklistItemDto) => void;
}

/** Checklist con của 1 công việc — % hoàn thành = số mục đã tick / tổng số mục.
 * Dùng chung ở panel Dự án (WorkspaceDetailPanel) và modal chi tiết việc (TaskDetailDrawer). */
export function ChecklistEditor({ items, onToggle, onAdd, onDelete }: ChecklistEditorProps) {
  const [draft, setDraft] = useState("");
  const done = items.filter((i) => i.is_checked).length;

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  }

  return (
    <div>
      <div className="wk-d-lbl">
        ☑️ Checklist{items.length > 0 ? ` (${done}/${items.length} hoàn thành)` : ""}
      </div>
      {items.map((item) => (
        <div className="chk-row" key={item.id}>
          <input
            type="checkbox"
            className="chk-done"
            checked={item.is_checked}
            onChange={() => onToggle(item)}
          />
          <span
            className="chk-title"
            style={item.is_checked ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}
          >
            {item.text}
          </span>
          <button
            type="button"
            className="t-flagbtn"
            title="Xoá mục"
            onClick={() => onDelete(item)}
          >
            ✕
          </button>
        </div>
      ))}
      {items.length === 0 && (
        <div className="muted" style={{ fontSize: 13, padding: "6px 4px" }}>
          Chưa có mục checklist nào.
        </div>
      )}
      <form onSubmit={handleAdd} className="qt-form" style={{ marginTop: 8 }}>
        <input
          type="text"
          placeholder="Thêm mục checklist… (VD: Viết báo cáo)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="btn btn-ghost btn-sm" disabled={!draft.trim()}>
          + Thêm
        </button>
      </form>
    </div>
  );
}
