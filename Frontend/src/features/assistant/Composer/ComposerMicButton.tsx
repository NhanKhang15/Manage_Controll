/**
 * ComposerMicButton
 * Ra lệnh bằng giọng nói.
 * Thẻ HTML gốc: <button class=composer-mic title="Ra lệnh bằng giọng nói">🎤</button>
 * CSS gốc tham chiếu: .composer-mic, .composer-mic.recording
 */
export interface ComposerMicButtonProps {
  recording: boolean;
  onClick: () => void;
}

export function ComposerMicButton({ recording, onClick }: ComposerMicButtonProps) {
  return (
    <button
      type="button"
      className={`composer-mic${recording ? " recording" : ""}`}
      title="Ra lệnh bằng giọng nói"
      onClick={onClick}
    >
      🎤
    </button>
  );
}
