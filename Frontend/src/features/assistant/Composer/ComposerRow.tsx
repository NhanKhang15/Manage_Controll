import { Composer, type ComposerProps } from "./Composer";
import { ComposerSearchButton } from "./ComposerSearchButton";

/**
 * ComposerRow
 * Hàng chứa ô soạn tin nhắn + nút tìm kiếm.
 * Thẻ HTML gốc: <div class=composer-row>
 * CSS gốc tham chiếu: .composer-row
 */
export interface ComposerRowProps extends ComposerProps {
  onSearchClick?: () => void;
}

export function ComposerRow({ onSearchClick, ...composerProps }: ComposerRowProps) {
  return (
    <div className="composer-row">
      <Composer {...composerProps} />
      <ComposerSearchButton onClick={() => onSearchClick?.()} />
    </div>
  );
}
