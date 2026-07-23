import type { Objective } from "../types/okr";

export const departments = [
  "Ban Giám đốc",
  "Công nghệ",
  "Kinh doanh",
  "Kế toán",
  "Marketing",
  "Nhân sự",
  "Sales",
  "Sản phẩm",
  "Vận hành",
];

export const DEPT_COLOR: Record<string, string> = {
  "Ban Giám đốc": "#4F6EF7",
  "Công nghệ": "#0EA5E9",
  "Kinh doanh": "#10B981",
  "Kế toán": "#F59E0B",
  Marketing: "#EC4899",
  "Nhân sự": "#8B5CF6",
  Sales: "#10B981",
  "Sản phẩm": "#0D9488",
  "Vận hành": "#AEB6C4",
};

export const mockObjectives: Objective[] = [
  {
    id: "obj-1",
    title: "Tăng tốc triển khai Vela AI Core cho khách hàng nội bộ",
    period: "Q3/2026",
    department: "Công nghệ",
    owner: "Nguyễn Văn Khang",
    keyResults: [
      { id: "kr-1", title: "Hoàn thành tích hợp Claude + GPT + Gemini", current: 2, target: 3 },
      { id: "kr-2", title: "Giảm thời gian phản hồi trợ lý xuống < 2s", current: 2.4, target: 2 },
      { id: "kr-3", title: "Đạt 90% người dùng nội bộ hài lòng", current: 62, target: 90 },
    ],
  },
  {
    id: "obj-2",
    title: "Tăng trưởng doanh thu quý 3",
    period: "Q3/2026",
    department: "Kinh doanh",
    owner: "Phạm Hải Yến",
    keyResults: [
      { id: "kr-4", title: "Ký mới 15 hợp đồng doanh nghiệp", current: 6, target: 15 },
      { id: "kr-5", title: "Tăng doanh thu 20% so với Q2", current: 12, target: 20 },
    ],
  },
];
