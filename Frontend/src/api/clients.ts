import { apiFetch } from "./client";

export type ClientStatus = "lead" | "active" | "closed" | "lost";
export type StageStatus = "pending" | "doing" | "done";

export interface ClientStages {
  rnd: StageStatus;
  define: StageStatus;
  suggest: StageStatus;
  solution: StageStatus;
}

export interface ClientCommentItem {
  id: string;
  author_name: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface ClientItem {
  id: string;
  name: string;
  contact_name: string;
  contact_role: string;
  phone: string;
  email: string | null;
  status: ClientStatus;
  owner_id: string | null;
  owner_name: string | null;
  contract_info: string;
  source: string;
  notes: string;
  linked_project_id: string | null;
  linked_project_name: string | null;
  stages: ClientStages;
  created_at: string;
  comments?: ClientCommentItem[];
}

export function getClients(companyId: string): Promise<ClientItem[]> {
  return apiFetch<ClientItem[]>(`/clients/?company_id=${companyId}`);
}

export function getClient(id: string): Promise<ClientItem> {
  return apiFetch<ClientItem>(`/clients/${id}/`);
}

export function createClient(
  companyId: string,
  data: { name: string; contact_name?: string; contact_role?: string; phone?: string; email?: string; status?: ClientStatus; source?: string; owner_id?: string }
): Promise<ClientItem> {
  return apiFetch<ClientItem>(`/clients/`, {
    method: "POST",
    body: JSON.stringify({ company_id: companyId, ...data }),
  });
}

export function updateClient(
  id: string,
  patch: Partial<{
    status: ClientStatus;
    owner_id: string | null;
    contract_info: string;
    notes: string;
    source: string;
    linked_project_id: string | null;
    stages: Partial<ClientStages>;
  }>
): Promise<ClientItem> {
  return apiFetch<ClientItem>(`/clients/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function addClientComment(id: string, content: string, isInternal = true): Promise<ClientCommentItem> {
  return apiFetch<ClientCommentItem>(`/clients/${id}/comments/`, {
    method: "POST",
    body: JSON.stringify({ content, is_internal: isInternal }),
  });
}
