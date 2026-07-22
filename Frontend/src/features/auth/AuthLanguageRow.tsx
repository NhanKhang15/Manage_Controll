import { authLanguages } from "../../mocks/auth";

/**
 * AuthLanguageRow
 * Hàng chọn ngôn ngữ trên trang đăng nhập (🇻🇳🇬🇧🇯🇵).
 * Thẻ HTML gốc: <div class=login-lang>
 * CSS gốc tham chiếu: .login-lang, .login-lang-opt (+ .on)
 */
export interface AuthLanguageRowProps {
  currentLang: string;
  onChange: (code: string) => void;
}

export function AuthLanguageRow({ currentLang, onChange }: AuthLanguageRowProps) {
  return (
    <div className="login-lang">
      {authLanguages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`login-lang-opt${lang.code === currentLang ? " on" : ""}`}
          title={lang.label}
          onClick={() => onChange(lang.code)}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
