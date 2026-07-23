import type { EventItem } from "../../types/events";
import { EventCard } from "./EventCard";

export interface EventGridProps {
  events: EventItem[];
  onSelectEvent?: (event: EventItem) => void;
}

export function EventGrid({ events, onSelectEvent }: EventGridProps) {
  if (events.length === 0) {
    return <div className="mini-empty">Chưa có sự kiện nào.</div>;
  }
  return (
    <div className="ev-grid">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onClick={onSelectEvent} />
      ))}
    </div>
  );
}
