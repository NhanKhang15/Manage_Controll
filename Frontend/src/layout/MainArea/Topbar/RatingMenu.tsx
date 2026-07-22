import type { RefObject } from "react";
import { Dropdown } from "../../../components/ui/Dropdown";

/**
 * RatingMenu
 * Chi tiết xếp loại/điểm thành tích. Rỗng trong HTML gốc (JS runtime cũ tự inject).
 * Thẻ HTML gốc: <div id=ratingMenu class="rating-menu sf-hidden">
 * CSS gốc tham chiếu: .rating-menu, .rt-star, .rt-hrow
 */
export interface RatingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  rating: number;
  level: number;
  achievementPoints: number;
}

const CRITERIA = [
  { label: "Kỷ luật", value: 4.8 },
  { label: "Hiệu suất", value: 4.5 },
  { label: "Hợp tác", value: 4.6 },
];

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75;
  return (
    <span className="rt-stars">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < full;
        const half = !filled && i === full && hasHalf;
        return (
          <span key={i} className={`rt-star${filled ? " full" : ""}${half ? " half" : ""}`}>
            ★
          </span>
        );
      })}
    </span>
  );
}

export function RatingMenu({ isOpen, onClose, anchorRef, rating, level, achievementPoints }: RatingMenuProps) {
  return (
    <Dropdown isOpen={isOpen} onClose={onClose} anchorRef={anchorRef} className="rating-menu">
      <div className="rt-head">
        <span className="rt-score">{rating.toFixed(1)}</span>
        <div>
          <Stars value={rating} />
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Level {level} · {achievementPoints} điểm</div>
        </div>
      </div>
      {CRITERIA.map((c) => (
        <div key={c.label} className="rt-hrow">
          <span>{c.label}</span>
          <Stars value={c.value} />
        </div>
      ))}
    </Dropdown>
  );
}
