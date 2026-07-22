import { Icon } from "../../../components/ui/Icon";

/**
 * ComposerSearchButton
 * Nút tìm kiếm bên cạnh composer.
 * Thẻ HTML gốc: <button class=composer-search title="Tìm kiếm">
 * CSS gốc tham chiếu: .composer-search
 */
export interface ComposerSearchButtonProps {
  onClick: () => void;
}

export function ComposerSearchButton({ onClick }: ComposerSearchButtonProps) {
  return (
    <button type="button" className="composer-search" title="Tìm kiếm" onClick={onClick}>
      <Icon name="search" />
    </button>
  );
}
