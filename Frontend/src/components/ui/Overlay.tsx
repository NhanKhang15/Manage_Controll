/**
 * Overlay
 * Backdrop mờ phía sau modal/menu, click để đóng.
 * Thẻ HTML gốc: <div id=overlay class="overlay sf-hidden">
 * CSS gốc tham chiếu: .overlay
 */
export interface OverlayProps {
  visible: boolean;
  onClick: () => void;
}

export function Overlay({ visible, onClick }: OverlayProps) {
  if (!visible) return null;
  return <div className="overlay" onClick={onClick} />;
}
