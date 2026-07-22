import { useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { TaskHeader } from "../features/tasks/TaskHeader";
import { TaskFilterTabs } from "../features/tasks/TaskFilterTabs";
import { TaskTable } from "../features/tasks/TaskTable";
import { useToast } from "../components/ui/Toast";
import { mockTasks, type TaskMockItem } from "../mocks/tasks";

export function TasksPage() {
  const [tasks] = useState<TaskMockItem[]>(mockTasks);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  const filteredTasks = tasks.filter((t) => {
    const matchesTab = activeTab === "all" || t.status === activeTab;
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <AppShellPage initialNavId="tasks">
      <TaskHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateTask={() => showToast("Đang mở form tạo công việc mới...", "default")}
      />
      <TaskFilterTabs activeTab={activeTab} onChangeTab={setActiveTab} counts={counts} />
      <TaskTable
        tasks={filteredTasks}
        onSelectTask={(task) => showToast(`Chi tiết công việc: ${task.code} - ${task.title}`, "default")}
      />
    </AppShellPage>
  );
}
