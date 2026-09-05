import type { Person } from "../../types/people";
import type { ReactionType } from "../../api/employees";
import { Avatar } from "../../components/ui/Avatar";
import { Chip } from "../../components/ui/Chip";
import { Button } from "../../components/ui/Button";

interface PersonCardProps {
  person: Person;
  isSelf: boolean;
  onBookMeeting: (person: Person) => void;
  onReact: (person: Person, type: ReactionType) => void;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pi-row">
      <span className="pi-k">{label}</span>
      <span className="pi-v">{children}</span>
    </div>
  );
}

export function PersonCard({ person, isSelf, onBookMeeting, onReact }: PersonCardProps) {
  return (
    <div className="person-card" data-uid={person.id} data-uname={person.name}>
      <div className="person-top">
        <Avatar name={person.name} size={56} src={person.avatarSrc} />
        <div className="person-id">
          <div className="person-name">{person.name}</div>
          <div className="person-title">{person.title}</div>
          <div className="person-tags">
            <Chip label={person.dept} />
            {person.role ? <Chip label={person.role} variant="todo" /> : null}
          </div>
        </div>
      </div>

      <div className="person-info">
        {person.email ? (
          <InfoRow label="✉️ Email">
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </InfoRow>
        ) : null}
        {person.phone ? (
          <InfoRow label="📞 SĐT">
            <a href={`tel:${person.phone}`}>{person.phone}</a>
          </InfoRow>
        ) : null}
        {person.zalo ? (
          <InfoRow label="💬 Zalo">
            <a href={`https://zalo.me/${person.zalo}`} target="_blank" rel="noopener noreferrer">
              {person.zalo}
            </a>
          </InfoRow>
        ) : null}
        <InfoRow label="👔 Cấp trên">
          {person.managerName ? (
            <>
              {person.managerName} {person.managerTitle ? <small>({person.managerTitle})</small> : null}
            </>
          ) : (
            "—"
          )}
        </InfoRow>
        <InfoRow label="👥 Quản lý">{person.directReportsCount ? `${person.directReportsCount} người` : "—"}</InfoRow>
      </div>

      <div className="person-foot">
        <span title="Đánh giá">★ {person.rating.toFixed(1)}</span>
        <span title="Điểm">Lv{person.level}</span>
      </div>

      {isSelf ? null : (
        <>
          <div className="peer-rate">
            <button type="button" className={`pr-btn like ${person.userLiked ? "on" : ""}`} onClick={() => onReact(person, "like")}>
              👍 <span className="pr-c pr-sat">{person.likes}</span>
            </button>
            <button type="button" className={`pr-btn dislike ${person.userDisliked ? "on" : ""}`} onClick={() => onReact(person, "dislike")}>
              👎 <span className="pr-c pr-uns">{person.dislikes}</span>
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => onBookMeeting(person)}>
            📅 Đặt lịch họp
          </Button>
        </>
      )}
    </div>
  );
}
