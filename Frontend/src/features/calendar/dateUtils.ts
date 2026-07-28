export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Đầu tuần (Thứ Hai) chứa `date`, khớp firstDay={1} của FullCalendar. */
export function getWeekStart(date: Date): Date {
  const day = date.getDay(); // 0 = CN, 1 = T2, ...
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

export function getWeekDays(date: Date): Date[] {
  const start = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getMonthsInRange(dates: Date[]): { year: number; month: number }[] {
  const seen = new Set<string>();
  const result: { year: number; month: number }[] = [];
  for (const d of dates) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${month}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ year, month });
    }
  }
  return result;
}

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function weekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()];
}

export function formatDayMonth(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}`;
}
