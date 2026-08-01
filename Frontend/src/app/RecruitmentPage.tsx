import { useState, type FormEvent } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export interface RecruitmentPost {
  id: string;
  title: string;
  department: string;
  level: string;
  jd: string;
  channels: string;
  createdAt: string;
}

export function RecruitmentPage() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<RecruitmentPost[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState("Kinh doanh");
  const [level, setLevel] = useState("Lv 2 · Chính thức");
  const [reqs, setReqs] = useState("");
  const [jd, setJd] = useState("");
  const [channels, setChannels] = useState("TopCV, VietnamWorks, LinkedIn, Facebook");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  function handleAiGenerateJd() {
    if (!title.trim()) {
      showToast("Vui lòng nhập vị trí tuyển để AI viết JD", "default");
      return;
    }
    setIsAiGenerating(true);
    setTimeout(() => {
      setJd(
        `MÔ TẢ CÔNG VIỆC VỊ TRÍ: ${title.toUpperCase()}\n` +
          `• Phòng ban: ${dept}\n` +
          `• Cấp bậc: ${level}\n` +
          `• Yêu cầu: ${reqs || "Có kinh nghiệm tương đương, kỹ năng làm việc nhóm tốt."}\n\n` +
          `NHIỆM VỤ CHÍNH:\n` +
          `1. Phối hợp cùng nhóm hoàn thành các chỉ tiêu công việc được giao.\n` +
          `2. Lập báo cáo định kỳ cho cấp quản lý.\n` +
          `3. Thực hiện các nhiệm vụ phát sinh theo chỉ đạo.\n\n` +
          `QUYỀN LỢI:\n` +
          `• Mức lương cạnh tranh theo năng lực.\n` +
          `• BHXH, BHYT đầy đủ theo quy định nhà nước.\n` +
          `• Môi trường làm việc năng động, lộ trình thăng tiến rõ ràng.`
      );
      setIsAiGenerating(false);
      showToast("AI đã soạn thảo xong JD mẫu", "success");
    }, 800);
  }

  function handleCreatePost(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newPost: RecruitmentPost = {
      id: `rc-${Date.now()}`,
      title: title.trim(),
      department: dept,
      level,
      jd,
      channels,
      createdAt: "Vừa xong",
    };

    setPosts((prev) => [newPost, ...prev]);
    setTitle("");
    setReqs("");
    setJd("");
    showToast("Đã tạo tin tuyển dụng mới thành công", "success");
  }

  return (
    <AppShellPage initialNavId="recruitment">
      <div className="page-head">
        <h1>🧑‍💼 Tuyển dụng</h1>
        <p className="page-sub">
          Tạo tin → <b>AI viết JD</b> → chia sẻ <b>link ứng tuyển công khai</b> (CV tự đổ về) + copy text đăng TopCV/VietnamWorks/LinkedIn/Facebook → quản lý <b>pipeline CV</b> &amp; <b>xếp lịch phỏng vấn</b>.
        </p>
      </div>

      {/* Panel 1: Department Requests */}
      <Panel>
        <div className="panel-h">📥 Yêu cầu tuyển dụng từ các phòng ban</div>
        <p className="muted" style={{ fontSize: 13, padding: "4px 0" }}>
          Chưa có yêu cầu nào. Các phòng ban gửi qua mục "Yêu cầu tuyển dụng".
        </p>
      </Panel>

      {/* Panel 2: New Recruitment Post Form */}
      <Panel>
        <div className="panel-h">➕ Tin tuyển dụng mới</div>
        <form onSubmit={handleCreatePost} className="settings-form" style={{ maxWidth: 760 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ flex: 2, minWidth: 220 }}>
              Vị trí tuyển <span className="text-red-500">*</span>
              <input
                type="text"
                required
                placeholder="VD: Nhân viên Kinh doanh"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>
              Phòng ban
              <select value={dept} onChange={(e) => setDept(e.target.value)}>
                <option value="Ban Giám đốc">Ban Giám đốc</option>
                <option value="Công nghệ">Công nghệ</option>
                <option value="Kinh doanh">Kinh doanh</option>
                <option value="Kế toán">Kế toán</option>
                <option value="Marketing">Marketing</option>
                <option value="Nhân sự">Nhân sự</option>
                <option value="Sales">Sales</option>
                <option value="Sản phẩm">Sản phẩm</option>
                <option value="Vận hành">Vận hành</option>
              </select>
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>
              Cấp bậc
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="Lv 1 · Thử việc">Lv 1 · Thử việc</option>
                <option value="Lv 2 · Chính thức">Lv 2 · Chính thức</option>
                <option value="Lv 3 · Vững vàng">Lv 3 · Vững vàng</option>
                <option value="Lv 4 · Nòng cốt">Lv 4 · Nòng cốt</option>
                <option value="Lv 5 · Chuyên gia">Lv 5 · Chuyên gia</option>
                <option value="Lv 6 · Lãnh đạo">Lv 6 · Lãnh đạo</option>
              </select>
            </label>
          </div>

          <label>
            Yêu cầu / ghi chú cho AI (tuỳ chọn)
            <input
              type="text"
              placeholder="VD: 2 năm kinh nghiệm, tiếng Anh giao tiếp, biết Excel…"
              value={reqs}
              onChange={(e) => setReqs(e.target.value)}
            />
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0" }}>
            <Button type="button" variant="ghost" size="sm" onClick={handleAiGenerateJd} disabled={isAiGenerating}>
              {isAiGenerating ? "⏳ AI đang soạn JD..." : "🤖 AI viết JD"}
            </Button>
          </div>

          <label>
            Bản mô tả công việc (JD)
            <textarea
              rows={8}
              placeholder="Bấm 'AI viết JD' hoặc tự nhập…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </label>

          <label>
            Kênh đăng (tuỳ chọn, phân tách bởi dấu phẩy)
            <input
              type="text"
              placeholder="TopCV, VietnamWorks, LinkedIn, Facebook"
              value={channels}
              onChange={(e) => setChannels(e.target.value)}
            />
          </label>

          <Button variant="primary" type="submit" style={{ alignSelf: "flex-start", marginTop: 8 }}>
            📢 Đăng tin
          </Button>
        </form>
      </Panel>

      {/* Panel 3: Recruitment Posts List */}
      <Panel>
        <div className="panel-h">Danh sách tin tuyển dụng</div>
        {posts.length === 0 ? (
          <p className="muted" style={{ fontSize: 13, padding: "8px 0" }}>
            Chưa có tin tuyển dụng. Tạo tin đầu tiên ở trên.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: 15 }}>{post.title}</b>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {post.createdAt}
                  </span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  Phòng ban: {post.department} • Cấp bậc: {post.level} • Kênh đăng: {post.channels}
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
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShellPage>
  );
}
