export interface Person {
  id: string;
  name: string;
  title: string;
  dept: string;
  role: string | null;
  email?: string;
  phone?: string;
  zalo?: string;
  avatarSrc?: string;
  managerId?: string;
  managerName?: string;
  managerTitle?: string;
  directReportsCount: number;
  rating: number;
  level: number;
  points: number;
  likes: number;
  dislikes: number;
  userLiked: boolean;
  userDisliked: boolean;
}

/** role_in_company là dữ liệu seed thô (vd "employee"/"manager") — chuẩn hoá
 * sang nhãn tiếng Việt để hiển thị; giá trị đã là tiếng Việt thì giữ nguyên. */
const ROLE_LABELS: Record<string, string> = {
  manager: "Quản lý",
  employee: "Nhân viên",
};

export function normalizeRoleLabel(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  return ROLE_LABELS[raw.toLowerCase()] ?? raw;
}
