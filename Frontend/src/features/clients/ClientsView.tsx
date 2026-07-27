import { useState } from "react";
import type { Client } from "../../types/client";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { mockClients } from "../../mocks/clients";
import { ClientDetail } from "./ClientDetail";
import { ClientList } from "./ClientList";

export function ClientsView() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { showToast } = useToast();

  const selectedClient = selectedId ? clients.find((client) => client.id === selectedId) : null;

  const handleUpdateClient = (updated: Client) => {
    setClients((prev) => prev.map((client) => (client.id === updated.id ? updated : client)));
  };

  const handleAddClient = () => {
    const newId = String(Date.now());
    const newClient: Client = {
      id: newId,
      name: "Khách hàng mới",
      contactName: "Đại diện",
      contactRole: "đang follow",
      phone: "0900 000 000",
      status: "lead",
      ownerName: "Đặng Quốc Huy",
      stages: { rnd: "pending", define: "pending", suggest: "pending", solution: "pending" },
    };
    setClients((prev) => [newClient, ...prev]);
    setSelectedId(newId);
    showToast("Đã tạo khách hàng mới", "success");
  };

  return (
    <div>
      <div className="page-head clients-head">
        <h1>Khách hàng</h1>
        <div className="cl-actions">
          <Button variant="ghost" size="sm" onClick={() => showToast("Đã đồng bộ Google Sheet", "success")}>
            🔗 Đồng bộ Google Sheet
          </Button>
          <Button variant="ghost" size="sm" onClick={() => showToast("Đã gộp khách hàng từ dự án", "success")}>
            🔗 Gộp từ dự án
          </Button>
          <Button variant="primary" size="sm" onClick={handleAddClient}>
            + Thêm khách hàng
          </Button>
        </div>
      </div>

      <div className="cl-wrap">
        <ClientList clients={clients} selectedId={selectedId} onSelect={(client) => setSelectedId(client.id)} />
        {selectedClient ? <ClientDetail client={selectedClient} onUpdateClient={handleUpdateClient} /> : <ClientEmptyState />}
      </div>
    </div>
  );
}

function ClientEmptyState() {
  return (
    <div className="cl-detail cl-empty">
      <div>Chọn một khách hàng ở danh sách bên trái để xem hồ sơ, quy trình và trao đổi.</div>
    </div>
  );
}
