import { useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export interface ProposalItem {
  id: string;
  title: string;
  amount: string;
  note: string;
  requester: string;
  status: "pending" | "approved" | "rejected";
}

export function ProposalsPage() {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [content, setContent] = useState("");

  const [pendingProposals, setPendingProposals] = useState<ProposalItem[]>([
    { id: "p1", title: "Tạm ứng 50% hợp đồng CRM", amount: "425 triệu", note: "Nhà cung cấp yêu cầu tạm ứng trước khi triển khai", requester: "Hoàng Sơn", status: "pending" },
    { id: "p2", title: "Mua gói API Zalo OA", amount: "15 triệu", note: "15tr/năm — kết nối Zalo OA vào CRM", requester: "Nguyễn Thu Lan", status: "pending" },
    { id: "p3", title: "Ngân sách OCR FPT.AI", amount: "12 triệu", note: "12tr/năm theo chốt cuộc họp OCR", requester: "Đặng Quốc Huy", status: "pending" },
  ]);

  const [myProposals, setMyProposals] = useState<ProposalItem[]>([]);

  function handleCreateProposal(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: ProposalItem = {
      id: `prop-${Date.now()}`,
      title: title.trim(),
      amount: amount > 0 ? `${amount} VNĐ` : "0 VNĐ",
      note: content.trim(),
      requester: "Lê Xuân Huy",
      status: "pending",
    };

    setMyProposals((prev) => [newItem, ...prev]);
    setTitle("");
    setAmount(0);
    setContent("");
    showToast("Đã gửi đề xuất thành công", "success");
  }

  function handleApprove(id: string) {
    setPendingProposals((prev) => prev.filter((p) => p.id !== id));
    showToast("Đã duyệt đề xuất thành công", "success");
  }

  function handleReject(id: string) {
    setPendingProposals((prev) => prev.filter((p) => p.id !== id));
    showToast("Đã từ chối đề xuất", "default");
  }

  return (
    <AppShellPage initialNavId="proposals">
      <div className="page-head">
        <h1>👋 Đề xuất &amp; duyệt</h1>
        <p className="page-sub">Gửi đề xuất (mua sắm, tạm ứng, chi phí…) và theo dõi duyệt.</p>
      </div>

      {/* New Proposal Form */}
      <Panel>
        <div className="panel-h">Tạo đề xuất mới</div>
        <form onSubmit={handleCreateProposal} className="settings-form" style={{ maxWidth: 640 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ flex: 2, minWidth: 220 }}>
              Tiêu đề <span className="text-red-500">*</span>
              <input
                type="text"
                required
                placeholder="VD: Mua 5 màn hình cho phòng KD"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>
              Số tiền (đ)
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>
          </div>
          <label>
            Nội dung
            <textarea
              rows={3}
              placeholder="Mô tả chi tiết…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </label>
          <Button variant="primary" type="submit" style={{ alignSelf: "flex-start", marginTop: 6 }}>
            Gửi đề xuất
          </Button>
        </form>
      </Panel>

      {/* Pending Approval List */}
      <Panel>
        <div className="panel-h">Đề xuất chờ tôi duyệt ({pendingProposals.length})</div>
        {pendingProposals.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>Không có đề xuất nào chờ duyệt.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingProposals.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                }}
              >
                <div>
                  <b style={{ fontSize: 15 }}>{item.title}</b>{" "}
                  <span style={{ color: "var(--brand)", fontWeight: 700 }}>{item.amount}</span>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {item.note} · Đề xuất bởi <b>{item.requester}</b>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button size="sm" variant="approve" onClick={() => handleApprove(item.id)}>
                    ✓ Duyệt
                  </Button>
                  <Button size="sm" variant="reject" onClick={() => handleReject(item.id)}>
                    ✕ Từ chối
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* My Proposals */}
      <Panel>
        <div className="panel-h">Đề xuất của tôi</div>
        {myProposals.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>Chưa có đề xuất nào.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myProposals.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  fontSize: 13,
                }}
              >
                <div>
                  <b>{item.title}</b> ({item.amount}) <span className="muted">{item.note && `• ${item.note}`}</span>
                </div>
                <span className="alert-tag alert-soft">Chờ duyệt</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShellPage>
  );
}
