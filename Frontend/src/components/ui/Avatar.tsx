const PALETTE = ["#4F6EF7", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#0EA5E9", "#0D9488"];

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  const first = parts.length > 1 ? parts[0] : "";
  return (first[0] ?? "" ) + (last[0] ?? "");
}

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
      {initialsFromName(name).toUpperCase()}
    </span>
  );
}
