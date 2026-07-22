const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

/** Định dạng "Thứ Tư, 22/07/2026" giống .hero-date trong HTML gốc. */
export function formatVietnameseDate(date: Date): string {
  const weekday = WEEKDAYS[date.getDay()];
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${weekday}, ${dd}/${mm}/${yyyy}`;
}

/** "Chào buổi sáng/chiều/tối" theo giờ hiện tại, giống .hero-title trong HTML gốc. */
export function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}
