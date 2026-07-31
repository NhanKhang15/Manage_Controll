import { apiFetch } from "./client";

export interface MeetingTranscript {
  id: string;
  company: string;
  event: string | null;
  title: string;
  transcript_text: string;
  summary_text: string | null;
  summary_generated_at: string | null;
  char_count: number;
  created_by: string | null;
  creator_name?: string;
  created_at: string;
  updated_at: string;
}

export async function listMeetingTranscripts(eventId?: string): Promise<MeetingTranscript[]> {
  const query = eventId ? `?event_id=${eventId}` : "";
  return apiFetch<MeetingTranscript[]>(`/meeting-transcripts/${query}`);
}

export async function saveMeetingTranscript(data: {
  id?: string;
  company_id?: string;
  event_id?: string;
  title: string;
  transcript_text: string;
}): Promise<MeetingTranscript> {
  return apiFetch<MeetingTranscript>("/meeting-transcripts/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function summarizeMeetingTranscript(id: string): Promise<{ summary_text: string }> {
  return apiFetch<{ summary_text: string }>(`/meeting-transcripts/${id}/summarize/`, {
    method: "POST",
  });
}

export async function deleteMeetingTranscript(id: string): Promise<void> {
  await apiFetch<void>(`/meeting-transcripts/${id}/`, {
    method: "DELETE",
  });
}

export interface AiSettings {
  company_id: string;
  is_ai_enabled: boolean;
  has_api_key: boolean;
}

export async function getAiSettings(companyId: string): Promise<AiSettings> {
  return apiFetch<AiSettings>(`/settings/ai/?company_id=${companyId}`);
}

export async function updateAiSettings(data: {
  company_id: string;
  api_key?: string;
  is_ai_enabled?: boolean;
}): Promise<AiSettings> {
  return apiFetch<AiSettings>("/settings/ai/", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
