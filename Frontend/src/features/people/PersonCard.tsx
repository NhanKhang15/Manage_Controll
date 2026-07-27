import { useState } from "react";
import type { Person } from "../../types/people";
import { Avatar } from "../../components/ui/Avatar";
import { Chip } from "../../components/ui/Chip";
import { Button } from "../../components/ui/Button";

interface PersonCardProps {
  person: Person;
  onBookMeeting: (person: Person) => void;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pi-row">
      <span className="pi-k">{label}</span>
      <span className="pi-v">{children}</span>
    </div>
  );
}

export function PersonCard({ person, onBookMeeting }: PersonCardProps) {
  const [likes, setLikes] = useState(person.likes);
  const [dislikes, setDislikes] = useState(person.dislikes);
  const [userLiked, setUserLiked] = useState(Boolean(person.userLiked));
  const [userDisliked, setUserDisliked] = useState(Boolean(person.userDisliked));

  const handleLike = () => {
    setLikes((value) => value + (userLiked ? -1 : 1));
    setUserLiked((value) => !value);
    if (userDisliked) {
      setDislikes((value) => value - 1);
      setUserDisliked(false);
    }
  };

  const handleDislike = () => {
    setDislikes((value) => value + (userDisliked ? -1 : 1));
    setUserDisliked((value) => !value);
    if (userLiked) {
      setLikes((value) => value - 1);
      setUserLiked(false);
    }
  };

  return (
    <div className="person-card" data-uid={person.id} data-uname={person.name}>
      <div className="person-top">
        <Avatar name={person.name} size={56} src={person.avatarSrc} />
        <div className="person-id">
          <div className="person-name">{person.name}</div>
          <div className="person-title">{person.title}</div>
          <div className="person-tags">
            <Chip label={person.dept} />
            <Chip label={person.role} variant="todo" />
          </div>
        </div>
      </div>

      <div className="person-info">
        <InfoRow label="✉️ Email">
          <a href={`mailto:${person.email}`}>{person.email}</a>
        </InfoRow>
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
        <span title="Đánh giá">★ {person.rating}</span>
        <span title="Điểm">{person.level}</span>
      </div>

      <div className="peer-rate">
        <button type="button" className={`pr-btn like ${userLiked ? "on" : ""}`} onClick={handleLike}>
          👍 <span className="pr-c pr-sat">{likes}</span>
        </button>
        <button type="button" className={`pr-btn dislike ${userDisliked ? "on" : ""}`} onClick={handleDislike}>
          👎 <span className="pr-c pr-uns">{dislikes}</span>
        </button>
      </div>

      <Button variant="ghost" size="sm" onClick={() => onBookMeeting(person)}>
        📅 Đặt lịch họp
      </Button>
    </div>
  );
}
