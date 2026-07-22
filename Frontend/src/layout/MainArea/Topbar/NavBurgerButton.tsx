/**
 * NavBurgerButton
 * Nút ☰ mở sidebar trên mobile.
 * Thẻ HTML gốc: <button class=nav-burger aria-label=Menu>☰</button>
 * CSS gốc tham chiếu: .nav-burger
 */
export interface NavBurgerButtonProps {
  onClick: () => void;
}

export function NavBurgerButton({ onClick }: NavBurgerButtonProps) {
  return (
    <button type="button" className="nav-burger" aria-label="Menu" onClick={onClick}>
      ☰
    </button>
  );
}
