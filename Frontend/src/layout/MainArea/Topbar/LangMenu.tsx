import type { RefObject } from "react";
import { Dropdown } from "../../../components/ui/Dropdown";

export interface LangOption {
  code: string;
  flag: string;
  label: string;
}

export const LANG_OPTIONS: LangOption[] = [
  { code: "VI", flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "EN", flag: "🇬🇧", label: "English" },
];

/**
 * LangMenu
 * Danh sách ngôn ngữ để chọn. Rỗng trong HTML gốc (JS runtime cũ tự inject).
 * Thẻ HTML gốc: <div id=langMenu class="lang-menu sf-hidden">
 * CSS gốc tham chiếu: .lang-menu, .lang-opt:hover
 */
export interface LangMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  currentLang: string;
  onSelect: (code: string) => void;
}

export function LangMenu({ isOpen, onClose, anchorRef, currentLang, onSelect }: LangMenuProps) {
  return (
    <Dropdown isOpen={isOpen} onClose={onClose} anchorRef={anchorRef} className="lang-menu">
      {LANG_OPTIONS.map((opt) => (
        <div
          key={opt.code}
          className="lang-opt"
          style={opt.code === currentLang ? { color: "var(--brand)", fontWeight: 600 } : undefined}
          onClick={() => {
            onSelect(opt.code);
            onClose();
          }}
        >
          <span>{opt.flag}</span>
          <span>{opt.label}</span>
        </div>
      ))}
    </Dropdown>
  );
}
