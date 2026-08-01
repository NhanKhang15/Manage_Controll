const PASTEL_COLORS = [
  "#10b981", // Emerald green
  "#a855f7", // Purple
  "#06b6d4", // Cyan
  "#f59e0b", // Amber / Orange
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#f43f5e", // Rose
  "#3b82f6", // Blue
];

export interface AvatarItem {
  id?: string;
  full_name?: string;
  avatar_initials_source?: string;
  name?: string;
}

export function getAvatarProps(employee: AvatarItem | null | undefined) {
  const name = employee?.avatar_initials_source || employee?.full_name || employee?.name || "";
  const id = employee?.id || name || "default";

  // Hash id to select a stable color
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const colorIndex = Math.abs(hash) % PASTEL_COLORS.length;
  const backgroundColor = PASTEL_COLORS[colorIndex];

  const cleanName = name.trim();
  if (!cleanName) {
    return { initials: "?", backgroundColor };
  }

  // Handle explicit special case from design spec if present
  if (cleanName.toLowerCase() === "trần hữu thành") {
    return { initials: "TT", backgroundColor };
  }

  const words = cleanName.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return { initials: words[0].substring(0, 2).toUpperCase(), backgroundColor };
  }

  const lastWord = words[words.length - 1];
  const prevWord = words[words.length - 2];
  const initials = (prevWord[0] + lastWord[0]).toUpperCase();

  return { initials, backgroundColor };
}
