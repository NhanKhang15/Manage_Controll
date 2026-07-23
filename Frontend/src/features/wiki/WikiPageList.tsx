import { Panel } from "../../components/ui/Panel";
import type { WikiPage } from "../../types/wiki";

export interface WikiPageListProps {
  pages: WikiPage[];
  selectedId: string | null;
  onSelect: (page: WikiPage) => void;
}

export function WikiPageList({ pages, selectedId, onSelect }: WikiPageListProps) {
  return (
    <Panel title={`📂 Tất cả trang (${pages.length})`} className="wiki-list" style={{ width: 280, flexShrink: 0, maxHeight: "70vh", overflow: "auto" }}>
      {pages.length === 0 && <div className="mini-empty">Chưa có trang nào.</div>}
      {pages.map((page) => (
        <button
          key={page.id}
          type="button"
          className={`wiki-page-item${page.id === selectedId ? " on" : ""}`}
          onClick={() => onSelect(page)}
        >
          {page.title}
        </button>
      ))}
    </Panel>
  );
}
