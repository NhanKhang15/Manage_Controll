import { Panel } from "../../components/ui/Panel";

export interface OnboardingSteps {
  hdld: boolean;
  nda: boolean;
  culture: boolean;
  team: boolean;
}

export interface OnboardingChecklistProps {
  steps: OnboardingSteps;
  onSign: (step: "hdld" | "nda") => void;
}

const DOC_ROWS: { key: "hdld" | "nda"; label: string; pdfUrl: string }[] = [
  { key: "hdld", label: "Ký Hợp đồng lao động", pdfUrl: "#" },
  { key: "nda", label: "Ký Thỏa thuận bảo mật (NDA)", pdfUrl: "#" },
];

export function OnboardingChecklist({ steps, onSign }: OnboardingChecklistProps) {
  const done = Object.values(steps).filter(Boolean).length;

  return (
    <Panel>
      <div className="panel-h">
        Tiến độ nhập việc — <b>{done}/4</b>
      </div>
      {DOC_ROWS.map((row) => (
        <div className="setting-row" key={row.key}>
          <span>{steps[row.key] ? "✅" : "⬜"} {row.label}</span>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <a className="btn btn-ghost btn-sm" href={row.pdfUrl} target="_blank" rel="noreferrer">
              📄 Xem văn bản (PDF)
            </a>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={steps[row.key]}
              onClick={() => onSign(row.key)}
            >
              ✍️ {steps[row.key] ? "Đã ký" : "Đọc & Ký"}
            </button>
          </span>
        </div>
      ))}
      <div className="setting-row">
        <span>{steps.culture ? "✅" : "⬜"} Đọc &amp; hiểu Văn hóa công ty</span>
        <span className="muted">Đọc bên dưới rồi bấm "Đã hiểu".</span>
      </div>
      <div className="setting-row">
        <span>{steps.team ? "✅" : "⬜"} Làm quen quản lý &amp; đồng nghiệp</span>
        <span className="muted">Xem team bên dưới rồi bấm "Đã chào hỏi".</span>
      </div>
    </Panel>
  );
}
