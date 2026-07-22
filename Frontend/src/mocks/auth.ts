import type { AuthLanguage, DemoAccount, Department } from "../types/auth";

/** Thứ tự & nội dung lấy nguyên bản từ .login-lang trong HTML gốc. */
export const authLanguages: AuthLanguage[] = [
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
];

/** 6 tài khoản dùng thử trong .login-demo, thứ tự lấy nguyên bản từ HTML gốc. */
export const demoAccounts: DemoAccount[] = [
  { name: "Lê Xuân Huy", role: "Giám đốc" },
  { name: "Trần Hữu Thành", role: "Chủ tịch HĐQT" },
  { name: "Joseph Tuấn", role: "CPO" },
  { name: "Nguyễn Tài Chính", role: "Giám đốc Tài chính (CFO)" },
  { name: "Nguyễn Thu Lan", role: "Trưởng nhóm Tech" },
  { name: "Hoàng Sơn", role: "Trưởng phòng KD" },
];

/** Danh sách phòng ban trong form đăng ký, thứ tự lấy nguyên bản từ HTML gốc. */
export const departments: Department[] = [
  { id: 1, label: "Ban Giám đốc" },
  { id: 2, label: "Công nghệ" },
  { id: 3, label: "Kinh doanh" },
  { id: 9, label: "Kế toán" },
  { id: 4, label: "Marketing" },
  { id: 8, label: "Nhân sự" },
  { id: 5, label: "Sales" },
  { id: 7, label: "Sản phẩm" },
  { id: 6, label: "Vận hành" },
];
