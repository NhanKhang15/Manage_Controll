import { Icon } from "../../components/ui/Icon";
import { Button } from "../../components/ui/Button";
import type { CalendarViewMode } from "../../types/calendar";

const VIEW_TABS: { key: CalendarViewMode; label: string }[] = [
  { key: "month", label: "Tháng" },
  { key: "week", label: "Tuần" },
  { key: "day", label: "Ngày" },
];

/**
 * CalendarToolbar
 * Thanh điều khiển lịch: lùi/tiến/hôm nay, chọn chế độ xem, ghi âm họp, thêm lịch.
 * Thẻ HTML gốc: <div class="page-head cal-head">
 * CSS gốc tham chiếu: .cal-head, .cal-controls, .cal-nav, .cal-arrow, .tabs, .tab
 */
export interface CalendarToolbarProps {
  monthLabel: string;
  view: CalendarViewMode;
  onChangeView: (view: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddEvent: () => void;
  onRecordMeeting?: () => void;
}

export function CalendarToolbar({
  monthLabel,
  view,
  onChangeView,
  onPrev,
  onNext,
  onToday,
  onAddEvent,
  onRecordMeeting,
}: CalendarToolbarProps) {
  return (
    <div className="page-head cal-head">
      <div>
        <h1>Lịch</h1>
        <p className="page-sub">{monthLabel}</p>
      </div>
      <div className="cal-controls">
        <div className="cal-nav">
          <button type="button" className="cal-arrow" onClick={onPrev} aria-label="Trước">
            <Icon name="chevron-left" size={18} />
          </button>
          <Button variant="ghost" size="sm" onClick={onToday}>
            Hôm nay
          </Button>
          <button type="button" className="cal-arrow" onClick={onNext} aria-label="Sau">
            <Icon name="chevron-right" size={18} />
          </button>
        </div>
        <div className="tabs cal-viewtabs">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tab${view === tab.key ? " on" : ""}`}
              onClick={() => onChangeView(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => onRecordMeeting?.()}>
          🎙️ Ghi âm họp
        </Button>
        <Button variant="primary" onClick={onAddEvent}>
          <Icon name="plus" size={16} /> Thêm lịch
        </Button>
      </div>
    </div>
  );
}
