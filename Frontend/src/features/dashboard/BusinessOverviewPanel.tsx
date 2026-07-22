import { useState } from "react";
import { DashboardKpiGrid } from "./DashboardKpiGrid";
import type { DashboardKpiItem } from "../../types/dashboard";

/**
 * BusinessOverviewPanel
 * Panel "Tổng quan Kinh doanh & Marketing": 6 KPI + widget đặt mục tiêu doanh thu.
 * Thẻ HTML gốc: <div class=panel> (chứa .panel-h, .kpi-grid, khối mục tiêu doanh thu)
 * CSS gốc tham chiếu: .panel, .panel-h, .panel-link
 */
export interface BusinessOverviewPanelProps {
  monthLabel: string;
  kpis: DashboardKpiItem[];
  clientsHref?: string;
}

export function BusinessOverviewPanel({ monthLabel, kpis, clientsHref = "?page=clients" }: BusinessOverviewPanelProps) {
  const [goalInput, setGoalInput] = useState("");
  const [savedGoal, setSavedGoal] = useState<number | null>(null);

  function handleSave() {
    const value = Number(goalInput);
    if (value > 0) setSavedGoal(value);
  }

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="panel-h">
        📈 Tổng quan Kinh doanh &amp; Marketing — {monthLabel}
        <a className="panel-link" href={clientsHref}>
          Khách hàng ›
        </a>
      </div>
      <div style={{ margin: "6px 0 12px" }}>
        <DashboardKpiGrid items={kpis} />
      </div>
      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <b>🎯 Mục tiêu doanh thu tháng</b>
          <span>
            Kết quả: <b style={{ color: "#10b981" }}>{(savedGoal ?? 0).toLocaleString("vi-VN")}đ</b>
          </span>
        </div>
        <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
          {savedGoal === null ? (
            <>
              Chưa đặt mục tiêu. Đặt ngay:{" "}
              <input
                type="number"
                min={0}
                placeholder="VND/tháng"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                style={{ width: 150, padding: "3px 8px", border: "1px solid var(--line)", borderRadius: 8 }}
              />{" "}
              <button type="button" className="btn btn-sm" onClick={handleSave}>
                Lưu
              </button>
            </>
          ) : (
            <>Mục tiêu tháng này: {savedGoal.toLocaleString("vi-VN")}đ</>
          )}
        </div>
      </div>
    </div>
  );
}
