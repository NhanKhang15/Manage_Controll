import { useRef } from "react";

/**
 * HeroAvatar
 * Avatar lớn + nút đổi ảnh đại diện + input file ẩn.
 * Thẻ HTML gốc: <div class=hero-ava-wrap>
 * CSS gốc tham chiếu: .hero-ava-wrap, .hero-ava, .hero-ava-edit
 */
export interface HeroAvatarProps {
  avatarUrl: string;
  onChangeAvatar: (file: File) => void;
}

export function HeroAvatar({ avatarUrl, onChangeAvatar }: HeroAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="hero-ava-wrap">
      <img className="hero-ava" src={avatarUrl} alt="avatar" />
      <button type="button" className="hero-ava-edit" title="Đổi ảnh đại diện" onClick={() => inputRef.current?.click()}>
        📷
      </button>
      <input
        ref={inputRef}
        type="file"
        id="avatarInput"
        accept="image/*"
        hidden
        className="sf-hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChangeAvatar(file);
        }}
      />
    </div>
  );
}
