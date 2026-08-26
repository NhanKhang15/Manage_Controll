import { useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Button } from "../components/ui/Button";
import { WikiPageList } from "../features/wiki/WikiPageList";
import { WikiPageView } from "../features/wiki/WikiPageView";
import { useToast } from "../components/ui/Toast";
import { currentUser } from "../mocks/user";
import { mockWikiPages } from "../mocks/wiki";
import type { WikiPage as WikiPageItem } from "../types/wiki";
import { useAuth } from "../auth/AuthContext";

export function WikiPage() {
  const [pages, setPages] = useState<WikiPageItem[]>(mockWikiPages);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { employee } = useAuth();

  function handleCreate() {
    const title = window.prompt("Tên trang mới:");
    if (!title || !title.trim()) return;
    const page: WikiPageItem = {
      id: `wiki-${Date.now()}`,
      title: `📄 ${title.trim()}`,
      content: "Trang mới — bắt đầu soạn nội dung ở đây.",
      author: employee?.full_name || currentUser.name,
      updatedAt: new Date().toLocaleDateString("vi-VN"),
    };
    setPages((prev) => [page, ...prev]);
    setSelectedId(page.id);
    showToast("Đã tạo trang mới", "success");
  }

  const selected = pages.find((p) => p.id === selectedId) ?? null;

  return (
    <AppShellPage initialNavId="wiki">
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1>📚 Tài liệu / Wiki</h1>
          <p className="page-sub">Kho tri thức nội bộ — quy trình, SOP, ghi chú. Soạn bằng markdown, lồng trang, AI hỗ trợ viết.</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          ✨ Tạo trang
        </Button>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <WikiPageList pages={pages} selectedId={selectedId} onSelect={(p) => setSelectedId(p.id)} />
        <WikiPageView page={selected} onCreateNew={handleCreate} />
      </div>
    </AppShellPage>
  );
}
