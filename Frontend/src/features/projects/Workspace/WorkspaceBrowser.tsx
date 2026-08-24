import { useState } from "react";
import { DriveConnectBanner } from "./DriveConnectBanner";
import { WorkspaceColumn } from "./WorkspaceColumn";
import { WorkspaceItem } from "./WorkspaceItem";
import { WorkspaceDetailPanel } from "./WorkspaceDetailPanel";
import { useToast } from "../../../components/ui/Toast";
import type { CommentMessage } from "../../../components/ui/CommentThread";
import { currentUser } from "../../../mocks/user";
import type { EmployeeListItem } from "../../../api/employees";
import type { UpdateTaskData } from "../../../api/tasks";
import { STATUS_COLOR, findTaskById, projectColor, type ProjectNode, type ProjectTaskNode, type TaskStatus } from "../types";
import { CreateFolderModal } from "../CreateFolderModal";
import { CreateTaskModal } from "../../tasks/CreateTaskModal";
import { CreateSubtaskModal } from "../../tasks/CreateSubtaskModal";

const LEGAL_ENTITY_NAME = "Pháp nhân";

function formatDueShort(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function makeMessage(text: string): CommentMessage {
  return { id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, author: currentUser.name, text, time: "Vừa xong" };
}

/**
 * WorkspaceBrowser
 * Trình duyệt dự án dạng Miller-column (Pháp nhân › Dự án › Công việc › việc
 * con...) + panel chi tiết bên phải — view "🗂️ Thư mục". Dữ liệu thật (không
 * còn mock), đệ quy sâu tuỳ ý theo Task.parent.
 * CSS gốc tham chiếu: .drive-bar, .workspace, .wk-cols
 */
export interface WorkspaceBrowserProps {
  companyId?: string;
  companyName: string;
  projects: ProjectNode[];
  employees: EmployeeListItem[];
  onCreateProject?: (name: string) => void;
  onCreateTask?: (projectId: string, parentId: string | null, name: string) => void;
  onUpdateTask: (taskId: string, patch: UpdateTaskData) => void;
  onRefetch?: () => void;
}

export function WorkspaceBrowser({
  companyId = "",
  companyName,
  projects,
  employees,
  onUpdateTask,
  onRefetch,
}: WorkspaceBrowserProps) {
  const { showToast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? "");
  const [taskPath, setTaskPath] = useState<string[]>([]);
  const [internalMessages, setInternalMessages] = useState<Record<string, CommentMessage[]>>({});
  const [sharedMessages, setSharedMessages] = useState<Record<string, CommentMessage[]>>({});

  // Modals state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [subtaskParent, setSubtaskParent] = useState<{ id: string; name: string; dueDate?: string | null } | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  function selectProject(id: string) {
    setSelectedProjectId(id);
    setTaskPath([]);
  }

  function selectTaskAt(depth: number, taskId: string) {
    setTaskPath((prev) => [...prev.slice(0, depth), taskId]);
  }

  function sendInternal(nodeKey: string, text: string) {
    setInternalMessages((prev) => ({ ...prev, [nodeKey]: [...(prev[nodeKey] ?? []), makeMessage(text)] }));
  }

  function sendShared(nodeKey: string, text: string) {
    setSharedMessages((prev) => ({ ...prev, [nodeKey]: [...(prev[nodeKey] ?? []), makeMessage(text)] }));
  }

  function handleOpenAddTask(parentTask: ProjectTaskNode | null) {
    if (parentTask) {
      setSubtaskParent({
        id: parentTask.id,
        name: parentTask.title,
        dueDate: parentTask.dueDate,
      });
      setIsSubtaskModalOpen(true);
    } else {
      setIsTaskModalOpen(true);
    }
  }

  // Dựng các cột Miller theo đường đã chọn — mỗi cột là children của node được chọn ở cột trước.
  const columns: { tasks: ProjectTaskNode[]; parentTask: ProjectTaskNode | null }[] = [];
  if (selectedProject) {
    let currentTasks = selectedProject.tasks;
    let parentTask: ProjectTaskNode | null = null;
    for (let depth = 0; ; depth++) {
      columns.push({ tasks: currentTasks, parentTask });
      const selId = taskPath[depth];
      if (!selId) break;
      const selTask = currentTasks.find((t) => t.id === selId);
      if (!selTask || selTask.children.length === 0) break;
      parentTask = selTask;
      currentTasks = selTask.children;
    }
  }

  const deepestTaskId = taskPath[taskPath.length - 1];
  const deepestTask = selectedProject && deepestTaskId ? findTaskById(selectedProject.tasks, deepestTaskId) : null;

  let detail = null;
  if (deepestTask) {
    const nodeKey = `task-${deepestTask.id}`;
    const overdue = deepestTask.dueDate && !deepestTask.completed && deepestTask.dueDate < new Date().toISOString().slice(0, 10)
      ? Math.round((Date.now() - new Date(deepestTask.dueDate).getTime()) / 86400000)
      : null;
    detail = (
      <WorkspaceDetailPanel
        key={nodeKey}
        icon={deepestTask.hasChildren ? "📁" : "📄"}
        breadcrumb={`${LEGAL_ENTITY_NAME} › ${companyName} › ${selectedProject?.name ?? ""}`}
        title={deepestTask.title}
        progress={deepestTask.progressPercent}
        progressColor={STATUS_COLOR[deepestTask.status]}
        statLine={`${deepestTask.status} · ${deepestTask.hasChildren ? `${deepestTask.children.length} việc con` : "Không có việc con"}`}
        members={deepestTask.assigneeNames}
        internalThread={{ messages: internalMessages[nodeKey] ?? [], onSend: (text) => sendInternal(nodeKey, text) }}
        sharedThread={{ messages: sharedMessages[nodeKey] ?? [], onSend: (text) => sendShared(nodeKey, text) }}
        task={{
          status: deepestTask.status,
          onChangeStatus: (s: TaskStatus) => onUpdateTask(deepestTask.id, { status: s, is_completed: s === "Hoàn thành" }),
          dueLabel: deepestTask.dueDate ? formatDueShort(deepestTask.dueDate) : null,
          overdueDays: overdue,
          isMilestone: deepestTask.isMilestone,
          onToggleMilestone: () => onUpdateTask(deepestTask.id, { is_milestone: !deepestTask.isMilestone }),
          effortPoints: deepestTask.effortPoints,
          onChangeEffort: (points) => onUpdateTask(deepestTask.id, { effort_points: points }),
          employees,
          picId: deepestTask.picId,
          onChangePic: (id) => onUpdateTask(deepestTask.id, { pic_id: id }),
          notes: deepestTask.notes,
          onSaveNotes: (text) => onUpdateTask(deepestTask.id, { notes: text }),
        }}
      />
    );
  } else if (selectedProject) {
    const nodeKey = `project-${selectedProject.id}`;
    const flatTasks = columns[0]?.tasks ?? [];
    const doneCount = flatTasks.filter((t) => t.status === "Hoàn thành").length;
    const inProgress = flatTasks.filter((t) => t.status === "Đang làm").length;
    const todo = flatTasks.filter((t) => t.status === "Cần làm" || t.status === "Ý tưởng").length;
    const members = Array.from(new Set(flatTasks.flatMap((t) => t.assigneeNames)));

    detail = (
      <WorkspaceDetailPanel
        key={nodeKey}
        icon="📁"
        breadcrumb={`${LEGAL_ENTITY_NAME} › ${companyName}`}
        title={selectedProject.name}
        progress={selectedProject.progressPercent}
        progressColor={projectColor(selectedProject.name)}
        statLine={`${doneCount}/${flatTasks.length} xong · ${inProgress} đang làm · ${todo} cần làm`}
        members={members}
        internalThread={{ messages: internalMessages[nodeKey] ?? [], onSend: (text) => sendInternal(nodeKey, text) }}
        sharedThread={{ messages: sharedMessages[nodeKey] ?? [], onSend: (text) => sendShared(nodeKey, text) }}
      />
    );
  }

  return (
    <>
      <DriveConnectBanner onConnect={() => showToast("Đang mở kết nối Google Drive...", "default")} />
      <div className="workspace">
        <div className="wk-cols">
          <WorkspaceColumn title="Pháp nhân">
            <WorkspaceItem icon="🏢" title={companyName} active showChevron />
          </WorkspaceColumn>

          <WorkspaceColumn
            title={companyName}
            onAdd={() => setIsFolderModalOpen(true)}
            addTitle="Tạo dự án mới"
          >
            {projects.length === 0 && <div className="mini-empty">Chưa có dự án nào.</div>}
            {projects.map((p) => (
              <WorkspaceItem
                key={p.id}
                icon="📁"
                dotColor={projectColor(p.name)}
                title={p.name}
                pct={`${p.progressPercent}%`}
                active={p.id === selectedProjectId}
                showChevron
                onClick={() => selectProject(p.id)}
              />
            ))}
          </WorkspaceColumn>

          {selectedProject &&
            columns.map((col, depth) => (
              <WorkspaceColumn
                key={col.parentTask?.id ?? `top-${selectedProject.id}`}
                title={col.parentTask?.title ?? selectedProject.name}
                onAdd={() => handleOpenAddTask(col.parentTask)}
                addTitle="Thêm công việc"
              >
                {col.tasks.length === 0 && <div className="mini-empty">Chưa có công việc nào.</div>}
                {col.tasks.map((t) => {
                  const today = new Date().toISOString().slice(0, 10);
                  return (
                    <WorkspaceItem
                      key={t.id}
                      icon={t.hasChildren ? "📁" : "📄"}
                      dotColor={STATUS_COLOR[t.status]}
                      title={t.title}
                      due={t.dueDate ? { label: formatDueShort(t.dueDate), danger: !t.completed && t.dueDate < today } : undefined}
                      avatarName={t.picName ?? t.assigneeNames[0]}
                      active={taskPath[depth] === t.id}
                      onClick={() => selectTaskAt(depth, t.id)}
                    />
                  );
                })}
              </WorkspaceColumn>
            ))}

          {detail}
        </div>
      </div>

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSuccess={() => {
          showToast("Đã tạo dự án / folder thành công!", "success");
          onRefetch?.();
        }}
        companyId={companyId}
        parentName={companyName}
        parentType="company"
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={() => {
          showToast("Đã tạo công việc thành công!", "success");
          onRefetch?.();
        }}
        companyId={companyId}
        defaultProjectId={selectedProject?.id}
        availableProjects={projects.map((p) => ({ id: p.id, name: p.name }))}
        availableEmployees={employees}
      />

      {/* Create Subtask Modal */}
      <CreateSubtaskModal
        isOpen={isSubtaskModalOpen}
        onClose={() => {
          setIsSubtaskModalOpen(false);
          setSubtaskParent(null);
        }}
        onSuccess={() => {
          showToast("Đã tạo việc con thành công!", "success");
          onRefetch?.();
        }}
        parentTask={subtaskParent}
        companyId={companyId}
        availableEmployees={employees}
      />
    </>
  );
}
