import { useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function TimeAttendancePage() {
  const { showToast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  function handleCheckInToggle() {
    if (!isCheckedIn) {
      const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      setIsCheckedIn(true);
      setCheckInTime(now);
      showToast(`Đã điểm danh vào ca lúc ${now}`, "success");
    } else {
      setIsCheckedIn(false);
      showToast("Đã điểm danh ra ca", "default");
    }
  }

  return (
    <AppShellPage initialNavId="time-attendance">
      <div className="page-head">
        <h1>⏰ Chấm công</h1>
        <p className="page-sub">Theo dõi thời gian ra vào và chấm công hàng ngày.</p>
      </div>

      <Panel>
        <div className="panel-h">Điểm danh trong ngày</div>
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: "var(--brand)" }}>
            {checkInTime || "--:--"}
          </div>
          <Button
            variant={isCheckedIn ? "reject" : "primary"}
            size="lg"
            onClick={handleCheckInToggle}
          >
            {isCheckedIn ? "🔴 Điểm danh RA CA" : "🟢 Điểm danh VÀO CA"}
          </Button>
        </div>
      </Panel>

      <Panel>
        <div className="panel-h">Lịch sử chấm công tháng 08/2026</div>
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>01/08/2026</td>
                <td>08:00</td>
                <td>17:30</td>
                <td><span className="alert-tag alert-soft">Đúng giờ</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShellPage>
  );
}
