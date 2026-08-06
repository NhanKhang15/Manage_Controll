import { useEffect, useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../auth/AuthContext";
import { ProposalApprovalList } from "../features/proposals/ProposalApprovalList";
import { listProposals, createProposal, decideProposal, formatAmountVi, type Proposal } from "../api/proposals";

export function ProposalsPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const canApproveProposals = employee?.companies?.[0]?.can_approve_proposals ?? false;
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [pendingProposals, setPendingProposals] = useState<Proposal[]>([]);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    Promise.all([listProposals(companyId, "pending"), listProposals(companyId, "mine")])
      .then(([pending, mine]) => {
        if (!isMounted) return;
        setPendingProposals(pending);
        setMyProposals(mine);
      })
      .catch(() => showToast("Không tải được danh sách đề xuất", "danger"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [companyId, showToast]);

  async function handleCreateProposal(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !companyId || submitting) return;

    setSubmitting(true);
    try {
      const created = await createProposal({
        company_id: companyId,
        title: title.trim(),
        amount: amount > 0 ? amount : null,
        note: content.trim(),
      });
      setMyProposals((prev) => [created, ...prev]);
      if (created.status === "pending") setPendingProposals((prev) => [created, ...prev]);
      setTitle("");
      setAmount(0);
      setContent("");
      showToast("Đã gửi đề xuất thành công", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không gửi được đề xuất", "danger");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDecide(proposal: Proposal, decision: "approved" | "rejected") {
    const snapshot = pendingProposals;
    setPendingProposals((prev) => prev.filter((p) => p.id !== proposal.id));
    try {
      const updated = await decideProposal(proposal.id, decision);
      setMyProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(decision === "approved" ? "Đã duyệt đề xuất thành công" : "Đã từ chối đề xuất", decision === "approved" ? "success" : "default");
    } catch (err) {
      setPendingProposals(snapshot);
      showToast(err instanceof Error ? err.message : "Không xử lý được đề xuất", "danger");
    }
  }

  return (
    <AppShellPage initialNavId="proposals">
      <div className="page-head">
        <h1>👋 Đề xuất &amp; duyệt</h1>
        <p className="page-sub">Gửi đề xuất (mua sắm, tạm ứng, chi phí…) và theo dõi duyệt.</p>
      </div>

      {!companyId ? (
        <Panel>Bạn chưa thuộc công ty nào nên chưa thể dùng tính năng đề xuất.</Panel>
      ) : (
        <>
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
                  <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                </label>
              </div>
              <label>
                Nội dung
                <textarea rows={3} placeholder="Mô tả chi tiết…" value={content} onChange={(e) => setContent(e.target.value)} />
              </label>
              <Button variant="primary" type="submit" disabled={submitting} style={{ alignSelf: "flex-start", marginTop: 6 }}>
                {submitting ? "Đang gửi…" : "Gửi đề xuất"}
              </Button>
            </form>
          </Panel>

          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              Đang tải dữ liệu từ máy chủ...
            </div>
          ) : (
            <>
              {/* Pending Approval List */}
              <Panel>
                <div className="panel-h">
                  {canApproveProposals ? "Đề xuất chờ tôi duyệt" : "Đề xuất chờ duyệt"} ({pendingProposals.length})
                </div>
                <ProposalApprovalList
                  proposals={pendingProposals}
                  onApprove={(p) => handleDecide(p, "approved")}
                  onReject={(p) => handleDecide(p, "rejected")}
                  canApprove={canApproveProposals}
                />
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
                          <b>{item.title}</b> ({formatAmountVi(item.amount)}){" "}
                          <span className="muted">{item.note && `• ${item.note}`}</span>
                        </div>
                        <span
                          className="alert-tag"
                          style={
                            item.status === "approved"
                              ? { background: "#DCFCE7", color: "#15803D" }
                              : item.status === "rejected"
                                ? { background: "#FEE2E2", color: "#B91C1C" }
                                : { background: "var(--brand-soft)", color: "var(--brand)" }
                          }
                        >
                          {item.status === "approved" ? "Đã duyệt" : item.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </>
          )}
        </>
      )}
    </AppShellPage>
  );
}
