import { forwardRef } from "react";

/**
 * HeroBgPickerButton
 * Nút 🎨 mở bảng chọn màu nền hero.
 * Thẻ HTML gốc: <button class=hero-bg-btn title="Đổi nền">🎨</button>
 * CSS gốc tham chiếu: .hero-bg-btn
 */
export interface HeroBgPickerButtonProps {
  onClick: () => void;
}

export const HeroBgPickerButton = forwardRef<HTMLButtonElement, HeroBgPickerButtonProps>(function HeroBgPickerButton(
  { onClick },
  ref
) {
  return (
    <button type="button" ref={ref} className="hero-bg-btn" title="Đổi nền" onClick={onClick}>
      🎨
    </button>
  );
});
