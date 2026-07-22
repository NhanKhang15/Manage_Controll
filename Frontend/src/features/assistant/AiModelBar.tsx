import type { AiModelId } from "../../types/assistant";

/**
 * AiModelBar
 * Thanh chọn AI model trả lời (Tự động / Claude / GPT / Gemini).
 * Thẻ HTML gốc: <div class=ai-model-bar>
 * CSS gốc tham chiếu: .ai-model-bar
 */
export interface AiModelBarProps {
  value: AiModelId;
  onChange: (model: AiModelId) => void;
}

export function AiModelBar({ value, onChange }: AiModelBarProps) {
  return (
    <div className="ai-model-bar">
      <span className="amb-label">🤖 Model:</span>
      <select
        id="aiModel"
        className="ai-model-sel"
        title="Chọn AI trả lời"
        value={value}
        onChange={(e) => onChange(e.target.value as AiModelId)}
      >
        <option value="auto">✨ Tự động (văn bản→Claude · vẽ hình→GPT · nghiên cứu→Gemini)</option>
        <option value="claude">Claude (soạn văn bản, phân tích)</option>
        <option value="gpt">GPT (chat & vẽ hình)</option>
        <option value="gemini">Gemini (nghiên cứu, tra cứu)</option>
      </select>
    </div>
  );
}
