import { Panel } from "../../components/ui/Panel";
import { Avatar } from "../../components/ui/Avatar";
import type { EmployeeListItem } from "../../api/employees";

export interface OnboardingTrackingTableProps {
  employees: EmployeeListItem[];
}

export function OnboardingTrackingTable({ employees }: OnboardingTrackingTableProps) {
  return (
    <Panel>
      <div className="panel-h">
        📋 Theo dõi nhập việc (HR) <small className="muted">({employees.length} nhân sự)</small>
      </div>
      <div className="table-wrap">
        <table className="task-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Bộ phận</th>
              <th>HĐLĐ</th>
              <th>NDA</th>
              <th>Văn hóa</th>
              <th>Team</th>
              <th>MST/BHXH</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={e.full_name} src={e.avatar_url ?? undefined} size={24} />
                  {e.full_name}
                </td>
                <td>{e.primary_department_name && <span className="dept-tag">{e.primary_department_name}</span>}</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td className="muted">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
