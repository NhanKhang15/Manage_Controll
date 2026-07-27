export interface Person {
  id: number;
  name: string;
  title: string;
  dept: string;
  role: string;
  email: string;
  phone: string;
  zalo?: string;
  managerName?: string;
  managerTitle?: string;
  directReportsCount?: number;
  rating: number;
  level: string;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  avatarColor?: string;
  avatarSrc?: string;
}
