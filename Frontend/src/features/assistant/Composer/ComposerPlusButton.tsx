import { forwardRef } from "react";

/**
 * ComposerPlusButton
 * Mở menu tính năng (giao việc, tạo lịch...).
 * Thẻ HTML gốc: <button class=composer-plus title="Tính năng">＋</button>
 * CSS gốc tham chiếu: .composer-plus
 */
export interface ComposerPlusButtonProps {
  onClick: () => void;
}

export const ComposerPlusButton = forwardRef<HTMLButtonElement, ComposerPlusButtonProps>(function ComposerPlusButton(
  { onClick },
  ref
) {
  return (
    <button type="button" ref={ref} className="composer-plus" title="Tính năng" onClick={onClick}>
      ＋
    </button>
  );
});
