import { useParams, useNavigate } from "react-router-dom";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { Icon, type IconName } from "../components/ui/Icon";
import { mainNavItems } from "../mocks/navigation";
import { useToast } from "../components/ui/Toast";

export function GenericPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const navId = pageId || "assistant";
  const navItem = mainNavItems.find((item) => item.id === navId);
  const title = navItem ? navItem.label : navId;
  const iconName = (navItem?.icon || "assistant") as IconName;

  return (
    <AppShellPage initialNavId={navId}>
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--brand-soft)",
              color: "var(--brand)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon name={iconName} size={22} />
          </div>
          <div>
            <h1>{title}</h1>
            <p className="page-sub">Quản lý và theo dõi thông tin {title.toLowerCase()} trong hệ thống Vela AI</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => showToast(`Tính năng thêm mới ${title} đang phát triển`, "default")}>
          + Thêm mới
        </Button>
      </div>

      <Panel>
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "var(--brand-soft)",
              color: "var(--brand)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon name={iconName} size={32} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Tính năng {title}</h3>
          <p style={{ color: "var(--muted)", maxWidth: 460, margin: "0 auto 20px", fontSize: 14, lineHeight: 1.5 }}>
            Module <b>{title}</b> đang được phát triển nâng cao và sẵn sàng đưa vào vận hành trong phiên bản cập nhật tiếp theo.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Button onClick={() => navigate("/dashboard")}>Về Bảng điều hành</Button>
            <Button variant="primary" onClick={() => navigate("/assistant")}>
              Trò chuyện với Trợ lý AI
            </Button>
          </div>
        </div>
      </Panel>
    </AppShellPage>
  );
}
