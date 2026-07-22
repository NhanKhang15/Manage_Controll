export interface TaskMockItem {
  id: string;
  code: string;
  title: string;
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  status: "todo" | "in_progress" | "done" | "review";
  priority: "high" | "medium" | "low";
  project: string;
}

export const mockTasks: TaskMockItem[] = [
  {
    id: "task-1",
    code: "VELA-101",
    title: "Phân tích và tối ưu hóa hiệu năng ứng dụng React",
    assignee: { name: "Nguyễn Văn Khang", avatar: "K" },
    dueDate: "22/07/2026",
    status: "in_progress",
    priority: "high",
    project: "Hệ thống Vela AI",
  },
  {
    id: "task-2",
    code: "VELA-102",
    title: "Thiết kế bộ khung UI cho các trang Sidebar",
    assignee: { name: "Trần Minh Tâm", avatar: "T" },
    dueDate: "23/07/2026",
    status: "review",
    priority: "high",
    project: "Hệ thống Vela AI",
  },
  {
    id: "task-3",
    code: "VELA-103",
    title: "Tích hợp FullCalendar vào trang Lịch làm việc",
    assignee: { name: "Lê Hoàng Nam", avatar: "N" },
    dueDate: "24/07/2026",
    status: "done",
    priority: "medium",
    project: "TNG Flow Core",
  },
  {
    id: "task-4",
    code: "VELA-104",
    title: "Kiểm thử API đăng nhập & phân quyền SSO",
    assignee: { name: "Phạm Hải Yến", avatar: "Y" },
    dueDate: "25/07/2026",
    status: "todo",
    priority: "low",
    project: "TNG Flow Core",
  },
  {
    id: "task-5",
    code: "VELA-105",
    title: "Xây dựng sơ đồ cây mục tiêu OKR quý 3",
    assignee: { name: "Nguyễn Văn Khang", avatar: "K" },
    dueDate: "28/07/2026",
    status: "todo",
    priority: "medium",
    project: "Chiến lược Quý 3",
  },
];
