export interface ProjectMockItem {
  id: string;
  name: string;
  code: string;
  description: string;
  progress: number;
  membersCount: number;
  tasksCount: number;
  deadline: string;
  status: "running" | "completed" | "delayed";
  lead: string;
}

export const mockProjects: ProjectMockItem[] = [
  {
    id: "proj-1",
    name: "Nâng cấp hệ thống Vela AI Core 2.0",
    code: "VELA-CORE",
    description: "Tích hợp trợ lý AI thông minh, hỗ trợ đa mô hình Claude, GPT và Gemini.",
    progress: 75,
    membersCount: 8,
    tasksCount: 24,
    deadline: "30/08/2026",
    status: "running",
    lead: "Nguyễn Văn Khang",
  },
  {
    id: "proj-2",
    name: "Chuẩn hóa quy trình TNG Flow",
    code: "TNG-FLOW",
    description: "Tự động hóa luồng phê duyệt và chấm công toàn hệ thống.",
    progress: 100,
    membersCount: 12,
    tasksCount: 38,
    deadline: "15/07/2026",
    status: "completed",
    lead: "Trần Minh Tâm",
  },
  {
    id: "proj-3",
    name: "Cổng thông tin nhân sự & OKR Quý 3",
    code: "HR-OKR",
    description: "Xây dựng cây mục tiêu OKR và bảng xếp hạng thi đua.",
    progress: 40,
    membersCount: 5,
    tasksCount: 15,
    deadline: "10/09/2026",
    status: "delayed",
    lead: "Phạm Hải Yến",
  },
];
