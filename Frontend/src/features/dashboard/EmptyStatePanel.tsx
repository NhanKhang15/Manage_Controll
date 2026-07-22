/**
 * EmptyStatePanel
 * Panel trống dùng chung cho "Việc của tôi" và "Cuộc họp sắp tới" — cả 2 đều
 * cùng cấu trúc panel-h + panel-link + mini-empty trong HTML gốc.
 * Thẻ HTML gốc: <div class=panel>
 * CSS gốc tham chiếu: .panel, .panel-h, .panel-link, .mini-empty
 */
export interface EmptyStatePanelProps {
  heading: string;
  linkLabel: string;
  href: string;
  emptyText: string;
}

export function EmptyStatePanel({ heading, linkLabel, href, emptyText }: EmptyStatePanelProps) {
  return (
    <div className="panel">
      <div className="panel-h">
        {heading}
        <a className="panel-link" href={href}>
          {linkLabel}
        </a>
      </div>
      <div className="mini-empty">{emptyText}</div>
    </div>
  );
}
