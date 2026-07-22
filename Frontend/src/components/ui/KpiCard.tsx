import { Icon, type IconName } from "./Icon";

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  unit?: string;
  changePercent?: number;
  icon: string;
}

/**
 * KpiCard
 * Thẻ hiển thị 1 chỉ số KPI với icon, giá trị và nhãn — dùng cho các trang
 * khác (Tasks, Projects...) khi cần 1 thẻ đơn lẻ thay vì cả grid.
 * `icon` dùng tên icon có sẵn trong Icon.tsx (vd "projects", "okr", "time").
 * CSS gốc tham chiếu: .kpi, .kpi-ico, .kpi-meta
 */
export interface KpiCardProps {
  metric: KpiMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  return (
    <div className="kpi">
      <span className="kpi-ico" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
        <Icon name={metric.icon as IconName} size={22} />
      </span>
      <div className="kpi-meta">
        <b>
          {metric.value}
          {metric.unit ? ` ${metric.unit}` : ""}
        </b>
        <small>{metric.title}</small>
      </div>
    </div>
  );
}
