/**
 * VelaLogo
 * Logo SVG chữ "V" gradient + wordmark "VelaAI". Markup lấy nguyên bản từ HTML gốc.
 * Thẻ HTML gốc: <svg>
 * CSS gốc tham chiếu: .vam-logo .vam-ico
 */
export interface VelaLogoProps {
  iconHeight?: number;
  fontSize?: number;
}

export function VelaLogo({ iconHeight = 28, fontSize = 24 }: VelaLogoProps) {
  return (
    <span className="vam-logo" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg className="vam-ico" height={iconHeight} viewBox="0 0 124 112" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="velaV" x1={26} y1={24} x2={98} y2={24} gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset={0.5} stopColor="#279BD6" />
            <stop offset={1} stopColor="#22D3A8" />
          </linearGradient>
          <linearGradient id="velaFold" x1={52} y1={70} x2={72} y2={106} gradientUnits="userSpaceOnUse">
            <stop stopColor="#4C8DF7" />
            <stop offset={1} stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <path
          d="M54 66 C49 82 55 106 71 100 C83 95 80 82 68 81"
          fill="none"
          stroke="url(#velaFold)"
          strokeWidth={15}
          strokeLinecap="round"
        />
        <path
          d="M28 22 L60 88 L96 20"
          fill="none"
          stroke="url(#velaV)"
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          fontWeight: 800,
          fontSize,
          letterSpacing: "-.02em",
          lineHeight: 1,
          fontFamily: "inherit",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: "#12245B" }}>Vela</span>
        <span
          style={{
            marginLeft: ".28em",
            background: "linear-gradient(90deg,#2E6BE6,#22C7E8)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          AI
        </span>
      </span>
    </span>
  );
}
