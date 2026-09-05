import { apiFetch } from "./client";

export type CandidateStage = "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";

export interface JobPostingItem {
  id: string;
  title: string;
  department: string | null;
  department_id: string | null;
  level: string;
  jd: string;
  requirements_note: string;
  channels: string;
  status: "open" | "closed";
  public_token: string;
  created_at: string;
  candidate_count: number;
}

export interface PublicJobPosting {
  id: string;
  title: string;
  department: string | null;
  level: string;
  jd: string;
  status: string;
  public_token: string;
  company_name: string;
}

export interface CandidateItem {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  cv_file_url: string | null;
  cv_file_name: string | null;
  cover_letter: string;
  source: string;
  stage: CandidateStage;
  interview_at: string | null;
  rating: number | null;
  created_at: string;
}

export function getJobPostings(companyId: string): Promise<JobPostingItem[]> {
  return apiFetch<JobPostingItem[]>(`/recruitment/jobs/?company_id=${companyId}`);
}

export function createJobPosting(
  companyId: string,
  data: { title: string; department_id?: string; level?: string; requirements_note?: string; jd?: string; channels?: string }
): Promise<JobPostingItem> {
  return apiFetch<JobPostingItem>(`/recruitment/jobs/`, {
    method: "POST",
    body: JSON.stringify({ company_id: companyId, ...data }),
  });
}

export function updateJobPosting(id: string, patch: Partial<{ status: "open" | "closed"; jd: string; channels: string }>): Promise<JobPostingItem> {
  return apiFetch<JobPostingItem>(`/recruitment/jobs/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function getCandidates(jobId: string): Promise<CandidateItem[]> {
  return apiFetch<CandidateItem[]>(`/recruitment/jobs/${jobId}/candidates/`);
}

export function updateCandidate(
  id: string,
  patch: Partial<{ stage: CandidateStage; interview_at: string | null; rating: number | null }>
): Promise<CandidateItem> {
  return apiFetch<CandidateItem>(`/recruitment/candidates/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function generateJd(data: {
  title: string;
  department?: string;
  level?: string;
  requirements_note?: string;
  company_id?: string;
}): Promise<{ jd: string; source: "ai" | "template" }> {
  return apiFetch(`/recruitment/generate-jd/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Công khai — trang ứng tuyển (/apply/:token), không đăng nhập nên không đi qua
// apiFetch (không cần/không có Bearer token, và multipart phải tự set boundary).
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function getPublicJobPosting(token: string): Promise<PublicJobPosting> {
  const res = await fetch(`${BASE_URL}/recruitment/public/${token}/`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Không tải được tin tuyển dụng");
  }
  return res.json();
}

export async function applyToJobPosting(
  token: string,
  data: { full_name: string; email?: string; phone?: string; cover_letter?: string; cv_file?: File | null }
): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append("full_name", data.full_name);
  if (data.email) formData.append("email", data.email);
  if (data.phone) formData.append("phone", data.phone);
  if (data.cover_letter) formData.append("cover_letter", data.cover_letter);
  if (data.cv_file) formData.append("cv_file", data.cv_file);

  const res = await fetch(`${BASE_URL}/recruitment/public/${token}/apply/`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Nộp hồ sơ thất bại");
  }
  return res.json();
}
