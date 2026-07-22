/**
 * FileChip
 * Hiển thị chip file đã đính kèm trước khi gửi, có nút xoá.
 * Thẻ HTML gốc: <div id=fileChip class="file-chip sf-hidden">
 * CSS gốc tham chiếu: .file-chip
 */
export interface FileChipProps {
  fileName: string;
  onRemove: () => void;
}

export function FileChip({ fileName, onRemove }: FileChipProps) {
  return (
    <div className="file-chip" id="fileChip">
      <span>📎 {fileName}</span>
      <button
        type="button"
        onClick={onRemove}
        style={{ border: "none", background: "none", color: "inherit", cursor: "pointer", fontSize: 13 }}
        aria-label="Xoá file"
      >
        ✕
      </button>
    </div>
  );
}
