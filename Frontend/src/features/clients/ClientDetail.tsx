import { useEffect, useState } from "react";
import type { ClientItem, ClientStatus, StageStatus, ClientStages } from "../../api/clients";
import type { EmployeeListItem } from "../../api/employees";
import type { ProjectOptionItem } from "../../api/projects";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

interface ClientDetailProps {
  client: ClientItem;
  employees: EmployeeListItem[];
  projects: ProjectOptionItem[];
  onPatch: (patch: {
    status?: ClientStatus;
    owner_id?: string | null;
    contract_info?: string;
    notes?: string;
    source?: string;
    linked_project_id?: string | null;
    stages?: Partial<ClientStages>;
  }) => void;
  onAddComment: (content: string) => void;
}

const STAGES_CONFIG: { key: keyof ClientStages; label: string }[] = [
  { key: "rnd", label: "R&D" },
  { key: "define", label: "Define" },
  { key: "suggest", label: "Suggest & Select" },
  { key: "solution", label: "Solution" },
];

export function ClientDetail({ client, employees, projects, onPatch, onAddComment }: ClientDetailProps) {
  const { showToast } = useToast();
  const [contractInfo, setContractInfo] = useState(client.contract_info || "");
  const [notes, setNotes] = useState(client.notes || "");
  const [shareEmail, setShareEmail] = useState("");
  const [newComment, setNewComment] = useState("");
  const [linkProjectId, setLinkProjectId] = useState("0");

  useEffect(() => {
    setContractInfo(client.contract_info || "");
    setNotes(client.notes || "");
    setShareEmail("");
    setNewComment("");
    setLinkProjectId("0");
  }, [client.id]);

  const handleStageChange = (stageKey: keyof ClientStages, nextStatus: StageStatus) => {
    onPatch({ stages: { [stageKey]: nextStatus } });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment("");
  };

  return (
    <div className="cl-detail">
      <div className="cl-d-head">
        <div>
          <h2 className="cl-d-name">{client.name}</h2>
          <div className="cl-d-sub">
            {client.contact_name} ({client.contact_role}) · {client.phone}
          </div>
        </div>
        <div className="cl-d-src muted">{client.source || "✍️ Nhập tay"}</div>
      </div>

      <div className="cl-d-row3">
        <label className="cl-fld">
          Trạng thái
          <select value={client.status} onChange={(e) => onPatch({ status: e.target.value as ClientStatus })}>
            <option value="lead">Tiềm năng</option>
            <option value="active">Đang làm việc</option>
            <option value="closed">Đã chốt</option>
            <option value="lost">Ngừng</option>
          </select>
        </label>
        <label className="cl-fld">
          Người follow
          <select value={client.owner_id ?? ""} onChange={(e) => onPatch({ owner_id: e.target.value || null })}>
            <option value="">— Chưa gán —</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="cl-fld">
          Hợp đồng
          <input
            value={contractInfo}
            placeholder="VD: Đã ký 15/07, giá trị..."
            onChange={(e) => setContractInfo(e.target.value)}
            onBlur={() => onPatch({ contract_info: contractInfo })}
          />
        </label>
      </div>

      <div className="cl-sec">
        <div className="cl-sec-h">🚦 Quy trình triển khai - bước nào đã chốt / đang làm</div>
        <div className="cl-stages">
          {STAGES_CONFIG.map(({ key, label }) => (
            <div key={key} className="cl-stage">
              <div className="cl-stage-name">{label}</div>
              <div className="cl-stage-btns">
                <button type="button" className={`cl-stbtn ${client.stages[key] === "pending" ? "on cl-sp" : ""}`} onClick={() => handleStageChange(key, "pending")}>
                  Chưa
                </button>
                <button type="button" className={`cl-stbtn ${client.stages[key] === "doing" ? "on cl-sd" : ""}`} onClick={() => handleStageChange(key, "doing")}>
                  Đang làm
                </button>
                <button type="button" className={`cl-stbtn ${client.stages[key] === "done" ? "on cl-sx" : ""}`} onClick={() => handleStageChange(key, "done")}>
                  Đã chốt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cl-sec">
        <div className="cl-sec-h">📁 Dự án tương ứng</div>
        <p className="muted">{client.linked_project_name ? `Đã gắn dự án: ${client.linked_project_name}` : "Chưa gắn dự án nào."}</p>
        <div className="cl-link-row">
          <select value={linkProjectId} onChange={(e) => setLinkProjectId(e.target.value)}>
            <option value="0">+ Gắn dự án có sẵn...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (linkProjectId === "0") return;
              onPatch({ linked_project_id: linkProjectId });
              showToast("Đã liên kết dự án", "success");
            }}
          >
            Gắn
          </Button>
        </div>
      </div>

      <div className="cl-sec">
        <div className="cl-sec-h">🔗 Chia sẻ cho khách hàng (verify qua email)</div>
        <div className="cl-share-note">Khách nhận email, bấm xác nhận để verify đúng email của họ, sau đó vào cổng cùng trao đổi và xem thông tin cần thiết.</div>
        <div className="cl-link-row">
          <input type="email" placeholder="email@khachhang.com" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} />
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (!shareEmail.trim()) {
                showToast("Vui lòng nhập email khách hàng", "danger");
                return;
              }
              // TODO: gửi email verify thật — cần cấu hình SMTP + cổng khách hàng công khai
              // (chưa có hạ tầng email trong hệ thống). Hiện chỉ là demo UI.
              showToast(`Đã gửi lời mời verify đến ${shareEmail}`, "success");
              setShareEmail("");
            }}
          >
            Gửi lời mời
          </Button>
        </div>
      </div>

      <div className="cl-sec">
        <div className="cl-sec-h">📝 Ghi chú nội bộ</div>
        <textarea className="cl-note" placeholder="Ghi chú nội bộ (khách hàng không thấy)..." value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => onPatch({ notes })} />
      </div>

      <div className="cl-sec">
        <div className="cl-sec-h">
          💬 Trao đổi <small className="muted">(nội bộ + khách hàng đã verify)</small>
        </div>
        <div className="cl-comments">
          {client.comments && client.comments.length ? (
            client.comments.map((comment) => (
              <div key={comment.id} className="cl-comment">
                <Avatar name={comment.author_name} size={24} />
                <div>
                  <b>{comment.author_name}</b> <small className="muted">· {new Date(comment.created_at).toLocaleString("vi-VN")}</small>
                  <p>{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="muted">Chưa có trao đổi nào.</div>
          )}
        </div>
        <div className="cl-cmt-form">
          <textarea
            rows={2}
            placeholder="Nhập trao đổi... (Ctrl+Enter để gửi)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <Button variant="primary" size="sm" onClick={handleAddComment}>
            Gửi
          </Button>
        </div>
      </div>
    </div>
  );
}
