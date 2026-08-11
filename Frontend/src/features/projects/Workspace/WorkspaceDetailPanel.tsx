import { useState } from "react";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { MemberChipList } from "../../../components/ui/MemberChipList";
import { CommentThread, type CommentMessage } from "../../../components/ui/CommentThread";
import { Button } from "../../../components/ui/Button";
import { TASK_STATUSES, EFFORT_LABEL, type TaskStatus } from "../types";
import type { EmployeeListItem } from "../../../api/employees";

export interface WorkspaceRevenueProps {
  value: number | null;
  onSave: (value: number) => void;
}

export interface WorkspaceThreadProps {
  messages: CommentMessage[];
  onSend: (text: string) => void;
}

export interface WorkspaceTaskControls {
  status: TaskStatus;
  onChangeStatus: (status: TaskStatus) => void;
  dueLabel: string | null;
  overdueDays: number | null;
  isMilestone: boolean;
  onToggleMilestone: () => void;
  effortPoints: number | null;
  onChangeEffort: (points: number) => void;
  employees: EmployeeListItem[];
  picId: string | null;
  onChangePic: (id: string | null) => void;
  notes: string;
  onSaveNotes: (text: string) => void;
}

export interface WorkspaceDetailPanelProps {
  icon: string;
  breadcrumb: string;
  title: string;
  progress: number;
  progressColor: string;
  statLine: string;
  revenue?: WorkspaceRevenueProps;
  members: string[];
  internalThread: WorkspaceThreadProps;
  sharedThread: WorkspaceThreadProps;
  task?: WorkspaceTaskControls;
}

function formatRevenue(value: number): string {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

export function WorkspaceDetailPanel({
  icon,
  breadcrumb,
  title,
  progress,
  progressColor,
  statLine,
  revenue,
  members,
  internalThread,
  sharedThread,
  task,
}: WorkspaceDetailPanelProps) {
  const [revenueDraft, setRevenueDraft] = useState(() => String(revenue?.value ?? 0));
  const [notesDraft, setNotesDraft] = useState(task?.notes ?? "");
  const [editingNotes, setEditingNotes] = useState(false);

  return (
    <div className="wk-detail">
      <div className="wk-d-head">
        <span className="wk-d-ico">{icon}</span>
        <div>
          <div className="wk-d-crumb">{breadcrumb}</div>
          <h2 className="wk-d-title">{title}</h2>
        </div>
      </div>

      {task && (
        <div className="wk-d-sec" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TASK_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm${s === task.status ? " btn-primary" : " btn-ghost"}`}
              onClick={() => task.onChangeStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="wk-d-sec">
        <div className="wk-d-lbl">
          Tiến độ {task ? "(tự tổng hợp từ việc con)" : ""} <b className="wk-d-pct">{progress}%</b>
        </div>
        <ProgressBar progress={progress} color={progressColor} size="big" />
        <div className="proj-stat-line">{statLine}</div>
      </div>

      {task && (
        <>
          <div className="wk-d-sec">
            <div className="wk-d-lbl">👤 Người phụ trách (PIC)</div>
            <select
              className="ai-model-sel"
              style={{ width: "100%" }}
              value={task.picId ?? ""}
              onChange={(e) => task.onChangePic(e.target.value || null)}
            >
              <option value="">— Chưa gán —</option>
              {task.employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name}
                  {e.primary_department_name ? ` · ${e.primary_department_name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="wk-d-sec">
            {task.dueLabel && (
              <div className={task.overdueDays ? "muted" : "muted"} style={{ color: task.overdueDays ? "#EF4444" : undefined, fontSize: 13, marginBottom: 8 }}>
                📅 Hết hạn: {task.dueLabel}
                {task.overdueDays ? ` (trễ ${task.overdueDays} ngày)` : ""}
              </div>
            )}
            <button type="button" className={`btn btn-sm${task.isMilestone ? " btn-primary" : " btn-ghost"}`} onClick={task.onToggleMilestone}>
              🚩 {task.isMilestone ? "Đã đánh dấu cột mốc" : "Đánh dấu cột mốc"}
            </button>
          </div>

          <div className="wk-d-sec">
            <div className="wk-d-lbl">🔥 Độ khó (tính điểm nỗ lực cho Hiệu suất)</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(EFFORT_LABEL).map(([pts, label]) => (
                <button
                  key={pts}
                  type="button"
                  className={`btn btn-sm${task.effortPoints === Number(pts) ? " btn-primary" : " btn-ghost"}`}
                  onClick={() => task.onChangeEffort(Number(pts))}
                >
                  {label} {pts}đ
                </button>
              ))}
            </div>
          </div>

          <div className="wk-d-sec">
            <div className="wk-d-lbl">📝 Ghi chú (**đậm**, *nghiêng*, - danh sách, #tag)</div>
            {editingNotes ? (
              <>
                <textarea
                  rows={4}
                  style={{ width: "100%", font: "inherit" }}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                />
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      task.onSaveNotes(notesDraft);
                      setEditingNotes(false);
                    }}
                  >
                    Lưu
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>
                    Huỷ
                  </Button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="wk-d-notes"
                style={{ textAlign: "left", width: "100%", cursor: "pointer", background: "none", border: "none", font: "inherit", color: "inherit" }}
                onClick={() => {
                  setNotesDraft(task.notes);
                  setEditingNotes(true);
                }}
              >
                {task.notes || "Chưa có ghi chú. Bấm để thêm…"}
              </button>
            )}
          </div>
        </>
      )}

      {revenue && (
        <div className="wk-d-sec">
          <div className="wk-d-lbl">💵 Doanh thu / Giá trị hợp đồng dự án</div>
          <div className="proj-rev-row">
            <input
              type="text"
              inputMode="numeric"
              value={revenueDraft}
              onChange={(e) => setRevenueDraft(e.target.value)}
              placeholder="VD: 200000000"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const parsed = Number(revenueDraft.replace(/\D/g, ""));
                if (!Number.isNaN(parsed)) revenue.onSave(parsed);
              }}
            >
              Lưu
            </Button>
            <span className="muted proj-rev-fmt">
              {revenue.value ? formatRevenue(revenue.value) : "Chưa nhập"}
            </span>
          </div>
          <p className="muted" style={{ fontSize: 12, margin: "4px 0 0" }}>
            Dùng để quy doanh thu &amp; tính đóng góp từng người ở trang Hiệu suất.
          </p>
        </div>
      )}

      <div className="wk-d-sec">
        <div className="wk-d-lbl">👥 Thành viên tham gia ({members.length})</div>
        <MemberChipList members={members} />
      </div>

      <div className="wk-d-sec">
        <div className="wk-d-lbl">
          🔒 Trao đổi nội bộ <small className="muted">(chỉ nhân viên thấy)</small>
        </div>
        <CommentThread
          messages={internalThread.messages}
          onSend={internalThread.onSend}
          emptyText="Chưa có trao đổi nội bộ."
          placeholder="Ghi chú/nội bộ…"
        />
      </div>

      <div className="wk-d-sec">
        <div className="wk-d-lbl">
          💬 Trao đổi với khách <small className="muted">(gắn khách hàng để chia sẻ với họ)</small>
        </div>
        <CommentThread
          messages={sharedThread.messages}
          onSend={sharedThread.onSend}
          emptyText="Chưa có trao đổi với khách."
          placeholder="Nội dung trao đổi với khách…"
        />
      </div>
    </div>
  );
}
