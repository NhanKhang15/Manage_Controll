import { useMemo, useState } from "react";
import type { Person } from "../../types/people";
import { Avatar } from "../../components/ui/Avatar";

interface OrgNode {
  person: Person;
  children: OrgNode[];
}

/** Cây tổ chức dựng từ quan hệ managerId thật (Employee.manager) — người không có
 * cấp trên, hoặc cấp trên không nằm trong danh sách đang lọc, là gốc cây. */
function buildOrgTree(people: Person[]): OrgNode[] {
  const byId = new Map(people.map((p) => [p.id, p]));
  const childrenOf = new Map<string, Person[]>();
  const roots: Person[] = [];
  for (const p of people) {
    if (p.managerId && byId.has(p.managerId)) {
      const arr = childrenOf.get(p.managerId) ?? [];
      arr.push(p);
      childrenOf.set(p.managerId, arr);
    } else {
      roots.push(p);
    }
  }
  const build = (p: Person): OrgNode => ({ person: p, children: (childrenOf.get(p.id) ?? []).map(build) });
  return roots.map(build);
}

function collectIds(nodes: OrgNode[], out: string[]) {
  for (const n of nodes) {
    if (n.children.length > 0) out.push(n.person.id);
    collectIds(n.children, out);
  }
}

function OrgTreeNode({ node, expanded, onToggle }: { node: OrgNode; expanded: Set<string>; onToggle: (id: string) => void }) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.person.id);
  return (
    <li>
      <div
        onClick={hasChildren ? () => onToggle(node.person.id) : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          borderRadius: 8,
          cursor: hasChildren ? "pointer" : "default",
        }}
      >
        <span style={{ width: 14, color: "var(--muted)", fontSize: 11 }} title="Bấm để mở/đóng nhánh">
          {hasChildren ? (isOpen ? "▾" : "▸") : ""}
        </span>
        <Avatar name={node.person.name} size={28} src={node.person.avatarSrc} />
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{node.person.name}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {node.person.title}
            {node.person.dept && node.person.dept !== "—" ? ` · ${node.person.dept}` : ""}
          </div>
        </div>
        {hasChildren ? (
          <span
            title={`${node.children.length} nhân sự cấp dưới`}
            style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", flexShrink: 0 }}
          >
            👥 {node.children.length}
          </span>
        ) : null}
      </div>
      {hasChildren && isOpen ? (
        <ul style={{ listStyle: "none", margin: 0, paddingLeft: 26 }}>
          {node.children.map((child) => (
            <OrgTreeNode key={child.person.id} node={child} expanded={expanded} onToggle={onToggle} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function OrgTree({ people }: { people: Person[] }) {
  const tree = useMemo(() => buildOrgTree(people), [people]);
  const allBranchIds = useMemo(() => {
    const ids: string[] = [];
    collectIds(tree, ids);
    return ids;
  }, [tree]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(allBranchIds));

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="panel org-panel">
      <div className="panel-h" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
        <span>🏢 Sơ đồ tổ chức</span>
        <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
          <button type="button" className="chip" style={{ cursor: "pointer" }} onClick={() => setExpanded(new Set(allBranchIds))}>
            Mở tất cả
          </button>
          <button type="button" className="chip" style={{ cursor: "pointer" }} onClick={() => setExpanded(new Set())}>
            Thu gọn
          </button>
        </div>
      </div>
      {tree.length === 0 ? (
        <div className="mini-empty">Không có nhân sự phù hợp bộ lọc.</div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {tree.map((node) => (
            <OrgTreeNode key={node.person.id} node={node} expanded={expanded} onToggle={toggle} />
          ))}
        </ul>
      )}
    </div>
  );
}
