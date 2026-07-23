import type { WikiPage } from "../types/wiki";

export const mockWikiPages: WikiPage[] = [
  {
    id: "wiki-1",
    title: "📘 Sổ tay công ty",
    content:
      "Quy trình onboarding nhân viên mới:\n1. Ký hợp đồng & nhận tài khoản hệ thống.\n2. Đào tạo hội nhập 3 ngày với phòng Nhân sự.\n3. Gán mentor theo dõi trong 30 ngày đầu.",
    author: "Lê Xuân Huy",
    updatedAt: "20/07/2026",
  },
  {
    id: "wiki-2",
    title: "📗 SOP bán hàng",
    content:
      "Quy trình xử lý đơn hàng:\n1. Tiếp nhận yêu cầu từ khách trên CRM.\n2. Báo giá & xác nhận trong 24h.\n3. Chuyển bộ phận vận hành xử lý đơn.",
    author: "Trần Minh Tâm",
    updatedAt: "18/07/2026",
  },
];
