export interface TimeLogEntry {
  id: string;
  taskName: string;
  minutes: number;
  date: string;
  note?: string;
}

export interface TaskEstimate {
  taskName: string;
  estimateHours: number | null;
}
