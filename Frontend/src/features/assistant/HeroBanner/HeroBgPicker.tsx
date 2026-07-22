import type { RefObject } from "react";
import { Dropdown } from "../../../components/ui/Dropdown";

export interface BgPreset {
  id: string;
  label: string;
  background: string;
}

export const BG_PRESETS: BgPreset[] = [
  { id: "default", label: "Mặc định", background: "linear-gradient(135deg, #EEF1FE 0%, #F7F9FF 45%, #FDF0F7 100%)" },
  { id: "sunrise", label: "Bình minh", background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)" },
  { id: "ocean", label: "Đại dương", background: "linear-gradient(135deg, #ECFEFF 0%, #E0F2FE 100%)" },
  { id: "mint", label: "Bạc hà", background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)" },
];

/**
 * HeroBgPicker
 * Bảng chọn preset màu/ảnh nền cho hero. Rỗng trong HTML gốc (JS runtime cũ tự
 * inject) — mock 4 preset gradient + nút tải ảnh lên.
 * Thẻ HTML gốc: <div id=bgPicker class="hero-bg-picker sf-hidden">
 * CSS gốc tham chiếu: .hero-bg-picker, .bg-upload:hover
 */
export interface HeroBgPickerProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  onSelectPreset: (preset: BgPreset) => void;
  onUploadClick: () => void;
}

export function HeroBgPicker({ isOpen, onClose, anchorRef, onSelectPreset, onUploadClick }: HeroBgPickerProps) {
  return (
    <Dropdown isOpen={isOpen} onClose={onClose} anchorRef={anchorRef} className="hero-bg-picker">
      <div className="bg-preset-grid">
        {BG_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="bg-preset"
            title={preset.label}
            style={{ background: preset.background }}
            onClick={() => {
              onSelectPreset(preset);
              onClose();
            }}
          />
        ))}
      </div>
      <button
        type="button"
        className="bg-upload"
        onClick={() => {
          onUploadClick();
          onClose();
        }}
      >
        📁 Tải ảnh lên
      </button>
    </Dropdown>
  );
}
