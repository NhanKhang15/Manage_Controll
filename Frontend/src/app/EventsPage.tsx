import { useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Button } from "../components/ui/Button";
import { EventGrid } from "../features/events/EventGrid";
import { CreateEventModal } from "../features/events/CreateEventModal";
import { useToast } from "../components/ui/Toast";
import { mockEvents } from "../mocks/events";
import type { EventItem } from "../types/events";

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(mockEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <AppShellPage initialNavId="events">
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1>⭐ Sự kiện</h1>
          <p className="page-sub">Sự kiện công ty &amp; cộng đồng — đăng ký tham gia, quản lý khách mời, check-in.</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          ✨ Tạo sự kiện
        </Button>
      </div>

      <EventGrid events={events} onSelectEvent={(ev) => showToast(`Xem chi tiết sự kiện: ${ev.title}`, "default")} />

      <CreateEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(ev) => {
          setEvents((prev) => [ev, ...prev]);
          showToast("Đã tạo sự kiện mới", "success");
        }}
      />
    </AppShellPage>
  );
}
