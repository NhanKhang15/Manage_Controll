import { apiFetch } from "./client";

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  position_title: string | null;
  department: string | null;
  total_points: number;
  period_points: number;
  level: number;
  level_title: string;
  rating: number;
}

export type ScoringPeriod = "today" | "week" | "month" | "year" | "all";

export function getLeaderboard(companyId: string, period: ScoringPeriod = "all"): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>(`/scoring/leaderboard/?company_id=${companyId}&period=${period}`);
}

export interface PointsFormula {
  company_id: string;
  points_per_effort_unit: number;
  on_time_bonus: number;
  auto_apply_salary: boolean;
}

export function getFormula(companyId: string): Promise<PointsFormula> {
  return apiFetch<PointsFormula>(`/scoring/formula/?company_id=${companyId}`);
}

export function saveFormula(
  companyId: string,
  data: { points_per_effort_unit: number; on_time_bonus: number; auto_apply_salary: boolean }
): Promise<PointsFormula> {
  return apiFetch<PointsFormula>(`/scoring/formula/?company_id=${companyId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export interface LevelTierItem {
  id: string;
  level: number;
  name: string;
  min_points: number;
  base_salary: number;
  allowance: number;
  benefits: string;
}

export function getLevels(companyId: string): Promise<LevelTierItem[]> {
  return apiFetch<LevelTierItem[]>(`/scoring/levels/?company_id=${companyId}`);
}

export function createLevel(
  companyId: string,
  data: Partial<Pick<LevelTierItem, "level" | "name" | "min_points" | "base_salary" | "allowance" | "benefits">>
): Promise<LevelTierItem> {
  return apiFetch<LevelTierItem>(`/scoring/levels/?company_id=${companyId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateLevel(id: string, data: Partial<LevelTierItem>): Promise<LevelTierItem> {
  return apiFetch<LevelTierItem>(`/scoring/levels/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteLevel(id: string): Promise<void> {
  return apiFetch(`/scoring/levels/${id}/`, { method: "DELETE" });
}

export function recalculateScores(companyId: string): Promise<{ updated: number; auto_applied_salary: boolean }> {
  return apiFetch(`/scoring/recalculate/`, {
    method: "POST",
    body: JSON.stringify({ company_id: companyId }),
  });
}
