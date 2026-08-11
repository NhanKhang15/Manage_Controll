import { Avatar } from "./Avatar";

export interface PersonChipProps {
  name: string;
  title?: string;
  avatarUrl?: string | null;
  onClick?: () => void;
}

export function PersonChip({ name, title, avatarUrl, onClick }: PersonChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "var(--line-2)",
        border: "none",
        borderRadius: 20,
        padding: "3px 12px 3px 3px",
        margin: "3px 6px 0 0",
        cursor: onClick ? "pointer" : "default",
        font: "inherit",
        color: "inherit",
      }}
    >
      <Avatar name={name} src={avatarUrl ?? undefined} size={22} />
      <span style={{ fontSize: 13 }}>{name}</span>
    </button>
  );
}
