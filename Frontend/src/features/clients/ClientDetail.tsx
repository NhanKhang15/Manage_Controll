import { useEffect, useState } from "react";
import type { Client, ClientComment, ClientStatus, StageStatus } from "../../types/client";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

interface ClientDetailProps {
  client: Client;
  onUpdateClient: (updated: Client) => void;
}

const STAGES_CONFIG: { key: keyof Client["stages"]; label: string }[] = [
  { key: "rnd", label: "R&D" },
  { key: "define", label: "Define" },
  { key: "suggest", label: "Suggest & Select" },
  { key: "solution", label: "Solution" },
];

const OWNERS = ["Đặng Quốc Huy", "Joseph Tuấn", "Lê Xuân Huy", "Trần Hữu Thành", "Hoàng Sơn", "Nguyễn Thu Lan", "Vũ Minh An", "Mai Trang", "Phương Nga", "Duy Khánh"];

export function ClientDetail({ client, onUpdateClient }: ClientDetailProps) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [ownerName, setOwnerName] = useState(client.ownerName);
  const [contractInfo, setContractInfo] = useState(client.contractInfo || "");
  const [stages, setStages] = useState(client.stages);
  const [notes, setNotes] = useState(client.notes || "");
  const [shareEmail, setShareEmail] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<ClientComment[]>(client.comments || []);

  useEffect(() => {
    setStatus(client.status);
    setOwnerName(client.ownerName);
    setContractInfo(client.contractInfo || "");
    setStages(client.stages);
    setNotes(client.notes || "");
    setComments(client.comments || []);
  }, [client]);

  const patchClient = (patch: Partial<Client>) => onUpdateClient({ ...client, ...patch });

  const handleStageChange = (stageKey: keyof Client["stages"], nextStatus: StageStatus) => {
    const nextStages = { ...stages, [stageKey]: nextStatus };
    setStages(nextStages);
    patchClient({ stages: nextStages });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const item: ClientComment = {
      id: `c_${Date.now()}`,
      authorName: "Đặng Quốc Huy",
      content: newComment.trim(),
      createdAt: "Vừa xong",
      isInternal: true,
    };
    const nextComments = [...comments, item];
    setComments(nextComments);
    setNewComment("");
    patchClient({ comments: nextComments });
    showToast("Đã thêm trao đổi nội bộ", "success");
  };

  return (
    <div className="cl-detail">
      <div className="cl-d-head">
        <div>
          <h2 className="cl-d-name">{client.name}</h2>
          <div className="cl-d-sub">
            {client.contactName} ({client.contactRole}) · {client.phone}
          </div>
        </div>
        <div className="cl-d-src muted">{client.source || "✍️ Nhập tay"}</div>
      </div>

      <div className="cl-d-row3">
        <label className="cl-fld">
          Trạng thái
          <select
            value={status}
            onChange={(e) => {
              const value = e.target.value as ClientStatus;
              setStatus(value);
              patchClient({ status: value });
            }}
          >
            <option value="lead">Tiềm năng</option>
            <option value="active">Đang làm việc</option>
            <option value="closed">Đã chốt</option>
            <option value="lost">Ngừng</option>
          </select>
        </label>
        <label className="cl-fld">
          Người follow
          <select
            value={ownerName}
            onChange={(e) => {
              setOwnerName(e.target.value);
              patchClient({ ownerName: e.target.value });
            }}
          >
            {OWNERS.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </label>
        <label className="cl-fld">
          Hợp đồng
          <input value={contractInfo} placeholder="VD: Đã ký 15/07, giá trị..." onChange={(e) => setContractInfo(e.target.value)} onBlur={() => patchClient({ contractInfo })} />
        </label>
      </div>

      <div className="cl-sec">
        <div className="cl-sec-h">🚦 Quy trình triển khai - bước nào đã chốt / đang làm</div>
        <div className="cl-stages">
          {STAGES_CONFIG.map(({ key, label }) => (
            <div key={key} className="cl-stage">
              <div className="cl-stage-name">{label}</div>
              <div className="cl-stage-btns">
                <button type="button" className={`cl-stbtn ${stages[key] === "pending" ? "on cl-sp" : ""}`} onClick={() => handleStageChange(key, "pending")}>
                  Chưa
                </button>
                <button type="button" className={`cl-stbtn ${stages[key] === "doing" ? "on cl-sd" : ""}`} onClick={() => handleStageChange(key, "doing")}>
                  Đang làm
                </button>
                <button type="button" className={`cl-stbtn ${stages[key] === "done" ? "on cl-sx" : ""}`} onClick={() => handleStageChange(key, "done")}>
                  Đã chốt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cl-sec">
        <div className="cl-sec-h">📁 Dự án tương ứng</div>
        <p className="muted">{client.linkedProjectId ? `Đã gắn dự án ID: ${client.linkedProjectId}` : "Chưa gắn dự án nào."}</p>
        <div className="cl-link-row">
          <select defaultValue="0">
            <option value="0">+ Gắn dự án có sẵn...</option>
            <option value="1">Số hóa quy trình bán hàng</option>
            <option value="2">Tuyển dụng & Onboarding</option>
          </select>
          <Button variant="ghost" size="sm" onClick={() => showToast("Đã liên kết dự án", "success")}>
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
        <textarea className="cl-note" placeholder="Ghi chú nội bộ (khách hàng không thấy)..." value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => patchClient({ notes })} />
      </div>

      <div className="cl-sec">
        <div className="cl-sec-h">💬 Trao đổi <small className="muted">(nội bộ + khách hàng đã verify)</small></div>
        <div className="cl-comments">
          {comments.length ? (
            comments.map((comment) => (
              <div key={comment.id} className="cl-comment">
                <Avatar name={comment.authorName} size={24} src={comment.authorAvatar} />
                <div>
                  <b>{comment.authorName}</b> <small className="muted">· {comment.createdAt}</small>
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
