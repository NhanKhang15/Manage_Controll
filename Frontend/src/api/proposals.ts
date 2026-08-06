import { apiFetch } from "./client";

export type ProposalStatus = "pending" | "approved" | "rejected";
export type ProposalScope = "pending" | "mine" | "all";

export interface Proposal {
  id: string;
  title: string;
  amount: number | null;
  note: string;
  requester: string;
  requester_name: string;
  status: ProposalStatus;
  decided_by: string | null;
  decided_by_name: string | null;
  decided_at: string | null;
  created_at: string;
}

export function listProposals(companyId: string, scope: ProposalScope = "pending"): Promise<Proposal[]> {
  return apiFetch<Proposal[]>(`/proposals/?company_id=${companyId}&scope=${scope}`);
}

export function createProposal(data: {
  company_id: string;
  title: string;
  amount?: number | null;
  note?: string;
}): Promise<Proposal> {
  return apiFetch<Proposal>("/proposals/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function decideProposal(id: string, decision: "approved" | "rejected"): Promise<Proposal> {
  return apiFetch<Proposal>(`/proposals/${id}/decide/`, {
    method: "PATCH",
    body: JSON.stringify({ status: decision }),
  });
}

/** "425 triệu", "1,2 tỷ", "800 nghìn"... — cách hiển thị số tiền quen thuộc kiểu Việt Nam. */
export function formatAmountVi(amount: number | null): string {
  if (amount == null) return "—";
  const trim = (n: number) => Number(n.toFixed(1)).toString().replace(".", ",");
  if (amount >= 1_000_000_000) return `${trim(amount / 1_000_000_000)} tỷ`;
  if (amount >= 1_000_000) return `${trim(amount / 1_000_000)} triệu`;
  if (amount >= 1_000) return `${trim(amount / 1_000)} nghìn`;
  return `${amount.toLocaleString("vi-VN")} đ`;
}
