import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ui/Toast";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import {
  deleteMeetingTranscript,
  listMeetingTranscripts,
  saveMeetingTranscript,
  summarizeMeetingTranscript,
  type MeetingTranscript,
} from "../../api/meetings";

function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MeetingRecorderPage() {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("company_id") || "";
  const eventId = searchParams.get("event_id") || undefined;
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [savedList, setSavedList] = useState<MeetingTranscript[]>([]);
  const [saving, setSaving] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  const { isSupported, isListening, interimText, error: speechError, start, stop } = useSpeechRecognition({
    onFinalResult: (text) => {
      setTranscriptText((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  // Trong lúc đang ghi, ghép thêm phần đang nói (chưa chốt) vào sau text đã
  // chốt để hiện ra ngay lập tức — không đợi tới khi nhận final result.
  const displayedTranscript =
    isListening && interimText ? (transcriptText ? `${transcriptText} ${interimText}` : interimText) : transcriptText;

  useEffect(() => {
    if (speechError) showToast(speechError, "danger");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechError]);

  async function loadSavedList() {
    try {
      const data = await listMeetingTranscripts(eventId);
      setSavedList(data);
    } catch {
      // Fallback im lặng — danh sách biên bản không phải luồng chính.
    }
  }

  useEffect(() => {
    loadSavedList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const statusLabel = isListening ? "Đang ghi..." : saving ? "Đang lưu..." : summarizing ? "Đang tóm tắt..." : "Sẵn sàng";

  function handleToggleRecord() {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }

  function handleClear() {
    setTranscriptText("");
  }

  async function handleSave() {
    if (!transcriptText.trim()) {
      showToast("Chưa có nội dung bản ghi để lưu", "danger");
      return;
    }
    if (!companyId) {
      showToast("Không xác định được công ty — vui lòng vào từ trang Lịch", "danger");
      return;
    }

    setSaving(true);
    try {
      const result = await saveMeetingTranscript({
        id: currentId || undefined,
        company_id: companyId,
        event_id: eventId,
        title: title.trim(),
        transcript_text: transcriptText,
      });
      setCurrentId(result.id);
      showToast("Đã lưu biên bản", "success");
      await loadSavedList();
    } catch (err: any) {
      showToast(err.message || "Không thể lưu biên bản", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleSummarize() {
    if (!transcriptText.trim()) {
      showToast("Chưa có nội dung bản ghi để tóm tắt", "danger");
      return;
    }
    if (!companyId) {
      showToast("Không xác định được công ty — vui lòng vào từ trang Lịch", "danger");
      return;
    }

    setSummarizing(true);
    try {
      let id = currentId;
      if (!id) {
        const saved = await saveMeetingTranscript({
          company_id: companyId,
          event_id: eventId,
          title: title.trim(),
          transcript_text: transcriptText,
        });
        id = saved.id;
        setCurrentId(id);
      }

      const { summary_text } = await summarizeMeetingTranscript(id);
      setTranscriptText((prev) => `${prev}\n\n--- Tóm tắt (AI) ---\n${summary_text}`);
      showToast("Đã tóm tắt bằng AI", "success");
      await loadSavedList();
    } catch (err: any) {
      showToast(err.message || "Không thể tóm tắt — kiểm tra lại cấu hình AI", "danger");
    } finally {
      setSummarizing(false);
    }
  }

  function handleOpenSaved(item: MeetingTranscript) {
    setCurrentId(item.id);
    setTitle(item.title);
    setTranscriptText(item.transcript_text);
  }

  async function handleDeleteSaved(item: MeetingTranscript, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await deleteMeetingTranscript(item.id);
      setSavedList((prev) => prev.filter((t) => t.id !== item.id));
      if (currentId === item.id) setCurrentId(null);
      showToast("Đã xoá biên bản", "success");
    } catch (err: any) {
      showToast(err.message || "Không thể xoá biên bản", "danger");
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 22 }}>🎙️</span>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Ghi âm &amp; Tóm tắt cuộc họp</h1>
      </div>
      <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 4, marginBottom: 20 }}>
        Chép lời ngay trong trình duyệt (không cần cài gì), tóm tắt tự động sau khi họp.{" "}
        <Link to="/calendar" style={{ color: "var(--brand)", fontWeight: 600 }}>
          ← Về Lịch
        </Link>
      </p>

      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Tên cuộc họp... (VD: Review dự án CRM 08/07)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--bg)",
              fontSize: 13.5,
              color: "var(--text)",
            }}
          />
          <span style={{ fontSize: 12.5, color: "var(--muted)", whiteSpace: "nowrap" }}>{statusLabel}</span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <button
            type="button"
            onClick={handleToggleRecord}
            disabled={!isSupported}
            className="btn btn-primary"
            style={{ opacity: isSupported ? 1 : 0.5 }}
          >
            {isListening ? "⏹ Dừng ghi" : "🔴 Bắt đầu ghi"}
          </button>
          <button type="button" onClick={handleClear} className="btn">
            🗑️ Xoá
          </button>
          <button type="button" onClick={handleSummarize} disabled={summarizing} className="btn">
            ✨ Tóm tắt (AI)
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn">
            💾 Lưu lại
          </button>
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>
          📋 Bản ghi (chỉnh tay được)
        </div>
        <textarea
          value={displayedTranscript}
          onChange={(e) => setTranscriptText(e.target.value)}
          placeholder="Bấm 'Bắt đầu ghi' rồi nói — lời sẽ hiện ở đây... (Chrome/Edge/Android hỗ trợ tốt nhất)"
          rows={9}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid var(--line)",
            background: "var(--bg)",
            fontSize: 13.5,
            color: "var(--text)",
            resize: "vertical",
          }}
        />

        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10, marginBottom: 0 }}>
          🎤 Dùng micro của trình duyệt để chép lời trực tiếp (miễn phí). Tóm tắt bằng AI (cần bật khoá AI ở Thiết
          lập). Google Meet/NotebookLM sẽ tích hợp khi có khóa API của công ty.
        </p>
      </div>

      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Biên bản đã lưu ({savedList.length})</div>

        {savedList.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Chưa có biên bản nào được lưu</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {savedList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenSaved(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 6px",
                  borderRadius: 8,
                  cursor: "pointer",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span style={{ fontSize: 15 }}>🎙️</span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{item.title || "(Không có tên)"}</span>
                <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                  {formatSavedAt(item.created_at)} · {item.char_count} ký tự
                </span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteSaved(item, e)}
                  aria-label="Xoá biên bản"
                  style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "var(--muted)" }}
                >
                  🗑️
                </button>
                <span style={{ color: "var(--muted)" }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
