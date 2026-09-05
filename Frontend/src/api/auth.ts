import { apiFetch } from "./client";

export interface EmployeeCompanyRef {
  id: string;
  name: string;
  role_in_company: string | null;
  can_approve_proposals: boolean;
  due_soon_days: number;
}

export interface AuthEmployee {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  position_title: string | null;
  is_active: boolean;
  companies: EmployeeCompanyRef[];
  rating: number;
  points: number;
  level: number;
  direct_reports_count: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterResponse {
  detail: string;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(fullName: string, email: string, password: string): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ full_name: fullName, email, password }),
  });
}

export function getMe(): Promise<AuthEmployee> {
  return apiFetch<AuthEmployee>("/auth/me/");
}
