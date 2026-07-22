/**
 * HeroStats
 * Các chỉ số nhanh: ⭐ rating/Level, 👥 số nhân viên quản lý, 🏆 điểm thành tích.
 * Thẻ HTML gốc: <div class=hero-stats>
 * CSS gốc tham chiếu: .hero-stats, .hs-item
 */
export interface HeroStatsProps {
  rating: number;
  level: number;
  managedStaff: number;
  achievementPoints: number;
}

export function HeroStats({ rating, level, managedStaff, achievementPoints }: HeroStatsProps) {
  return (
    <div className="hero-stats">
      <span className="hs-item">
        ⭐ <b>{rating.toFixed(1)}</b>/5 · Level {level}
      </span>
      <span className="hs-item">
        👥 Quản lý <b>{managedStaff}</b> nhân viên
      </span>
      <span className="hs-item">
        🏆 <b>{achievementPoints}</b> điểm thành tích
      </span>
    </div>
  );
}
