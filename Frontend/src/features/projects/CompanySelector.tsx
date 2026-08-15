export interface CompanyOption {
  id: string;
  name: string;
}

export interface CompanySelectorProps {
  companies: CompanyOption[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function CompanySelector({ companies, selectedId, onChange }: CompanySelectorProps) {
  if (companies.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span
        style={{
          fontSize: 13,
          color: "var(--muted, #8A93A6)",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>🏢</span>
        <span>Công ty:</span>
      </span>
      <select
        className="ai-model-sel"
        style={{
          flex: "none",
          minWidth: 220,
          padding: "7px 12px",
          borderRadius: 10,
          border: "1px solid var(--line, #ECEEF3)",
          background: "var(--panel, #FFFFFF)",
          color: "var(--text, #1E2632)",
          fontSize: 13.5,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
      >
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
