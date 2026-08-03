import { apiFetch } from "./client";

export interface Conversation {
  id: string;
  company: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface SendMessageResponse {
  conversation: Conversation;
  message: AssistantMessage;
}

export function listConversations(companyId: string): Promise<Conversation[]> {
  return apiFetch<Conversation[]>(`/assistant/conversations/?company_id=${companyId}`);
}

export function createConversation(companyId: string): Promise<Conversation> {
  return apiFetch<Conversation>("/assistant/conversations/", {
    method: "POST",
    body: JSON.stringify({ company_id: companyId }),
  });
}

export function deleteConversation(id: string): Promise<null> {
  return apiFetch<null>(`/assistant/conversations/${id}/`, { method: "DELETE" });
}

export function getMessages(conversationId: string): Promise<AssistantMessage[]> {
  return apiFetch<AssistantMessage[]>(`/assistant/conversations/${conversationId}/messages/`);
}

export function sendMessage(conversationId: string, content: string): Promise<SendMessageResponse> {
  return apiFetch<SendMessageResponse>(`/assistant/conversations/${conversationId}/messages/`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
