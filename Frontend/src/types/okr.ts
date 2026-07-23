export interface KeyResult {
  id: string;
  title: string;
  current: number;
  target: number;
}

export interface Objective {
  id: string;
  title: string;
  period: string;
  department: string;
  owner: string;
  keyResults: KeyResult[];
}
