import { useEffect, useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../auth/AuthContext";
import { getDepartments, type DepartmentOption } from "../api/companies";
import {
  getJobPostings,
  createJobPosting,
  updateJobPosting,
  getCandidates,
  updateCandidate,
  generateJd,
  type JobPostingItem,
  type CandidateItem,
  type CandidateStage,
} from "../api/recruitment";

const STAGE_LABELS: Record<CandidateStage, string> = {
  applied: "Mới nộp",
  screening: "Sàng lọc",
  interview: "Phỏng vấn",
  offer: "Đề nghị",
  hired: "Đã tuyển",
  rejected: "Từ chối",
};

const LEVELS = ["Lv 1 · Thử việc", "Lv 2 · Chính thức", "Lv 3 · Vững vàng", "Lv 4 · Nòng cốt", "Lv 5 · Chuyên gia", "Lv 6 · Lãnh đạo"];

export function RecruitmentPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<JobPostingItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [candidatesByJob, setCandidatesByJob] = useState<Record<string, CandidateItem[]>>({});
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [deptId, setDeptId] = useState("");
  const [level, setLevel] = useState(LEVELS[1]);
  const [reqs, setReqs] = useState("");
  const [jd, setJd] = useState("");
  const [channels, setChannels] = useState("TopCV, VietnamWorks, LinkedIn, Facebook");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    setLoading(true);
    Promise.all([getJobPostings(companyId), getDepartments(companyId)])
      .then(([jobs, depts]) => {
        if (!isMounted) return;
        setPosts(jobs);
        setDepartments(depts);
        if (depts.length && !deptId) setDeptId(depts[0].id);
      })
      .catch(() => showToast("Không tải được danh sách tuyển dụng", "danger"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, showToast]);

  function handleAiGenerateJd() {
    if (!title.trim()) {
      showToast("Vui lòng nhập vị trí tuyển để AI viết JD", "default");
      return;
    }
    setIsAiGenerating(true);
    const departmentName = departments.find((d) => d.id === deptId)?.name || "";
    generateJd({ title: title.trim(), department: departmentName, level, requirements_note: reqs, company_id: companyId || undefined })
      .then((res) => {
        setJd(res.jd);
        showToast(res.source === "ai" ? "AI đã soạn thảo xong JD" : "Đã tạo JD từ mẫu (chưa bật AI cho công ty)", "success");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "AI viết JD thất bại", "danger"))
      .finally(() => setIsAiGenerating(false));
  }

  function handleCreatePost(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !companyId) return;
    setIsSubmitting(true);
    createJobPosting(companyId, { title: title.trim(), department_id: deptId || undefined, level, requirements_note: reqs, jd, channels })
      .then((post) => {
        setPosts((prev) => [post, ...prev]);
        setTitle("");
        setReqs("");
        setJd("");
        showToast("Đã tạo tin tuyển dụng mới thành công", "success");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Tạo tin tuyển dụng thất bại", "danger"))
      .finally(() => setIsSubmitting(false));
  }

  function handleToggleStatus(post: JobPostingItem) {
    const nextStatus = post.status === "open" ? "closed" : "open";
    updateJobPosting(post.id, { status: nextStatus })
      .then((updated) => {
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast(nextStatus === "closed" ? "Đã đóng tin tuyển dụng" : "Đã mở lại tin tuyển dụng", "success");
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Cập nhật trạng thái thất bại", "danger"));
  }

  function handleCopyLink(post: JobPostingItem) {
    const url = `${window.location.origin}/apply/${post.public_token}`;
    navigator.clipboard
      .writeText(url)
      .then(() => showToast("Đã copy link ứng tuyển công khai", "success"))
      .catch(() => showToast("Không copy được link, vui lòng copy thủ công", "danger"));
  }

  function handleToggleCandidates(post: JobPostingItem) {
    if (expandedJobId === post.id) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(post.id);
    if (!candidatesByJob[post.id]) {
      getCandidates(post.id)
        .then((cs) => setCandidatesByJob((prev) => ({ ...prev, [post.id]: cs })))
        .catch(() => showToast("Không tải được danh sách ứng viên", "danger"));
    }
  }

  function patchCandidate(jobId: string, candidateId: string, patch: Partial<{ stage: CandidateStage; interview_at: string | null; rating: number | null }>) {
    updateCandidate(candidateId, patch)
      .then((updated) => {
        setCandidatesByJob((prev) => ({
          ...prev,
          [jobId]: (prev[jobId] || []).map((c) => (c.id === updated.id ? updated : c)),
        }));
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Cập nhật ứng viên thất bại", "danger"));
  }

  return (
    <AppShellPage initialNavId="recruitment">
      <div className="page-head">
        <h1>🧑‍💼 Tuyển dụng</h1>
        <p className="page-sub">
          Tạo tin → <b>AI viết JD</b> → chia sẻ <b>link ứng tuyển công khai</b> (CV tự đổ về) + copy text đăng TopCV/VietnamWorks/LinkedIn/Facebook → quản lý <b>pipeline CV</b> &amp; <b>xếp lịch phỏng vấn</b>.
        </p>
      </div>

      {/* TODO: yêu cầu tuyển dụng gửi từ các phòng ban — chưa có model/luồng riêng, chưa làm */}
      <Panel>
        <div className="panel-h">📥 Yêu cầu tuyển dụng từ các phòng ban</div>
        <p className="muted" style={{ fontSize: 13, padding: "4px 0" }}>
          Chưa có yêu cầu nào. Các phòng ban gửi qua mục "Yêu cầu tuyển dụng".
        </p>
      </Panel>

      <Panel>
        <div className="panel-h">➕ Tin tuyển dụng mới</div>
        <form onSubmit={handleCreatePost} className="settings-form" style={{ maxWidth: 760 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ flex: 2, minWidth: 220 }}>
              Vị trí tuyển <span className="text-red-500">*</span>
              <input type="text" required placeholder="VD: Nhân viên Kinh doanh" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>
              Phòng ban
              <select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>
              Cấp bậc
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {LEVELS.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Yêu cầu / ghi chú cho AI (tuỳ chọn)
            <input type="text" placeholder="VD: 2 năm kinh nghiệm, tiếng Anh giao tiếp, biết Excel…" value={reqs} onChange={(e) => setReqs(e.target.value)} />
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0" }}>
            <Button type="button" variant="ghost" size="sm" onClick={handleAiGenerateJd} disabled={isAiGenerating}>
              {isAiGenerating ? "⏳ AI đang soạn JD..." : "🤖 AI viết JD"}
            </Button>
          </div>

          <label>
            Bản mô tả công việc (JD)
            <textarea rows={8} placeholder="Bấm 'AI viết JD' hoặc tự nhập…" value={jd} onChange={(e) => setJd(e.target.value)} />
          </label>

          <label>
            Kênh đăng (tuỳ chọn, phân tách bởi dấu phẩy)
            <input type="text" placeholder="TopCV, VietnamWorks, LinkedIn, Facebook" value={channels} onChange={(e) => setChannels(e.target.value)} />
          </label>

          <Button variant="primary" type="submit" disabled={isSubmitting} style={{ alignSelf: "flex-start", marginTop: 8 }}>
            📢 Đăng tin
          </Button>
        </form>
      </Panel>

      <Panel>
        <div className="panel-h">Danh sách tin tuyển dụng</div>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Đang tải dữ liệu từ máy chủ...</div>
        ) : posts.length === 0 ? (
          <p className="muted" style={{ fontSize: 13, padding: "8px 0" }}>
            Chưa có tin tuyển dụng. Tạo tin đầu tiên ở trên.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {posts.map((post) => (
              <div key={post.id} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <b style={{ fontSize: 15 }}>{post.title}</b>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: post.status === "open" ? "#10B98118" : "#EF444418",
                        color: post.status === "open" ? "#10B981" : "#EF4444",
                      }}
                    >
                      {post.status === "open" ? "Đang tuyển" : "Đã đóng"}
                    </span>
                    <span className="muted" style={{ fontSize: 12 }}>
                      · {post.candidate_count} ứng viên
                    </span>
                  </div>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {new Date(post.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  Phòng ban: {post.department || "—"} • Cấp bậc: {post.level || "—"} • Kênh đăng: {post.channels || "—"}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <Button size="sm" variant="ghost" onClick={() => handleCopyLink(post)}>
                    🔗 Copy link ứng tuyển
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(post)}>
                    {post.status === "open" ? "Đóng tin" : "Mở lại tin"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleCandidates(post)}>
                    {expandedJobId === post.id ? "Ẩn ứng viên" : "Xem ứng viên"}
                  </Button>
                </div>

                {post.jd && (
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: 12,
                      background: "var(--panel)",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      marginTop: 8,
                    }}
                  >
                    {post.jd}
                  </pre>
                )}

                {expandedJobId === post.id && (
                  <div className="table-wrap" style={{ marginTop: 10 }}>
                    <table className="task-table">
                      <thead>
                        <tr>
                          <th>Ứng viên</th>
                          <th>Liên hệ</th>
                          <th>CV</th>
                          <th>Giai đoạn</th>
                          <th>Lịch PV</th>
                          <th>Đánh giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(candidatesByJob[post.id] || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="muted" style={{ textAlign: "center", padding: 12 }}>
                              Chưa có ứng viên nộp CV.
                            </td>
                          </tr>
                        ) : (
                          (candidatesByJob[post.id] || []).map((c) => (
                            <tr key={c.id}>
                              <td>{c.full_name}</td>
                              <td className="muted" style={{ fontSize: 12 }}>
                                {c.email || "—"} {c.phone ? `· ${c.phone}` : ""}
                              </td>
                              <td>
                                {c.cv_file_url ? (
                                  <a href={c.cv_file_url} target="_blank" rel="noreferrer">
                                    📄 Xem CV
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td>
                                <select value={c.stage} onChange={(e) => patchCandidate(post.id, c.id, { stage: e.target.value as CandidateStage })}>
                                  {(Object.keys(STAGE_LABELS) as CandidateStage[]).map((s) => (
                                    <option key={s} value={s}>
                                      {STAGE_LABELS[s]}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="datetime-local"
                                  value={c.interview_at ? c.interview_at.slice(0, 16) : ""}
                                  onChange={(e) => patchCandidate(post.id, c.id, { interview_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                  style={{ padding: "4px 6px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12 }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min={0}
                                  max={10}
                                  step={0.5}
                                  value={c.rating ?? ""}
                                  onChange={(e) => patchCandidate(post.id, c.id, { rating: e.target.value === "" ? null : Number(e.target.value) })}
                                  style={{ width: 60, padding: "4px 6px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12 }}
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShellPage>
  );
}
