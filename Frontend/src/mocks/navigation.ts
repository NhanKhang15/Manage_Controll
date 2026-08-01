import type { NavItemData } from "../types/assistant";

/**
 * Danh sách nav chính, thứ tự và icon lấy nguyên bản từ HTML gốc (.nav .nav-item).
 * href đã chuyển sang dạng đường dẫn URL thật (dùng react-router-dom).
 */
export const mainNavItems: NavItemData[] = [
  { id: "assistant", label: "Trợ lý", href: "/assistant", icon: "assistant", active: true },
  { id: "dashboard", label: "Bảng điều hành", href: "/dashboard", icon: "dashboard" },
  { id: "tasks", label: "Công việc", href: "/tasks", icon: "tasks" },
  { id: "projects", label: "Dự án", href: "/projects", icon: "projects" },
  { id: "calendar", label: "Lịch", href: "/calendar", icon: "calendar" },
  { id: "events", label: "Sự kiện", href: "/events", icon: "events" },
  { id: "wiki", label: "Tài liệu", href: "/wiki", icon: "wiki" },
  { id: "okr", label: "Mục tiêu", href: "/okr", icon: "okr" },
  { id: "time", label: "Chấm giờ", href: "/time", icon: "time" },
  { id: "templates", label: "Mẫu việc", href: "/templates", icon: "templates" },
  { id: "leaderboard", label: "Xếp hạng", href: "/leaderboard", icon: "leaderboard" },
  { id: "honor", label: "Bảng vàng", href: "/honor", icon: "honor" },
  { id: "payroll", label: "Bảng lương", href: "/payroll", icon: "payroll" },
  { id: "clients", label: "Khách hàng", href: "/clients", icon: "clients" },
  { id: "performance", label: "Hiệu suất", href: "/performance", icon: "performance" },
  { id: "people", label: "Nhân sự", href: "/people", icon: "people" },
  { id: "recruitment", label: "Tuyển dụng", href: "/recruitment", icon: "recruitment" },
  { id: "connections", label: "Kết nối", href: "/connections", icon: "connections" },
  { id: "settings", label: "Thiết lập", href: "/settings", icon: "settings" },
];

/**
 * Nav phụ hiện khi bấm "Xem thêm". Rỗng trong HTML gốc (JS runtime cũ tự inject
 * theo quyền user) — để trống mặc định, thêm mục khi có yêu cầu thực tế.
 */
export const moreNavItems: NavItemData[] = [
  { id: "offboarding", label: "Nghỉ việc / Bàn giao", href: "/offboarding", icon: "people" },
  { id: "ai-finance", label: "Tài chính AI", href: "/ai-finance", icon: "dashboard" },
  { id: "profile", label: "Hồ sơ của tôi", href: "/profile", icon: "people" },
  { id: "documents", label: "Văn bản của tôi", href: "/documents", icon: "wiki" },
  { id: "leave", label: "Nghỉ phép", href: "/leave", icon: "calendar" },
  { id: "time-attendance", label: "Chấm công", href: "/time-attendance", icon: "time" },
  { id: "proposals", label: "Đề xuất & duyệt", href: "/proposals", icon: "tasks" },
  { id: "reports", label: "Báo cáo", href: "/reports", icon: "dashboard" },
  { id: "statistics", label: "Thống kê", href: "/statistics", icon: "dashboard" },
  { id: "automations", label: "Luồng tự động", href: "/automations", icon: "assistant" },
  { id: "levels", label: "Cấp bậc & công thức", href: "/levels", icon: "settings" },
];
