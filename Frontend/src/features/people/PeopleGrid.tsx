import type { Person } from "../../types/people";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { PersonCard } from "./PersonCard";

export type ViewMode = "card" | "list" | "org";

interface PeopleGridProps {
  people: Person[];
  viewMode: ViewMode;
  onBookMeeting: (person: Person) => void;
}

export function PeopleGrid({ people, viewMode, onBookMeeting }: PeopleGridProps) {
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
              <th>Cấp trên</th>
              <th />
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
                <td>{person.phone || "—"}</td>
                <td>{person.managerName || "—"}</td>
                <td>
                  <Button variant="ghost" size="sm" onClick={() => onBookMeeting(person)}>
                    Đặt lịch
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (viewMode === "org") {
    return (
      <div className="panel org-panel">
        <div className="panel-h">Sơ đồ tổ chức Vela AI</div>
        <div className="org-grid">
          {people.map((person) => (
            <div key={person.id} className="org-node">
              <Avatar name={person.name} size={28} src={person.avatarSrc} />
              <div>
                <b>{person.name}</b>
                <small>{person.title}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="people-grid">
      {people.map((person) => (
        <PersonCard key={person.id} person={person} onBookMeeting={onBookMeeting} />
      ))}
    </div>
  );
}
