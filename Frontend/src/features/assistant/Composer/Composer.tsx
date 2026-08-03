import { useRef, useState } from "react";
import { ComposerPlusButton } from "./ComposerPlusButton";
import { ComposerAttachButton } from "./ComposerAttachButton";
import { ComposerMicButton } from "./ComposerMicButton";
import { ComposerInput } from "./ComposerInput";
import { ComposerSendButton } from "./ComposerSendButton";
import { FeatureMenu, type FeatureOption } from "./FeatureMenu";

/**
 * Composer
 * Ô nhập chat: nút +, đính kèm file, mic, input text, nút gửi, feature menu.
 * Thẻ HTML gốc: <div class=composer>
 * CSS gốc tham chiếu: .composer
 */
export interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onAttachFile?: (file: File) => void;
  onSelectFeature?: (option: FeatureOption) => void;
  disabled?: boolean;
}

export function Composer({ value, onChange, onSend, onAttachFile, onSelectFeature, disabled }: ComposerProps) {
  const [featureMenuOpen, setFeatureMenuOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const plusBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="composer">
      <ComposerPlusButton ref={plusBtnRef} onClick={() => setFeatureMenuOpen((v) => !v)} />
      <ComposerAttachButton onFileSelected={(file) => onAttachFile?.(file)} />
      <ComposerMicButton recording={recording} onClick={() => setRecording((v) => !v)} />
      <ComposerInput
        value={value}
        onChange={onChange}
        placeholder="Hỏi bất kỳ điều gì, hoặc bấm ＋ để giao việc, tạo lịch…"
        onEnter={onSend}
        disabled={disabled}
      />
      <ComposerSendButton onClick={onSend} disabled={value.trim().length === 0 || !!disabled} />
      <FeatureMenu
        isOpen={featureMenuOpen}
        onClose={() => setFeatureMenuOpen(false)}
        anchorRef={plusBtnRef}
        onSelect={(opt) => onSelectFeature?.(opt)}
      />
    </div>
  );
}
