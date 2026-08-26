import { Panel } from "../../components/ui/Panel";
import type { TaskItem } from "./types";

export interface TaskChecklistProps {
  tasks: TaskItem[];
  onToggle: (task: TaskItem) => void;
  onFlagProblem: (task: TaskItem) => void;
}

/** Panel checklist: N việc "của tôi" (mình là PIC hoặc người phối hợp) gần đến hạn
 * nhất, chưa xong — xem my_tasks_view (Backend/tasks/views.py). Tick hoàn thành sẽ
 * PATCH is_completed, tự động báo cho những người liên quan (notify_task_event). */
export function TaskChecklist({ tasks, onToggle, onFlagProblem }: TaskChecklistProps) {
  if (tasks.length === 0) return null;

  return (
    <Panel>
      <div className="panel-h">
        ✅ Checklist của tôi{" "}
        <small className="muted">
          ({tasks.length} việc gần đến hạn nhất bạn phụ trách, tick để đánh dấu hoàn thành)
        </small>
      </div>
      {tasks.map((task) => (
        <div className="chk-row" key={task.id}>
          <input
            type="checkbox"
            className="chk-done"
            title="Đánh dấu hoàn thành"
            checked={false}
            onChange={() => onToggle(task)}
          />
          <span className="chk-title">{task.title}</span>
          {task.projectName && (
            <span className="chip">
              <span className="pdot" style={{ background: task.projectColor }} />
              {task.projectName}
            </span>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onFlagProblem(task)}>
            ⚠️ Vấn đề
          </button>
        </div>
      ))}
    </Panel>
  );
}
