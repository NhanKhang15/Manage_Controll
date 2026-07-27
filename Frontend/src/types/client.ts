export type ClientStatus = "lead" | "active" | "closed" | "lost";

export type StageStatus = "pending" | "doing" | "done";

export interface ClientStageMap {
  rnd: StageStatus;
  define: StageStatus;
  suggest: StageStatus;
  solution: StageStatus;
}

export interface ClientComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isInternal?: boolean;
}

export interface Client {
  id: string;
  name: string;
  contactName: string;
  contactRole: string;
  phone: string;
  email?: string;
  status: ClientStatus;
  ownerName: string;
  ownerAvatar?: string;
  contractInfo?: string;
  stages: ClientStageMap;
  source?: string;
  notes?: string;
  linkedProjectId?: string;
  comments?: ClientComment[];
}
