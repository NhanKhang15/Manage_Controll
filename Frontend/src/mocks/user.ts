import type { UserProfile } from "../types/assistant";

/**
 * User hiện tại, giá trị lấy nguyên bản từ HTML gốc (.user-card, .hero).
 */
export const currentUser: UserProfile = {
  employeeId: "1",
  name: "Lê Xuân Huy",
  role: "BOD / Giám đốc",
  avatarUrl: "/avatar-placeholder.svg",
  rating: 4.6,
  level: 1,
  managedStaff: 4,
  achievementPoints: 309,
};
