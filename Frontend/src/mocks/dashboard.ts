import type { DashboardKpiItem } from "../types/dashboard";

/**
 * businessKpisHardcoded — 4 KPI kinh doanh CRM (Khách hàng, KH mới, Tiềm năng,
 * Hợp đồng) CHƯA có model thật trong DB (Phase 3, chưa làm — xem plan Dashboard).
 * "Dự án đang chạy" và "Việc xong tháng này" đã lấy dữ liệu thật, tính trong
 * DashboardPage.tsx, không còn ở đây.
 */
export const businessKpisHardcoded: DashboardKpiItem[] = [
  { id: "clients", icon: "👥", iconBg: "#0EA5E918", iconColor: "#0EA5E9", value: 11, label: "Khách hàng", href: "/clients" },
  { id: "new-clients", icon: "🌱", iconBg: "#F59E0B18", iconColor: "#F59E0B", value: 11, label: "KH mới tháng này", href: "/clients" },
  { id: "leads", icon: "📞", iconBg: "#8B5CF618", iconColor: "#8B5CF6", value: 4, label: "Tiềm năng cần chăm", href: "/clients" },
  { id: "contracts", icon: "🤝", iconBg: "#10B98118", iconColor: "#10B981", value: 6, label: "Đã có hợp đồng", href: "/clients" },
];
