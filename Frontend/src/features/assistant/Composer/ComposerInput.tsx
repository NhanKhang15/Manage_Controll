/**
 * ComposerInput
 * Ô nhập text chat, placeholder "Hỏi bất kỳ điều gì...".
 * Thẻ HTML gốc: <input id=chatIn class=composer-input autocomplete=off>
 * CSS gốc tham chiếu: .composer-input
 */
export interface ComposerInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onEnter?: () => void;
  disabled?: boolean;
}

export function ComposerInput({ value, onChange, placeholder, onEnter, disabled }: ComposerInputProps) {
  return (
    <input
      id="chatIn"
      className="composer-input"
      autoComplete="off"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onEnter?.();
        }
      }}
    />
  );
}
