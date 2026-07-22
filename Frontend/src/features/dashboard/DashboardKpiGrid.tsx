import type { DashboardKpiItem } from "../../types/dashboard";

/**
 * DashboardKpiGrid
 * Grid thẻ KPI dùng chung — tái sử dụng cho cả grid chính (5 thẻ) và grid
 * "Tổng quan Kinh doanh & Marketing" (6 thẻ). HTML gốc dùng chung class
 * .kpi-grid cho cả 2 nơi, chỉ khác class bọc ngoài (.dash-kpi hay không).
 * Thẻ HTML gốc: <div class="kpi-grid dash-kpi">
 * CSS gốc tham chiếu: .kpi-grid, .kpi, .kpi-ico, .kpi-meta
 */
export interface DashboardKpiGridProps {
  items: DashboardKpiItem[];
  emphasized?: boolean;
}

export function DashboardKpiGrid({ items, emphasized = false }: DashboardKpiGridProps) {
  return (
    <div className={`kpi-grid${emphasized ? " dash-kpi" : ""}`}>
      {items.map((item) => (
        <a key={item.id} className="kpi" href={item.href ?? "#"}>
          <span className="kpi-ico" style={{ background: item.iconBg, color: item.iconColor }}>
            {item.icon}
          </span>
          <div className="kpi-meta">
            <b>{item.value}</b>
            <small>{item.label}</small>
          </div>
        </a>
      ))}
    </div>
  );
}
