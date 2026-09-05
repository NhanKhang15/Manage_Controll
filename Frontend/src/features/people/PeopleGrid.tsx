import type { Person } from "../../types/people";
import type { ReactionType } from "../../api/employees";
import { Avatar } from "../../components/ui/Avatar";
import { PersonCard } from "./PersonCard";
import { OrgTree } from "./OrgTree";

export type ViewMode = "card" | "list" | "org";

interface PeopleGridProps {
  people: Person[];
  viewMode: ViewMode;
  currentPersonId?: string;
  onBookMeeting: (person: Person) => void;
  onReact: (person: Person, type: ReactionType) => void;
}

export function PeopleGrid({ people, viewMode, currentPersonId, onBookMeeting, onReact }: PeopleGridProps) {
  if (viewMode === "list") {
    return (
      <div className="panel people-table-wrap">
        <table className="people-table task-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Chức danh</th>
              <th>Phòng ban</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Zalo</th>
              <th>Cấp trên</th>
              <th>Quản lý</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id}>
                <td>
                  <span className="people-cell-user">
                    <Avatar name={person.name} size={28} src={person.avatarSrc} />
                    <b>{person.name}</b>
                  </span>
                </td>
                <td>{person.title}</td>
                <td>{person.dept}</td>
                <td>
                  <a href={`mailto:${person.email}`}>{person.email}</a>
                </td>
                <td>{person.phone ? <a href={`tel:${person.phone}`}>{person.phone}</a> : "—"}</td>
                <td>
                  {person.zalo ? (
                    <a href={`https://zalo.me/${person.zalo}`} target="_blank" rel="noopener noreferrer">
                      {person.zalo}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{person.managerName || "—"}</td>
                <td>{person.directReportsCount ? `${person.directReportsCount} người` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (viewMode === "org") {
    return <OrgTree people={people} />;
  }

  return (
    <div className="people-grid">
      {people.map((person) => (
        <PersonCard
          key={person.id}
          person={person}
          isSelf={person.id === currentPersonId}
          onBookMeeting={onBookMeeting}
          onReact={onReact}
        />
      ))}
    </div>
  );
}
