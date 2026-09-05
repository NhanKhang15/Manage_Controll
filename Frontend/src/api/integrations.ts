import { apiFetch } from "./client";

export interface GoogleDriveSyncResult {
  success: boolean;
  message: string;
  synced_companies: number;
  synced_departments: number;
  synced_projects: number;
  synced_tasks: number;
  errors: string[];
}

export interface GoogleDriveConfigStatus {
  company_id: string;
  is_connected: boolean;
  connected_email: string | null;
  root_folder_id: string | null;
  root_folder_url: string | null;
  updated_at: string | null;
  verified?: boolean;
  verify_error?: string | null;
  resync?: GoogleDriveSyncResult | null;
}

export async function getGoogleDriveConfig(companyId: string): Promise<GoogleDriveConfigStatus> {
  return apiFetch(`/integrations/google-drive/config/?company_id=${companyId}`);
}

export interface UpdateGoogleDriveConfigInput {
  company_id: string;
  root_folder_id?: string;
  root_folder_url?: string;
  reset_existing_links?: boolean;
}

export async function updateGoogleDriveConfig(
  data: UpdateGoogleDriveConfigInput
): Promise<GoogleDriveConfigStatus> {
  return apiFetch("/integrations/google-drive/config/", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function startGoogleDriveOAuth(companyId: string): Promise<{ auth_url: string }> {
  return apiFetch("/integrations/google-drive/oauth/start/", {
    method: "POST",
    body: JSON.stringify({ company_id: companyId }),
  });
}
