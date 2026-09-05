import { useState, useEffect, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import {
  getTaskTemplates,
  createTaskTemplate,
  deleteTaskTemplate,
  getRecurringTasks,
  createRecurringTask,
  deleteRecurringTask,
  getTaskDependencies,
  createTaskDependency,
  deleteTaskDependency,
  type TaskTemplateItem,
  type RecurringTaskItem,
  type TaskDependencyItem,
} from "../api/taskTemplates";

export function TemplatesPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<{ id: string; name: string }[]>([]);

  // Panel 1: Templates state
  const [templates, setTemplates] = useState<TaskTemplateItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplTitle, setTplTitle] = useState("");
  const [tplDesc, setTplDesc] = useState("");
  const [tplPriority, setTplPriority] = useState<"low" | "med" | "high">("med");
  const [tplEstHours, setTplEstHours] = useState(0);
  const [tplSubtasks, setTplSubtasks] = useState("");

  // Panel 2: Recurring tasks state
  const [recurringList, setRecurringList] = useState<RecurringTaskItem[]>([]);
  const [recurTaskId, setRecurTaskId] = useState("");
  const [recurCycle, setRecurCycle] = useState<"" | "daily" | "weekly" | "monthly">("");
  const [recurUntil, setRecurUntil] = useState("");

  // Panel 3: Dependencies state
  const [depList, setDepList] = useState<TaskDependencyItem[]>([]);
  const [depTaskId, setDepTaskId] = useState("");
  const [depDependsOnId, setDepDependsOnId] = useState("");

  useEffect(() => {
    // Fetch task list for options
    apiFetch<any[]>("/companies/")
      .then((companies) => {
        const extractedTasks: { id: string; name: string }[] = [];
        const extractNodes = (nodes: any[]) => {
          for (const node of nodes || []) {
            if (node.type === "task") {
              extractedTasks.push({ id: node.id, name: node.name });
            }
            if (node.children) extractNodes(node.children);
          }
        };
        extractNodes(companies);
        setTasks(extractedTasks);
      })
      .catch(() => setTasks([]));
  }, []);

  useEffect(() => {
    if (!companyId) return;
    Promise.all([getTaskTemplates(companyId), getRecurringTasks(companyId), getTaskDependencies(companyId)])
      .then(([tpls, recur, deps]) => {
        setTemplates(tpls);
        setRecurringList(recur);
        setDepList(deps);
      })
      .catch(() => showToast("Không tải được dữ liệu mẫu việc", "danger"));
  }, [companyId, showToast]);

  // Handle Save Template
  function handleCreateTemplate(e: FormEvent) {
    e.preventDefault();
    if (!tplName.trim() || !companyId) return;

    createTaskTemplate(companyId, {
      name: tplName.trim(),
      title: tplTitle.trim() || tplName.trim(),
      description: tplDesc.trim(),
      priority: tplPriority,
      est_hours: Number(tplEstHours) || 0,
      subtasks: tplSubtasks.split("\n").map((s) => s.trim()).filter(Boolean),
    })
      .then((tpl) => {
        setTemplates((prev) => [tpl, ...prev]);
        setTplName("");
        setTplTitle("");
        setTplDesc("");
        setTplPriority("med");
        setTplEstHours(0);
        setTplSubtasks("");
        setIsFormOpen(false);
        showToast("Đã lưu mẫu công việc mới", "success");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Lưu mẫu thất bại", "danger"));
  }

  function handleDeleteTemplate(id: string) {
    deleteTaskTemplate(id)
      .then(() => {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        showToast("Đã xóa mẫu", "default");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Xóa mẫu thất bại", "danger"));
  }

  // Handle Recurring Task
  function handleAddRecurring(e: FormEvent) {
    e.preventDefault();
    if (!recurTaskId || !companyId) {
      showToast("Vui lòng chọn việc cần lặp", "default");
      return;
    }
    if (!recurCycle) {
      showToast("Vui lòng chọn chu kỳ lặp", "default");
      return;
    }
    createRecurringTask(companyId, { task_id: recurTaskId, recurrence: recurCycle, recur_until: recurUntil || null })
      .then((item) => {
        setRecurringList((prev) => [...prev, item]);
        setRecurTaskId("");
        setRecurCycle("");
        setRecurUntil("");
        showToast("Đã thiết lập lặp định kỳ", "success");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Đặt lặp thất bại", "danger"));
  }

  function handleDeleteRecurring(id: string) {
    deleteRecurringTask(id)
      .then(() => {
        setRecurringList((prev) => prev.filter((r) => r.id !== id));
        showToast("Đã hủy đặt lặp", "default");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Hủy lặp thất bại", "danger"));
  }

  // Handle Dependency
  function handleAddDependency(e: FormEvent) {
    e.preventDefault();
    if (!depTaskId || !depDependsOnId || !companyId) {
      showToast("Vui lòng chọn đủ 2 công việc phụ thuộc", "default");
      return;
    }
    if (depTaskId === depDependsOnId) {
      showToast("Một việc không thể tự phụ thuộc vào chính nó", "default");
      return;
    }
    createTaskDependency(companyId, { task_id: depTaskId, depends_on_id: depDependsOnId })
      .then((item) => {
        setDepList((prev) => [...prev, item]);
        setDepTaskId("");
        setDepDependsOnId("");
        showToast("Đã khai báo phụ thuộc công việc", "success");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Khai báo phụ thuộc thất bại", "danger"));
  }

  function handleDeleteDependency(id: string) {
    deleteTaskDependency(id)
      .then(() => {
        setDepList((prev) => prev.filter((d) => d.id !== id));
        showToast("Đã xóa phụ thuộc", "default");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Xóa phụ thuộc thất bại", "danger"));
  }

  return (
    <AppShellPage initialNavId="templates">
      <div className="page-head">
        <h1>🧩 Mẫu việc · Lặp lịch · Phụ thuộc</h1>
        <p className="page-sub">
          Chuẩn hoá quy trình lặp lại: tạo việc từ <b>mẫu</b> (kèm subtask), đặt việc <b>lặp định kỳ</b>, và khai báo <b>phụ thuộc</b> giữa các việc.
        </p>
      </div>

      {/* Panel 1: Mẫu công việc */}
      <Panel>
        <div className="panel-h">📋 Mẫu công việc</div>
        {templates.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>
            Chưa có mẫu nào. Tạo mẫu bên dưới để tái sử dụng cho các quy trình lặp lại (onboarding, làm nội dung, xuất hoá đơn…).
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{tpl.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {tpl.title} • {tpl.subtasks.length} subtasks • {tpl.est_hours}h
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(tpl.id)}>
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        )}

        <details open={isFormOpen} style={{ marginTop: 6 }}>
          <summary
            className="muted"
            style={{ cursor: "pointer", fontSize: 13, userSelect: "none" }}
            onClick={(e) => {
              e.preventDefault();
              setIsFormOpen(!isFormOpen);
            }}
          >
            ➕ Tạo mẫu mới
          </summary>
          {isFormOpen && (
            <form onSubmit={handleCreateTemplate} className="settings-form" style={{ maxWidth: 640, marginTop: 10 }}>
              <label>
                Tên mẫu <span className="text-red-500">*</span>
                <input
                  type="text"
                  required
                  placeholder="VD: Quy trình viết bài blog"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                />
              </label>
              <label>
                Tiêu đề việc tạo ra
                <input
                  type="text"
                  placeholder="VD: Viết & xuất bản 1 bài blog"
                  value={tplTitle}
                  onChange={(e) => setTplTitle(e.target.value)}
                />
              </label>
              <label>
                Mô tả
                <input
                  type="text"
                  placeholder="Ghi chú cho người thực hiện…"
                  value={tplDesc}
                  onChange={(e) => setTplDesc(e.target.value)}
                />
              </label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={{ flex: 1, minWidth: 150 }}>
                  Ưu tiên
                  <select value={tplPriority} onChange={(e) => setTplPriority(e.target.value as any)}>
                    <option value="low">Thấp</option>
                    <option value="med">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </label>
                <label style={{ flex: 1, minWidth: 150 }}>
                  Ước lượng (giờ)
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    value={tplEstHours}
                    onChange={(e) => setTplEstHours(Number(e.target.value))}
                  />
                </label>
              </div>
              <label>
                Subtask (mỗi dòng 1 việc con)
                <textarea
                  rows={4}
                  placeholder={`Nghiên cứu chủ đề\nViết bản nháp\nBiên tập & SEO\nXuất bản`}
                  value={tplSubtasks}
                  onChange={(e) => setTplSubtasks(e.target.value)}
                />
              </label>
              <Button variant="primary" type="submit" style={{ alignSelf: "flex-start" }}>
                💾 Lưu mẫu
              </Button>
            </form>
          )}
        </details>
      </Panel>

      {/* Panel 2: Việc lặp định kỳ */}
      <Panel>
        <div className="panel-h">
          🔁 Việc lặp định kỳ{" "}
          <small className="muted" style={{ fontWeight: 400, fontSize: 13 }}>
            (khi đánh dấu hoàn thành, hệ thống tự tạo lần kế tiếp với hạn dời theo chu kỳ)
          </small>
        </div>
        <form onSubmit={handleAddRecurring} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
          <label style={{ flex: 2, minWidth: 220, fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            Chọn việc
            <select
              required
              value={recurTaskId}
              onChange={(e) => setRecurTaskId(e.target.value)}
              style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
            >
              <option value="">— Việc —</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            Chu kỳ
            <select
              value={recurCycle}
              onChange={(e) => setRecurCycle(e.target.value as any)}
              style={{ padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
            >
              <option value="">Tắt lặp</option>
              <option value="daily">Hằng ngày</option>
              <option value="weekly">Hằng tuần</option>
              <option value="monthly">Hằng tháng</option>
            </select>
          </label>
          <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            Lặp đến (tuỳ chọn)
            <input
              type="date"
              value={recurUntil}
              onChange={(e) => setRecurUntil(e.target.value)}
              style={{ padding: "5px 8px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
            />
          </label>
          <Button variant="primary" size="sm" type="submit">
            Đặt lặp
          </Button>
        </form>

        {recurringList.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>
            Chưa có việc lặp nào.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {recurringList.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <div>
                  <b>{item.task_title}</b> • Chu kỳ:{" "}
                  <span className="text-indigo-600 font-medium">
                    {item.recurrence === "daily" ? "Hằng ngày" : item.recurrence === "weekly" ? "Hằng tuần" : "Hằng tháng"}
                  </span>
                  {item.recur_until ? ` (đến ${item.recur_until})` : ""}
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteRecurring(item.id)}>
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Panel 3: Phụ thuộc giữa các việc */}
      <Panel>
        <div className="panel-h">
          🔗 Phụ thuộc giữa các việc{" "}
          <small className="muted" style={{ fontWeight: 400, fontSize: 13 }}>
            (việc bị chặn không thể chuyển sang "Đang làm"/"Xong" cho tới khi việc phụ thuộc hoàn thành)
          </small>
        </div>
        <form onSubmit={handleAddDependency} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
          <label style={{ flex: 1, minWidth: 220, fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            Việc
            <select
              required
              value={depTaskId}
              onChange={(e) => setDepTaskId(e.target.value)}
              style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
            >
              <option value="">— Việc bị phụ thuộc —</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <span className="muted" style={{ alignSelf: "center", fontSize: 13, marginBottom: 6 }}>
            phụ thuộc vào →
          </span>
          <label style={{ flex: 1, minWidth: 220, fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            Phải xong trước
            <select
              required
              value={depDependsOnId}
              onChange={(e) => setDepDependsOnId(e.target.value)}
              style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}
            >
              <option value="">— Việc chặn —</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <Button variant="primary" size="sm" type="submit">
            🔗 Thêm phụ thuộc
          </Button>
        </form>

        {depList.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>
            Chưa khai báo phụ thuộc nào.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {depList.map((dep) => (
              <div
                key={dep.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <div>
                  <b>{dep.task_title}</b> <span className="muted">phụ thuộc vào →</span> <b>{dep.depends_on_title}</b>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteDependency(dep.id)}>
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShellPage>
  );
}
