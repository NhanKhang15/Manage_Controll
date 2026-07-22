export interface ProjectTaskItem {
  id: string;
  projectId: string;
  parentId?: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  start: string;
  end: string;
  progress: number;
  assignee: string;
}

/**
 * Task chi tiết cho từng dự án trong mocks/projects.ts — phục vụ các view
 * Kanban/Timeline/Lộ trình/Mindmap/Danh sách. HTML gốc chỉ capture được view
 * "Thư mục" mặc định nên đây là data mẫu tự thiết kế, khớp deadline/progress
 * đã có trong mockProjects.
 */
export const projectTasks: ProjectTaskItem[] = [
  // proj-1: Nâng cấp hệ thống Vela AI Core 2.0 (deadline 30/08/2026, 75%)
  { id: "pt-1", projectId: "proj-1", title: "Phân tích yêu cầu tích hợp đa AI", status: "done", start: "2026-06-01", end: "2026-06-15", progress: 100, assignee: "Nguyễn Văn Khang" },
  { id: "pt-2", projectId: "proj-1", title: "Xây dựng module Claude", status: "done", start: "2026-06-10", end: "2026-07-05", progress: 100, assignee: "Trần Minh Tâm" },
  { id: "pt-3", projectId: "proj-1", title: "Xây dựng module GPT", status: "in_progress", start: "2026-07-01", end: "2026-07-28", progress: 60, assignee: "Lê Hoàng Nam" },
  { id: "pt-3a", projectId: "proj-1", parentId: "pt-3", title: "Viết unit test GPT module", status: "in_progress", start: "2026-07-15", end: "2026-07-28", progress: 40, assignee: "Lê Hoàng Nam" },
  { id: "pt-4", projectId: "proj-1", title: "Xây dựng module Gemini", status: "todo", start: "2026-07-20", end: "2026-08-10", progress: 10, assignee: "Phạm Hải Yến" },
  { id: "pt-5", projectId: "proj-1", title: "Kiểm thử tích hợp toàn hệ thống", status: "review", start: "2026-08-10", end: "2026-08-25", progress: 0, assignee: "Nguyễn Văn Khang" },
  { id: "pt-6", projectId: "proj-1", title: "Triển khai production", status: "todo", start: "2026-08-25", end: "2026-08-30", progress: 0, assignee: "Trần Minh Tâm" },

  // proj-2: Chuẩn hóa quy trình TNG Flow (deadline 15/07/2026, 100% — đã xong)
  { id: "pt-7", projectId: "proj-2", title: "Thiết kế luồng phê duyệt", status: "done", start: "2026-05-01", end: "2026-05-20", progress: 100, assignee: "Trần Minh Tâm" },
  { id: "pt-8", projectId: "proj-2", title: "Xây dựng workflow engine", status: "done", start: "2026-05-15", end: "2026-06-20", progress: 100, assignee: "Nguyễn Văn Khang" },
  { id: "pt-9", projectId: "proj-2", title: "Tích hợp chấm công tự động", status: "done", start: "2026-06-01", end: "2026-07-01", progress: 100, assignee: "Lê Hoàng Nam" },
  { id: "pt-10", projectId: "proj-2", title: "Đào tạo người dùng", status: "done", start: "2026-07-01", end: "2026-07-15", progress: 100, assignee: "Phạm Hải Yến" },

  // proj-3: Cổng thông tin nhân sự & OKR Quý 3 (deadline 10/09/2026, 40%, chậm tiến độ)
  { id: "pt-11", projectId: "proj-3", title: "Thu thập mục tiêu từng phòng ban", status: "done", start: "2026-06-15", end: "2026-07-01", progress: 100, assignee: "Phạm Hải Yến" },
  { id: "pt-12", projectId: "proj-3", title: "Thiết kế cây mục tiêu OKR", status: "in_progress", start: "2026-07-01", end: "2026-07-25", progress: 50, assignee: "Phạm Hải Yến" },
  { id: "pt-12a", projectId: "proj-3", parentId: "pt-12", title: "Vẽ sơ đồ mindmap OKR", status: "in_progress", start: "2026-07-10", end: "2026-07-25", progress: 30, assignee: "Nguyễn Văn Khang" },
  { id: "pt-13", projectId: "proj-3", title: "Xây dựng bảng xếp hạng thi đua", status: "todo", start: "2026-07-25", end: "2026-08-15", progress: 0, assignee: "Trần Minh Tâm" },
  { id: "pt-14", projectId: "proj-3", title: "Kết nối dữ liệu chấm công", status: "todo", start: "2026-08-01", end: "2026-08-20", progress: 0, assignee: "Lê Hoàng Nam" },
  { id: "pt-15", projectId: "proj-3", title: "Kiểm thử & go-live", status: "todo", start: "2026-08-20", end: "2026-09-10", progress: 0, assignee: "Phạm Hải Yến" },
];
