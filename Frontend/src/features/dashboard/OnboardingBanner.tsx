/**
 * OnboardingBanner
 * Banner chào mừng nhân viên mới, có thể ẩn đi. HTML gốc dùng inline style
 * cho banner này (không phải class CSS riêng) nên giữ nguyên cách đó.
 * Thẻ HTML gốc: <div class=panel style="background:linear-gradient(...)">
 */
export interface OnboardingBannerProps {
  onStart: () => void;
}

export function OnboardingBanner({ onStart }: OnboardingBannerProps) {
  return (
    <div
      className="panel"
      style={{ background: "linear-gradient(135deg,#eef2ff,#faf5ff)", border: "1px solid #c7d2fe", marginBottom: 16 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ fontSize: 30 }}>🎉</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Chào mừng bạn gia nhập công ty!</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Hoàn tất các bước nhập việc: ký HĐLĐ &amp; NDA, đọc văn hóa công ty, làm quen đội nhóm, khai hồ sơ
            BHXH/thuế.
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={onStart}>
          Bắt đầu nhập việc →
        </button>
      </div>
    </div>
  );
}
