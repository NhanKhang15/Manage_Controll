import type { ActivityItem, ApprovalItem, DashboardKpiItem, ProjectProgressItem } from "../types/dashboard";

/** Grid KPI chính, giá trị lấy nguyên bản từ HTML gốc (.kpi-grid.dash-kpi). */
export const mainKpis: DashboardKpiItem[] = [
  { id: "late", icon: "⏰", iconBg: "#EF444418", iconColor: "#EF4444", value: 6, label: "Việc trễ hạn", href: "?page=tasks&status=doing" },
  { id: "due-today", icon: "📌", iconBg: "#F59E0B18", iconColor: "#F59E0B", value: 0, label: "Đến hạn hôm nay", href: "?page=tasks" },
  { id: "meetings", icon: "📅", iconBg: "#4F6EF718", iconColor: "#4F6EF7", value: 0, label: "Họp sắp tới", href: "?page=calendar" },
  { id: "projects", icon: "🗂️", iconBg: "#8B5CF618", iconColor: "#8B5CF6", value: 2, label: "Dự án", href: "?page=projects" },
  { id: "approvals", icon: "🖐️", iconBg: "#10B98118", iconColor: "#10B981", value: 3, label: "Chờ duyệt", href: "?page=tasks&tab=approvals" },
];

/** 6 KPI trong panel "Tổng quan Kinh doanh & Marketing", giá trị lấy nguyên bản từ HTML gốc. */
export const businessKpis: DashboardKpiItem[] = [
  { id: "clients", icon: "👥", iconBg: "#0EA5E918", iconColor: "#0EA5E9", value: 11, label: "Khách hàng", href: "?page=clients" },
  { id: "new-clients", icon: "🌱", iconBg: "#F59E0B18", iconColor: "#F59E0B", value: 11, label: "KH mới tháng này", href: "?page=clients" },
  { id: "leads", icon: "📞", iconBg: "#8B5CF618", iconColor: "#8B5CF6", value: 4, label: "Tiềm năng cần chăm", href: "?page=clients" },
  { id: "contracts", icon: "🤝", iconBg: "#10B98118", iconColor: "#10B981", value: 6, label: "Đã có hợp đồng", href: "?page=clients" },
  { id: "running-projects", icon: "🗂️", iconBg: "#4F6EF718", iconColor: "#4F6EF7", value: 2, label: "Dự án đang chạy", href: "?page=projects" },
  { id: "tasks-done", icon: "✅", iconBg: "#06B6D418", iconColor: "#06B6D4", value: 0, label: "Việc xong tháng này", href: "?page=tasks" },
];

/** .dash-row trong panel "Chờ duyệt", khớp attention.ts (cùng nguồn HTML gốc). */
export const approvals: ApprovalItem[] = [
  { id: "a1", title: "Tạm ứng 50% hợp đồng CRM", amount: "425 triệu" },
  { id: "a2", title: "Mua gói API Zalo OA", amount: "15 triệu" },
  { id: "a3", title: "Ngân sách OCR FPT.AI", amount: "12 triệu" },
];

/** .dash-row trong panel "Tiến độ dự án". */
export const projectProgress: ProjectProgressItem[] = [
  { id: "p1", title: "Số hóa quy trình bán hàng", percent: 83, color: "#4F6EF7" },
  { id: "p2", title: "Tuyển dụng & Onboarding", percent: 38, color: "#10B981" },
];

/** .act-row trong panel "Hoạt động gần đây", lấy nguyên bản từ HTML gốc. */
export const recentActivity: ActivityItem[] = [
  { id: "ac1", initials: "XH", avatarBg: "#4F6EF722", avatarColor: "#4F6EF7", name: "Lê Xuân Huy", action: "đăng nhập", detail: "huy@tng.vn", time: "10:50 22/07" },
  { id: "ac2", initials: "XH", avatarBg: "#4F6EF722", avatarColor: "#4F6EF7", name: "Lê Xuân Huy", action: "đăng nhập", detail: "huy@tng.vn", time: "09:44 22/07" },
  { id: "ac3", initials: "JT", avatarBg: "#0D948822", avatarColor: "#0D9488", name: "Joseph Tuấn", action: "đăng nhập", detail: "tuan@tng.vn", time: "08:17 22/07" },
  { id: "ac4", initials: "XH", avatarBg: "#4F6EF722", avatarColor: "#4F6EF7", name: "Lê Xuân Huy", action: "đăng nhập", detail: "huy@tng.vn", time: "22:06 21/07" },
  { id: "ac5", initials: "TL", avatarBg: "#0EA5E922", avatarColor: "#0EA5E9", name: "Nguyễn Thu Lan", action: "tạo việc", detail: "Giao cho @lan", time: "17:04 21/07" },
  { id: "ac6", initials: "TL", avatarBg: "#0EA5E922", avatarColor: "#0EA5E9", name: "Nguyễn Thu Lan", action: "đăng nhập", detail: "lan@tng.vn", time: "16:52 21/07" },
  { id: "ac7", initials: "TL", avatarBg: "#0EA5E922", avatarColor: "#0EA5E9", name: "Nguyễn Thu Lan", action: "cập nhật việc", detail: "task#6=done", time: "16:51 21/07" },
];
