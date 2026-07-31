export type AiModelId = 'auto' | 'claude' | 'gpt' | 'gemini';

export interface NavItemData {
  id: string;
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

export interface AttnCategory {
  key: string;
  label: string;
  count: number;
}

export interface AttentionItem {
  id: string;
  category: string;
  title: string;
  meta: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: AiModelId;
  createdAt: string;
}

export interface UserProfile {
  employeeId?: string;
  name: string;
  role: string;
  avatarUrl: string;
  email?: string;
  rating: number;
  level: number;
  managedStaff: number;
  achievementPoints: number;
}
