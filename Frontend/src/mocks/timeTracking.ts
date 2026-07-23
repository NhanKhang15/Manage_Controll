import type { TaskEstimate, TimeLogEntry } from "../types/timeTracking";

export const trackedTaskNames: string[] = ["Cong viec 1", "Tong hop du lieu", "Thiết kế landing page"];

export const mockTaskEstimates: TaskEstimate[] = [
  { taskName: "Cong viec 1", estimateHours: 8 },
  { taskName: "Tong hop du lieu", estimateHours: 4 },
  { taskName: "Thiết kế landing page", estimateHours: null },
];

export const mockWeekLogs: TimeLogEntry[] = [
  { id: "log-1", taskName: "Cong viec 1", minutes: 150, date: "21/07/2026", note: "Rà soát yêu cầu" },
  { id: "log-2", taskName: "Tong hop du lieu", minutes: 90, date: "22/07/2026", note: "Chuẩn hoá dữ liệu đầu vào" },
];
