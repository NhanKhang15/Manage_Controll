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
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>Công ty:</span>
      <select
        className="ai-model-sel"
        style={{ flex: "none", minWidth: 220 }}
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
