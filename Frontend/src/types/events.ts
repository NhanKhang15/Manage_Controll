export interface EventItem {
  id: string;
  title: string;
  datetime: string;
  location: string;
  attendees: number;
  visibility: "public" | "private";
  gradient: string;
}
