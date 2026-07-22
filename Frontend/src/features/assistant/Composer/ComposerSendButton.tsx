/**
 * ComposerSendButton
 * Nút gửi tin nhắn (↑).
 * Thẻ HTML gốc: <button class=composer-send title=Gửi>↑</button>
 * CSS gốc tham chiếu: .composer-send
 */
export interface ComposerSendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function ComposerSendButton({ onClick, disabled }: ComposerSendButtonProps) {
  return (
    <button type="button" className="composer-send" title="Gửi" onClick={onClick} disabled={disabled}>
      ↑
    </button>
  );
}
