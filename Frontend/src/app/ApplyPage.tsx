import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { getPublicJobPosting, applyToJobPosting, type PublicJobPosting } from "../api/recruitment";

const CV_ALLOWED_EXT = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

/**
 * ApplyPage — trang ứng tuyển công khai (/apply/:token), không đăng nhập,
 * không dùng Sidebar/Topbar. Link được HR copy từ trang Tuyển dụng.
 */
export function ApplyPage() {
  const { token } = useParams<{ token: string }>();
  const [posting, setPosting] = useState<PublicJobPosting | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) return;
    getPublicJobPosting(token)
      .then(setPosting)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Không tải được tin tuyển dụng"))
      .finally(() => setLoading(false));
  }, [token]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !fullName.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    applyToJobPosting(token, {
      full_name: fullName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      cover_letter: coverLetter.trim() || undefined,
      cv_file: fileRef.current?.files?.[0] || null,
    })
      .then(() => setSubmitted(true))
      .catch((err) => setSubmitError(err instanceof Error ? err.message : "Nộp hồ sơ thất bại"))
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="login-body">
      <div className="login-card" style={{ maxWidth: 560, width: "100%" }}>
        {loading ? (
          <p className="muted" style={{ textAlign: "center", padding: 24 }}>
            Đang tải thông tin tuyển dụng...
          </p>
        ) : loadError || !posting ? (
          <p style={{ textAlign: "center", padding: 24, color: "#EF4444" }}>{loadError || "Tin tuyển dụng không tồn tại"}</p>
        ) : submitted ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 40 }}>✅</div>
            <h2 style={{ margin: "12px 0 6px" }}>Đã gửi hồ sơ ứng tuyển!</h2>
            <p className="muted">
              Cảm ơn bạn đã ứng tuyển vị trí <b>{posting.title}</b> tại <b>{posting.company_name}</b>. Đội ngũ tuyển dụng sẽ liên hệ với bạn qua email/số điện thoại đã cung cấp.
            </p>
          </div>
        ) : (
          <>
            <p className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
              {posting.company_name} tuyển dụng
            </p>
            <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>{posting.title}</h1>
            <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
              {posting.department ? `${posting.department} · ` : ""}
              {posting.level || ""}
            </p>

            {posting.jd && (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 13,
                  background: "var(--panel)",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  marginBottom: 20,
                  maxHeight: 260,
                  overflowY: "auto",
                }}
              >
                {posting.jd}
              </pre>
            )}

            <form onSubmit={handleSubmit} className="settings-form">
              <label>
                Họ và tên <span className="text-red-500">*</span>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
              </label>
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              </label>
              <label>
                Số điện thoại
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" />
              </label>
              <label>
                CV đính kèm (PDF/DOC/DOCX/ảnh, tối đa 10MB)
                <input type="file" ref={fileRef} accept={CV_ALLOWED_EXT} />
              </label>
              <label>
                Thư giới thiệu (tuỳ chọn)
                <textarea rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Giới thiệu ngắn gọn về bản thân..." />
              </label>

              {submitError && <p style={{ color: "#EF4444", fontSize: 13 }}>{submitError}</p>}

              <Button variant="primary" type="submit" disabled={submitting} style={{ alignSelf: "flex-start", marginTop: 8 }}>
                {submitting ? "Đang gửi..." : "📩 Gửi hồ sơ ứng tuyển"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
