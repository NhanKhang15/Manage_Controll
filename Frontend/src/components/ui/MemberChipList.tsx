import { Avatar } from "./Avatar";

/**
 * MemberChipList
 * Danh sách thành viên dạng pill (tên + avatar chữ viết tắt).
 * CSS gốc tham chiếu: .proj-members, .member-chip
 */
export interface MemberChipListProps {
  members: string[];
}

export function MemberChipList({ members }: MemberChipListProps) {
  if (members.length === 0) {
    return <div className="mini-empty">Chưa có thành viên.</div>;
  }

  return (
    <div className="proj-members">
      {members.map((name) => (
        <span className="member-chip" key={name}>
          <Avatar name={name} size={20} />
          {name}
        </span>
      ))}
    </div>
  );
}
