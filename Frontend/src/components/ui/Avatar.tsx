import { colorFromName, initialsFromName } from "../../utils/color";

/**
 * Avatar
 * Hình đại diện: ảnh thật nếu có `src`, ngược lại hiển thị chữ viết tắt màu
 * theo tên (giống các mini-ava trong HTML gốc, vd "XH", "TL"...).
 * CSS gốc tham chiếu: .avatar, .avatar-img, .mini-ava
 */
export interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
}

export function Avatar({ name, src, size = 32 }: AvatarProps) {
  const color = colorFromName(name);
  const style = {
    width: size,
    height: size,
    fontSize: Math.max(10, size * 0.4),
    background: `${color}22`,
    color,
    borderRadius: size <= 24 ? "50%" : 11,
  };

  if (src) {
    return <img className="avatar avatar-img" src={src} alt={name} style={style} />;
  }

  return (
    <span className="avatar" style={style} title={name}>
      {initialsFromName(name)}
    </span>
  );
}
