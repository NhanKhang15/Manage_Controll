export interface DashboardKpiItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
  href?: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  amount: string;
}

export interface ProjectProgressItem {
  id: string;
  title: string;
  percent: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  name: string;
  avatarUrl?: string | null;
  action: string;
  detail?: string;
  time: string;
}
