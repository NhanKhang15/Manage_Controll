export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
}

/**
 * .notif-menu rỗng trong HTML gốc (JS runtime cũ tự inject theo user) — mock
 * hợp lý theo ngữ cảnh app quản lý công việc.
 */
export const notifications: NotificationItem[] = [
  { id: "n1", title: "Nguyễn Văn A vừa hoàn thành \"Báo cáo tháng 7\"", time: "5 phút trước", read: false },
  { id: "n2", title: "Bạn có 1 việc cần duyệt trước 17:00 hôm nay", time: "1 giờ trước", read: true },
  { id: "n3", title: "Dự án \"Website TNG\" vừa cập nhật tiến độ", time: "Hôm qua", read: true },
];
