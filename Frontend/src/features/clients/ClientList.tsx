import type { Client, ClientStatus, StageStatus } from "../../types/client";
import { Avatar } from "../../components/ui/Avatar";
import { Chip } from "../../components/ui/Chip";

interface ClientListProps {
  clients: Client[];
  selectedId: string | null;
  onSelect: (client: Client) => void;
}

const STATUS_CHIP_MAP: Record<ClientStatus, { label: string; variant: "default" | "todo" | "in_progress" | "done"; color?: string }> = {
  lead: { label: "Tiềm năng", variant: "in_progress" },
  active: { label: "Đang làm việc", variant: "todo" },
  closed: { label: "Đã chốt", variant: "done" },
  lost: { label: "Ngừng", variant: "default", color: "#EF4444" },
};

const STAGE_DOT_COLORS: Record<StageStatus, string> = {
  done: "#10B981",
  doing: "#3B82F6",
  pending: "#CBD5E1",
};

const STAGE_KEYS = ["rnd", "define", "suggest", "solution"] as const;

export function ClientList({ clients, selectedId, onSelect }: ClientListProps) {
  return (
    <div className="cl-list">
      {clients.map((client) => {
        const statusMeta = STATUS_CHIP_MAP[client.status];

        return (
          <a
            key={client.id}
            className={`cl-card ${client.id === selectedId ? "on" : ""}`}
            href={`#client-${client.id}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(client);
            }}
          >
            <div className="cl-card-top">
              <span className="cl-name">{client.name}</span>
              <Chip label={statusMeta.label} variant={statusMeta.variant} color={statusMeta.color} />
            </div>
            <div className="cl-card-meta">
              <span className="cl-dots">
                {STAGE_KEYS.map((key) => (
                  <i key={key} style={{ background: STAGE_DOT_COLORS[client.stages[key]] }} title={`${key}: ${client.stages[key]}`} />
                ))}
              </span>
            </div>
            <div className="cl-card-owner">
              <Avatar name={client.ownerName} size={20} src={client.ownerAvatar} />
              <span>{client.ownerName}</span>
              <span className="muted">· đang follow</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
