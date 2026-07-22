import { useRef, useState } from "react";
import { LangMenu, LANG_OPTIONS } from "./LangMenu";

/**
 * LanguageSwitcher
 * Cờ VI + mã ngôn ngữ + dropdown chọn ngôn ngữ.
 * Thẻ HTML gốc: <div class=lang title="Ngôn ngữ">
 * CSS gốc tham chiếu: .lang
 */
export interface LanguageSwitcherProps {
  currentLang: string;
  onChange: (lang: string) => void;
}

export function LanguageSwitcher({ currentLang, onChange }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANG_OPTIONS.find((o) => o.code === currentLang) ?? LANG_OPTIONS[0];

  return (
    <div className="lang" title="Ngôn ngữ" ref={ref} onClick={() => setOpen((v) => !v)}>
      <span className="lang-flag">{current.flag}</span>
      <span className="lang-code">{current.code}</span>
      <span className="chev">▾</span>
      <LangMenu isOpen={open} onClose={() => setOpen(false)} anchorRef={ref} currentLang={currentLang} onSelect={onChange} />
    </div>
  );
}
