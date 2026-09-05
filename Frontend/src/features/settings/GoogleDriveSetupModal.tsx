import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import {
  getGoogleDriveConfig,
  startGoogleDriveOAuth,
  updateGoogleDriveConfig,
  type GoogleDriveConfigStatus,
  type GoogleDriveSyncResult,
} from "../../api/integrations";

export interface GoogleDriveSetupModalProps {
  isOpen: boolean;
  companyId: string;
  companyName?: string;
  onClose: () => void;
  onSaved?: (status: GoogleDriveConfigStatus) => void;
}

/** Chấp nhận cả link "https://drive.google.com/drive/folders/<id>..." lẫn ID trần. */
function extractFolderId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : trimmed;
}

function labelStyle(): React.CSSProperties {
  return { display: "block", fontSize: 13, fontWeight: 600, color: "var(--text, #1E2632)", marginBottom: 6 };
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--line, #CBD5E1)",
    background: "var(--panel, #FFFFFF)",
    color: "var(--text, #1E2632)",
    fontSize: 13.5,
    outline: "none",
    boxSizing: "border-box",
  };
}

export function GoogleDriveSetupModal({ isOpen, companyId, companyName, onClose, onSaved }: GoogleDriveSetupModalProps) {
  const [status, setStatus] = useState<GoogleDriveConfigStatus | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [folderInput, setFolderInput] = useState("");
  const [resetExistingLinks, setResetExistingLinks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<GoogleDriveConfigStatus | null>(null);
  const popupRef = useRef<Window | null>(null);

  function loadStatus() {
    getGoogleDriveConfig(companyId)
      .then((res) => {
        setStatus(res);
        setFolderInput(res.root_folder_url || res.root_folder_id || "");
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (!isOpen) return;
    setResetExistingLinks(false);
    setError(null);
    setSaveResult(null);
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, companyId]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!e.data || e.data.type !== "google-drive-oauth-result") return;
      setConnecting(false);
      if (e.data.success) {
        loadStatus();
      } else {
        setError(e.data.message || "Đăng nhập Google thất bại, vui lòng thử lại.");
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !loading) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  async function handleConnectGoogle() {
    setError(null);
    setConnecting(true);
    try {
      const { auth_url } = await startGoogleDriveOAuth(companyId);
      popupRef.current = window.open(auth_url, "google-drive-oauth", "width=520,height=650");
      if (!popupRef.current) {
        setConnecting(false);
        setError("Trình duyệt đã chặn cửa sổ đăng nhập — vui lòng cho phép popup rồi thử lại.");
      }
    } catch (err: any) {
      setConnecting(false);
      setError(err.message || "Không mở được cửa sổ đăng nhập Google.");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    const folderId = extractFolderId(folderInput);
    if (!folderId) {
      setError("Vui lòng nhập link hoặc ID thư mục lưu trữ trên Google Drive.");
      return;
    }
    if (!status?.is_connected) {
      setError('Vui lòng bấm "Đăng nhập bằng Google" và hoàn tất trước.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await updateGoogleDriveConfig({
        company_id: companyId,
        root_folder_id: folderId,
        root_folder_url: folderInput.trim().startsWith("http") ? folderInput.trim() : undefined,
        reset_existing_links: resetExistingLinks,
      });
      setSaveResult(res);
      setStatus(res);
      onSaved?.(res);
    } catch (err: any) {
      setError(err.message || "Không thể lưu cấu hình Google Drive. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const resync: GoogleDriveSyncResult | null | undefined = saveResult?.resync;

  return (
    <div
      className="modal-back"
      style={{
        display: "grid",
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        placeItems: "center",
        zIndex: 999,
        padding: 20,
        animation: "fadeIn 0.18s ease-out",
      }}
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="modal"
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--panel, #FFFFFF)",
          borderRadius: 18,
          border: "1px solid var(--line, #ECEEF3)",
          boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.04)",
          padding: 26,
          position: "relative",
          animation: "slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
                color: "#1D4ED8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 22,
                border: "1px solid rgba(29, 78, 216, 0.15)",
              }}
            >
              ☁️
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text, #1E2632)" }}>
                {status?.is_connected ? "Đổi tài khoản Google Drive" : "Kết nối Google Drive"}
              </h2>
              <p style={{ margin: "3px 0 0 0", fontSize: 12.5, color: "var(--muted, #8A93A6)", lineHeight: 1.4 }}>
                {companyName ? `Riêng cho công ty "${companyName}"` : "Đăng nhập bằng tài khoản Gmail của bạn"}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Đóng"
            style={{
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8, border: "none", background: "transparent", color: "var(--muted, #8A93A6)",
              cursor: loading ? "not-allowed" : "pointer", fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* Bước 1: đăng nhập Google */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle()}>Bước 1 · Tài khoản Google</label>
          {status?.is_connected ? (
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 14px",
                background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: 12, fontSize: 13,
              }}
            >
              <span>✅ Đã đăng nhập: <b>{status.connected_email}</b></span>
              <Button type="button" variant="default" size="sm" onClick={handleConnectGoogle} disabled={connecting || loading}>
                {connecting ? "Đang mở..." : "Đổi tài khoản khác"}
              </Button>
            </div>
          ) : (
            <Button type="button" variant="primary" onClick={handleConnectGoogle} disabled={connecting} style={{ width: "100%" }}>
              {connecting ? "Đang mở cửa sổ đăng nhập..." : "🔵 Đăng nhập bằng Google"}
            </Button>
          )}
          <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "var(--muted, #8A93A6)" }}>
            Một cửa sổ Google sẽ mở ra để bạn chọn tài khoản và bấm Cho phép. Dùng tài khoản Gmail nào thì dữ liệu công ty này sẽ lưu trên Drive của Gmail đó.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Bước 2: thư mục lưu trữ */}
          <div>
            <label style={labelStyle()}>
              Bước 2 · Thư mục lưu trữ trên Drive <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
            </label>
            <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "var(--muted, #8A93A6)" }}>
              Mở Google Drive của tài khoản vừa đăng nhập, tạo (hoặc chọn) 1 thư mục để lưu toàn bộ dữ liệu công ty, rồi dán link thư mục đó vào đây.
            </p>
            <input
              type="text"
              value={folderInput}
              onChange={(e) => { setFolderInput(e.target.value); if (error) setError(null); }}
              disabled={loading || !status?.is_connected}
              placeholder="https://drive.google.com/drive/folders/..."
              style={inputStyle()}
            />
          </div>

          {status?.is_connected && (
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "var(--text, #1E2632)" }}>
              <input
                type="checkbox"
                checked={resetExistingLinks}
                onChange={(e) => setResetExistingLinks(e.target.checked)}
                disabled={loading}
                style={{ marginTop: 2 }}
              />
              <span>
                <b>Xoá liên kết Drive cũ và tạo lại toàn bộ dưới tài khoản này.</b>{" "}
                Chỉ áp dụng cho công ty này. Chọn khi vừa đổi hẳn sang tài khoản khác — folder/file cũ vẫn còn trên Drive tài khoản trước, chỉ là hệ thống không còn liên kết tới nữa.
              </span>
            </label>
          )}

          {error && (
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          {saveResult?.verify_error && (
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E", fontSize: 13 }}>
              ⚠️ Đã lưu cấu hình, nhưng chưa kiểm tra được kết nối: {saveResult.verify_error}
            </div>
          )}

          {resync && (
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#065F46", fontSize: 13 }}>
              ✅ {resync.message}
              {resync.errors.length > 0 && (
                <div style={{ marginTop: 4, color: "#92400E" }}>
                  {resync.errors.length} mục lỗi khi đồng bộ (xem log server để biết chi tiết).
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 14, borderTop: "1px solid var(--line, #ECEEF3)" }}>
            <Button type="button" variant="default" onClick={onClose} disabled={loading}>
              {saveResult ? "Đóng" : "Huỷ"}
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !status?.is_connected} style={{ minWidth: 160 }}>
              {loading ? "Đang lưu & đồng bộ..." : "Lưu & đồng bộ ngay"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
