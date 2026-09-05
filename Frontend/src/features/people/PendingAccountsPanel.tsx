import { Button } from "../../components/ui/Button";
import type { PendingEmployee } from "../../api/employees";

interface PendingAccountsPanelProps {
  items: PendingEmployee[];
  canManage: boolean;
  onApprove: (item: PendingEmployee) => void;
  onReject: (item: PendingEmployee) => void;
}

export function PendingAccountsPanel({ items, canManage, onApprove, onReject }: PendingAccountsPanelProps) {
  if (items.length === 0) {
    return <div className="mini-empty">Không có tài khoản nào đang chờ duyệt 👍</div>;
  }

  return (
    <div className="panel people-table-wrap">
      <table className="people-table task-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Đăng ký lúc</th>
            {canManage ? <th /> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <b>{item.full_name}</b>
              </td>
              <td>
                <a href={`mailto:${item.email}`}>{item.email}</a>
              </td>
              <td>{new Date(item.created_at).toLocaleString("vi-VN")}</td>
              {canManage ? (
                <td style={{ display: "flex", gap: 8 }}>
                  <Button variant="primary" size="sm" onClick={() => onApprove(item)}>
                    Duyệt
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onReject(item)}>
                    Từ chối
                  </Button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
