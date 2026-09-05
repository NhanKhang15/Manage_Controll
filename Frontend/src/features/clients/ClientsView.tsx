import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { getClients, getClient, createClient, updateClient, addClientComment, type ClientItem } from "../../api/clients";
import { getEmployees, type EmployeeListItem } from "../../api/employees";
import { getProjectOptions, type ProjectOptionItem } from "../../api/projects";
import { ClientDetail } from "./ClientDetail";
import { ClientList } from "./ClientList";

export function ClientsView() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [projects, setProjects] = useState<ProjectOptionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    setLoading(true);
    Promise.all([getClients(companyId), getEmployees(companyId, { compact: true }), getProjectOptions(companyId)])
      .then(([cs, emps, projs]) => {
        if (!isMounted) return;
        setClients(cs);
        setEmployees(emps);
        setProjects(projs);
      })
      .catch(() => showToast("Không tải được danh sách khách hàng", "danger"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [companyId, showToast]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedClient(null);
      return;
    }
    let isMounted = true;
    getClient(selectedId)
      .then((c) => {
        if (isMounted) setSelectedClient(c);
      })
      .catch(() => showToast("Không tải được hồ sơ khách hàng", "danger"));
    return () => {
      isMounted = false;
    };
  }, [selectedId, showToast]);

  const handleAddClient = () => {
    if (!companyId) return;
    createClient(companyId, { name: "Khách hàng mới", status: "lead" })
      .then((created) => {
        setClients((prev) => [created, ...prev]);
        setSelectedId(created.id);
        setSelectedClient(created);
        showToast("Đã tạo khách hàng mới", "success");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Tạo khách hàng thất bại", "danger"));
  };

  const handlePatch = (patch: Parameters<typeof updateClient>[1]) => {
    if (!selectedClient) return;
    updateClient(selectedClient.id, patch)
      .then((updated) => {
        setSelectedClient(updated);
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Cập nhật thất bại", "danger"));
  };

  const handleAddComment = (content: string) => {
    if (!selectedClient) return;
    addClientComment(selectedClient.id, content, true)
      .then((comment) => {
        setSelectedClient((prev) => (prev ? { ...prev, comments: [...(prev.comments || []), comment] } : prev));
        showToast("Đã thêm trao đổi nội bộ", "success");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Gửi trao đổi thất bại", "danger"));
  };

  return (
    <div>
      <div className="page-head clients-head">
        <h1>Khách hàng</h1>
        <div className="cl-actions">
          {/* TODO: đồng bộ 2 chiều với Google Sheet — cần tích hợp Google Sheets API, chưa làm */}
          <Button variant="ghost" size="sm" onClick={() => showToast("Tính năng đồng bộ Google Sheet đang phát triển", "default")}>
            🔗 Đồng bộ Google Sheet
          </Button>
          {/* TODO: gộp khách hàng tự động từ dữ liệu dự án — logic ghép nối chưa rõ, chưa làm */}
          <Button variant="ghost" size="sm" onClick={() => showToast("Tính năng gộp từ dự án đang phát triển", "default")}>
            🔗 Gộp từ dự án
          </Button>
          <Button variant="primary" size="sm" onClick={handleAddClient}>
            + Thêm khách hàng
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Đang tải dữ liệu từ máy chủ...</div>
      ) : (
        <div className="cl-wrap">
          <ClientList clients={clients} selectedId={selectedId} onSelect={(client) => setSelectedId(client.id)} />
          {selectedClient ? (
            <ClientDetail client={selectedClient} employees={employees} projects={projects} onPatch={handlePatch} onAddComment={handleAddComment} />
          ) : (
            <ClientEmptyState />
          )}
        </div>
      )}
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
