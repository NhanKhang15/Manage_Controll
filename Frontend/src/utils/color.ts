const PALETTE = ["#4F6EF7", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#0EA5E9", "#0D9488"];

/** Màu ổn định theo tên/khoá (dùng cho avatar, chấm màu dự án...) — cùng tên luôn ra cùng màu. */
export function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

/** Chữ viết tắt 2 ký tự từ họ tên đầy đủ, vd "Nguyễn Văn A" → "NA". */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  const first = parts.length > 1 ? parts[0] : "";
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}
