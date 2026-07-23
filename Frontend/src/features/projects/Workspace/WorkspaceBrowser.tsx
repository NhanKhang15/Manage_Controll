import { useState } from "react";
import { DriveConnectBanner } from "./DriveConnectBanner";
import { WorkspaceColumn } from "./WorkspaceColumn";
import { WorkspaceItem } from "./WorkspaceItem";
import { WorkspaceDetailPanel } from "./WorkspaceDetailPanel";
import type { CommentMessage } from "../../../components/ui/CommentThread";
import { useToast } from "../../../components/ui/Toast";
import { currentUser } from "../../../mocks/user";
import type { ProjectMockItem } from "../../../mocks/projects";
import type { ProjectTaskItem } from "../../../mocks/projectTasks";

const LEGAL_ENTITY_NAME = "Vela AI — Pháp nhân";

const STATUS_COLOR: Record<ProjectTaskItem["status"], string> = {
  todo: "#AEB6C4",
  in_progress: "#F59E0B",
  review: "#8B5CF6",
  done: "#10B981",
};

const STATUS_LABEL: Record<ProjectTaskItem["status"], string> = {
  todo: "Cần làm",
  in_progress: "Đang làm",
  review: "Cần duyệt",
  done: "Hoàn thành",
};

const DOT_PALETTE = ["#4F6EF7", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#0EA5E9"];

function colorForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return DOT_PALETTE[hash % DOT_PALETTE.length];
}

function formatDueShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}-${m}`;
}

function makeMessage(text: string): CommentMessage {
  return { id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, author: currentUser.name, text, time: "Vừa xong" };
}

/**
 * WorkspaceBrowser
 * Trình duyệt dự án dạng Miller-column (Pháp nhân › Dự án › Công việc) +
 * panel chi tiết bên phải — view "🗂️ Thư mục".
 * CSS gốc tham chiếu: .drive-bar, .workspace, .wk-cols
 */
export interface WorkspaceBrowserProps {
  projects: ProjectMockItem[];
  tasks: ProjectTaskItem[];
}

export function WorkspaceBrowser({ projects, tasks }: WorkspaceBrowserProps) {
  const { showToast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? "");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [revenues, setRevenues] = useState<Record<string, number>>({});
  const [internalMessages, setInternalMessages] = useState<Record<string, CommentMessage[]>>({});
  const [sharedMessages, setSharedMessages] = useState<Record<string, CommentMessage[]>>({});

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;
  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);
  const topLevelTasks = projectTasks.filter((t) => !t.parentId);
  const selectedTask = selectedTaskId ? projectTasks.find((t) => t.id === selectedTaskId) ?? null : null;

  function selectProject(id: string) {
    setSelectedProjectId(id);
    setSelectedTaskId(null);
  }

  function sendInternal(nodeKey: string, text: string) {
    setInternalMessages((prev) => ({ ...prev, [nodeKey]: [...(prev[nodeKey] ?? []), makeMessage(text)] }));
  }

  function sendShared(nodeKey: string, text: string) {
    setSharedMessages((prev) => ({ ...prev, [nodeKey]: [...(prev[nodeKey] ?? []), makeMessage(text)] }));
  }

  let detail = null;
  if (selectedTask) {
    const hasChildren = projectTasks.some((t) => t.parentId === selectedTask.id);
    const nodeKey = `task-${selectedTask.id}`;
    detail = (
      <WorkspaceDetailPanel
        key={nodeKey}
        icon={hasChildren ? "📁" : "📄"}
        breadcrumb={`${LEGAL_ENTITY_NAME} › ${selectedProject?.name ?? ""}`}
        title={selectedTask.title}
        progress={selectedTask.progress}
        progressColor={STATUS_COLOR[selectedTask.status]}
        statLine={`${STATUS_LABEL[selectedTask.status]} · Hạn ${formatDueShort(selectedTask.end)}`}
        members={[selectedTask.assignee]}
        internalThread={{ messages: internalMessages[nodeKey] ?? [], onSend: (text) => sendInternal(nodeKey, text) }}
        sharedThread={{ messages: sharedMessages[nodeKey] ?? [], onSend: (text) => sendShared(nodeKey, text) }}
      />
    );
  } else if (selectedProject) {
    const nodeKey = `project-${selectedProject.id}`;
    const done = projectTasks.filter((t) => t.status === "done").length;
    const inProgress = projectTasks.filter((t) => t.status === "in_progress" || t.status === "review").length;
    const todo = projectTasks.filter((t) => t.status === "todo").length;
    const members = Array.from(new Set(projectTasks.map((t) => t.assignee)));

    detail = (
      <WorkspaceDetailPanel
        key={nodeKey}
        icon="📁"
        breadcrumb={LEGAL_ENTITY_NAME}
        title={selectedProject.name}
        notes={selectedProject.description}
        progress={selectedProject.progress}
        progressColor={colorForKey(selectedProject.name)}
        statLine={`${done}/${projectTasks.length} xong · ${inProgress} đang làm · ${todo} cần làm`}
        revenue={{ value: revenues[selectedProject.id] ?? null, onSave: (value) => setRevenues((prev) => ({ ...prev, [selectedProject.id]: value })) }}
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
            <WorkspaceItem icon="🏢" title={LEGAL_ENTITY_NAME} active showChevron />
          </WorkspaceColumn>

          <WorkspaceColumn title={LEGAL_ENTITY_NAME} onAdd={() => showToast("Đang mở form tạo dự án mới...", "default")} addTitle="Tạo dự án mới">
            {projects.map((p) => (
              <WorkspaceItem
                key={p.id}
                icon="📁"
                dotColor={colorForKey(p.name)}
                title={p.name}
                pct={`${p.progress}%`}
                active={p.id === selectedProjectId}
                showChevron
                onClick={() => selectProject(p.id)}
              />
            ))}
          </WorkspaceColumn>

          {selectedProject && (
            <WorkspaceColumn title={selectedProject.name} onAdd={() => showToast("Đang mở form thêm công việc...", "default")} addTitle="Thêm công việc">
              {topLevelTasks.length === 0 && <div className="mini-empty">Chưa có công việc nào.</div>}
              {topLevelTasks.map((t) => {
                const hasChildren = projectTasks.some((c) => c.parentId === t.id);
                const today = new Date().toISOString().slice(0, 10);
                return (
                  <WorkspaceItem
                    key={t.id}
                    icon={hasChildren ? "📁" : "📄"}
                    dotColor={STATUS_COLOR[t.status]}
                    title={t.title}
                    due={{ label: formatDueShort(t.end), danger: t.status !== "done" && t.end < today }}
                    avatarName={t.assignee}
                    active={t.id === selectedTaskId}
                    onClick={() => setSelectedTaskId(t.id)}
                  />
                );
              })}
            </WorkspaceColumn>
          )}

          {detail}
        </div>
      </div>
    </>
  );
}
