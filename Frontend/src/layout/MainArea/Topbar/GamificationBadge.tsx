import { useRef, useState } from "react";
import { RatingMenu } from "./RatingMenu";

/**
 * GamificationBadge
 * Hiển thị điểm đánh giá (★ 4.6/5 · Level 1) + trạng thái online, click mở rating-menu.
 * Thẻ HTML gốc: <div class=gami title="Xếp loại của tôi">
 * CSS gốc tham chiếu: .gami
 */
export interface GamificationBadgeProps {
  rating: number;
  level: number;
  online: boolean;
  achievementPoints: number;
}

export function GamificationBadge({ rating, level, online, achievementPoints }: GamificationBadgeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="gami" title="Xếp loại của tôi" ref={ref} onClick={() => setOpen((v) => !v)}>
      <span className="star">★</span>
      <span className="gami-meta">
        <b>{rating.toFixed(1)} / 5</b>
        <small>Level {level}</small>
      </span>
      {online && <span className="online" />}
      <RatingMenu
        isOpen={open}
        onClose={() => setOpen(false)}
        anchorRef={ref}
        rating={rating}
        level={level}
        achievementPoints={achievementPoints}
      />
    </div>
  );
}
