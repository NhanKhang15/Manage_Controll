import { HeroStats } from "./HeroStats";

/**
 * HeroBody
 * Ngày giờ + chức vụ (.hero-date), tiêu đề chào (.hero-title), thống kê
 * (.hero-stats), lời nhắn việc cần làm (.hero-sub), câu trích dẫn (.hero-quote).
 * Thẻ HTML gốc: <div class=hero-body>
 * CSS gốc tham chiếu: .hero-body
 */
export interface HeroBodyProps {
  dateLabel: string;
  roleLabel: string;
  userName: string;
  greeting: string;
  pendingTasksCount: number;
  quote: string;
  rating: number;
  level: number;
  managedStaff: number;
  achievementPoints: number;
}

export function HeroBody({
  dateLabel,
  roleLabel,
  userName,
  greeting,
  pendingTasksCount,
  quote,
  rating,
  level,
  managedStaff,
  achievementPoints,
}: HeroBodyProps) {
  return (
    <div className="hero-body">
      <div className="hero-date">
        {dateLabel} · {roleLabel}
      </div>
      <h1 className="hero-title">
        {greeting}, {userName} 👋
      </h1>
      <HeroStats rating={rating} level={level} managedStaff={managedStaff} achievementPoints={achievementPoints} />
      <p className="hero-sub">
        Anh/chị có <b>{pendingTasksCount}</b> việc cần để ý hôm nay, em gom gọn phía dưới. Cần gì cứ hỏi em.
      </p>
      <p className="hero-quote">{quote}</p>
    </div>
  );
}
