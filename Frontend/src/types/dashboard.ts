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
  initials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  action: string;
  detail: string;
  time: string;
}
