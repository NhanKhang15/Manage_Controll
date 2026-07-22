import { Icon } from "../../components/ui/Icon";

/**
 * NavShowMoreToggle
 * Nút "Xem thêm" mở rộng danh sách menu ẩn bớt (có nav-more-chev xoay ▾).
 * Thẻ HTML gốc: <button type=button class="nav-item nav-more-toggle">
 * CSS gốc tham chiếu: .nav-item .nav-more-toggle
 */
export interface NavShowMoreToggleProps {
  expanded: boolean;
  onToggle: () => void;
}

export function NavShowMoreToggle({ expanded, onToggle }: NavShowMoreToggleProps) {
  return (
    <button type="button" className="nav-item nav-more-toggle" onClick={onToggle}>
      <Icon name="nav-more" />
      <span className="nav-label">Xem thêm</span>
      <span className={`nav-more-chev${expanded ? " open" : ""}`}>▾</span>
    </button>
  );
}
