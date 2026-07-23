import { Panel } from "../../components/ui/Panel";
import type { WikiPage } from "../../types/wiki";

export interface WikiPageViewProps {
  page: WikiPage | null;
  onCreateNew: () => void;
}

export function WikiPageView({ page, onCreateNew }: WikiPageViewProps) {
  if (!page) {
    return (
      <Panel title="Bắt đầu" style={{ flex: 1, minWidth: 320 }}>
        <p className="muted" style={{ padding: "6px 4px" }}>
          Chọn một trang bên trái để đọc, hoặc{" "}
          <a href="#new" onClick={(e) => { e.preventDefault(); onCreateNew(); }}>
            tạo trang mới
          </a>
          . Gợi ý: Quy trình onboarding, SOP bán hàng, Chính sách nghỉ phép, Cẩm nang sản phẩm…
        </p>
      </Panel>
    );
  }

  return (
    <Panel title={page.title} style={{ flex: 1, minWidth: 320 }}>
      <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
        Cập nhật {page.updatedAt} bởi {page.author}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{page.content}</div>
    </Panel>
  );
}
