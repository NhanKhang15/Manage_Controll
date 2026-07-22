import { KpiCard } from "../../components/ui/KpiCard";

export interface ProjectKpiGridProps {
  runningCount: number;
  completedCount: number;
  delayedCount: number;
}

export function ProjectKpiGrid({ runningCount, completedCount, delayedCount }: ProjectKpiGridProps) {
  return (
    <div className="kpi-grid" style={{ marginBottom: 20 }}>
      <KpiCard
        metric={{
          id: "kpi-running",
          title: "Dự án đang chạy",
          value: String(runningCount),
          unit: "dự án",
          icon: "projects",
        }}
      />
      <KpiCard
        metric={{
          id: "kpi-completed",
          title: "Đã hoàn thành",
          value: String(completedCount),
          unit: "dự án",
          icon: "okr",
        }}
      />
      <KpiCard
        metric={{
          id: "kpi-delayed",
          title: "Chậm tiến độ",
          value: String(delayedCount),
          unit: "dự án",
          icon: "time",
        }}
      />
    </div>
  );
}
