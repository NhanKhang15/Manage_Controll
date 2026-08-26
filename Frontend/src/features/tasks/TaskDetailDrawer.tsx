import { useEffect, useState } from "react";
import { getTaskDetail, updateTask, addChecklistItem, updateChecklistItem, deleteChecklistItem } from "../../api/tasks";
import { getEmployees, type EmployeeListItem } from "../../api/employees";
import { WorkspaceDetailPanel } from "../projects/Workspace/WorkspaceDetailPanel";
import { toTaskNode, STATUS_COLOR, type ProjectTaskNode, type TaskStatus } from "../projects/types";
import type { TaskChecklistItemDto } from "../../api/companies";
import { useToast } from "../../components/ui/Toast";

export interface TaskDetailDrawerProps {
  taskId: string | null;
  companyId: string | null;
  onClose: () => void;
  onChanged: () => void;
}

function formatDueShort(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

/** Modal chi tiết 1 công việc cho tab "Công việc" — tái dùng WorkspaceDetailPanel
 * (vốn chỉ hiện ở trang Dự án) để có đủ PIC/trạng thái/độ khó/ghi chú/checklist. */
export function TaskDetailDrawer({ taskId, companyId, onClose, onChanged }: TaskDetailDrawerProps) {
  const { showToast } = useToast();
  const [node, setNode] = useState<ProjectTaskNode | null>(null);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(false);

  function reload(id: string) {
    setLoading(true);
    getTaskDetail(id)
      .then((raw) => setNode(toTaskNode(raw, "")))
      .catch(() => showToast("Không tải được chi tiết công việc", "danger"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!taskId) {
      setNode(null);
      return;
    }
    reload(taskId);
    if (companyId) getEmployees(companyId, { compact: true }).then(setEmployees).catch(() => setEmployees([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, companyId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && taskId) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [taskId, onClose]);

  if (!taskId) return null;

  function patch(data: Parameters<typeof updateTask>[1]) {
    updateTask(taskId as string, data)
      .then(() => {
        reload(taskId as string);
        onChanged();
      })
      .catch(() => showToast("Cập nhật công việc thất bại", "danger"));
  }

  function refreshChecklist() {
    reload(taskId as string);
    onChanged();
  }

  function handleToggleItem(item: TaskChecklistItemDto) {
    updateChecklistItem(item.id, { is_checked: !item.is_checked })
      .then(refreshChecklist)
      .catch(() => showToast("Không cập nhật được checklist", "danger"));
  }

  function handleAddItem(text: string) {
    addChecklistItem(taskId as string, text)
      .then(refreshChecklist)
      .catch(() => showToast("Không thêm được mục checklist", "danger"));
  }

  function handleDeleteItem(item: TaskChecklistItemDto) {
    deleteChecklistItem(item.id)
      .then(refreshChecklist)
      .catch(() => showToast("Không xoá được mục checklist", "danger"));
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span>Chi tiết công việc</span>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        {loading && !node && <div style={{ padding: "24px 0", textAlign: "center" }}>Đang tải...</div>}
        {!loading && !node && <div style={{ padding: "24px 0", textAlign: "center" }}>Không tìm thấy công việc.</div>}

        {node && (
          <WorkspaceDetailPanel
            icon={node.hasChildren ? "📁" : "📄"}
            breadcrumb="Công việc"
            title={node.title}
            progress={node.progressPercent}
            progressColor={STATUS_COLOR[node.status]}
            statLine={`${node.status} · ${node.hasChildren ? `${node.children.length} việc con` : "Không có việc con"}`}
            members={node.assigneeNames}
            internalThread={{ messages: [], onSend: () => {} }}
            sharedThread={{ messages: [], onSend: () => {} }}
            task={{
              status: node.status,
              onChangeStatus: (s: TaskStatus) => patch({ status: s, is_completed: s === "Hoàn thành" }),
              dueLabel: node.dueDate ? formatDueShort(node.dueDate) : null,
              overdueDays:
                node.dueDate && !node.completed && node.dueDate < new Date().toISOString().slice(0, 10)
                  ? Math.round((Date.now() - new Date(node.dueDate).getTime()) / 86400000)
                  : null,
              isMilestone: node.isMilestone,
              onToggleMilestone: () => patch({ is_milestone: !node.isMilestone }),
              effortPoints: node.effortPoints,
              onChangeEffort: (points) => patch({ effort_points: points }),
              employees,
              picId: node.picId,
              onChangePic: (id) => patch({ pic_id: id }),
              notes: node.notes,
              onSaveNotes: (text) => patch({ notes: text }),
              checklist: node.checklist,
              onToggleChecklistItem: handleToggleItem,
              onAddChecklistItem: handleAddItem,
              onDeleteChecklistItem: handleDeleteItem,
            }}
          />
        )}
      </div>
    </div>
  );
}
