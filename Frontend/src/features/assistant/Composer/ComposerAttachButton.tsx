import { useRef } from "react";

/**
 * ComposerAttachButton
 * Đính kèm file, liên kết input file ẩn #chatFile.
 * Thẻ HTML gốc: <button class=composer-attach title="Đính kèm file (hỏi trợ lý/cố vấn)">📎</button>
 * CSS gốc tham chiếu: .composer-attach
 */
export interface ComposerAttachButtonProps {
  onFileSelected: (file: File) => void;
}

export function ComposerAttachButton({ onFileSelected }: ComposerAttachButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id="chatFile"
        hidden
        className="sf-hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="composer-attach"
        title="Đính kèm file (hỏi trợ lý/cố vấn)"
        onClick={() => inputRef.current?.click()}
      >
        📎
      </button>
    </>
  );
}
