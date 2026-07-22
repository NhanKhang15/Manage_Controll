import type { AttnCategory, AttentionItem } from "../types/assistant";

/**
 * Data khớp với KPI "Chờ duyệt" (3) và "Việc trễ hạn" (6) thấy ở trang Bảng
 * điều hành / Công việc trong raw-html — tổng 9, đúng "9 việc cần để ý hôm nay".
 */
export const attentionCategories: AttnCategory[] = [
  { key: "approve", label: "Cần duyệt", count: 3 },
  { key: "late", label: "Trễ hạn", count: 6 },
];

export const attentionItems: AttentionItem[] = [
  { id: "a1", category: "approve", title: "Tạm ứng 50% hợp đồng CRM", meta: "425 triệu" },
  { id: "a2", category: "approve", title: "Mua gói API Zalo OA", meta: "15 triệu" },
  { id: "a3", category: "approve", title: "Ngân sách OCR FPT.AI", meta: "12 triệu" },
  { id: "l1", category: "late", title: "Tập huấn đội Sales", meta: "Trễ 13 ngày" },
  { id: "l2", category: "late", title: "Soạn tài liệu hướng dẫn", meta: "Trễ 9 ngày" },
  { id: "l3", category: "late", title: "Thu thập & nhập liệu KH", meta: "Trễ 7 ngày" },
  { id: "l4", category: "late", title: "Đồng bộ sàn TMĐT (Shopee/Lazada)", meta: "Trễ 5 ngày" },
  { id: "l5", category: "late", title: "Kết nối Zalo OA vào CRM", meta: "Trễ 4 ngày" },
  { id: "l6", category: "late", title: "Báo cáo & Dashboard doanh số", meta: "Trễ 2 ngày" },
];
