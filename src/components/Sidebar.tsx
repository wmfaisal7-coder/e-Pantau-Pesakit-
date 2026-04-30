import type { ViewName } from "../types";

interface Props {
  current: ViewName;
  onChange: (view: ViewName) => void;
  pendingFollowUpCount: number;
  clinicName?: string;
}

const items: { id: ViewName; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "patients", label: "Pesakit", icon: "👤" },
  { id: "appointments", label: "Temujanji", icon: "📅" },
  { id: "followup", label: "Follow-Up", icon: "📞" },
  { id: "reports", label: "Laporan", icon: "📊" },
  { id: "settings", label: "Tetapan", icon: "⚙" }
];

export function Sidebar({ current, onChange, pendingFollowUpCount, clinicName = "Klinik A" }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">⊕</div>
        <div>
          <div className="brand-title">e-Pantau</div>
          <div className="brand-subtitle">{clinicName}</div>
        </div>
      </div>

      <nav className="nav-list">
        {items.map((item) => (
          <button
            key={item.id}
            className={`nav-btn ${current === item.id ? "active" : ""}`}
            onClick={() => onChange(item.id)}
          >
            <span>{item.icon}</span>
            <span className="grow">{item.label}</span>
            {item.id === "followup" && pendingFollowUpCount > 0 ? (
              <span className="badge-danger">{pendingFollowUpCount}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">SA</div>
        <div>
          <div className="sidebar-user-name">Siti Admin</div>
          <div className="sidebar-user-role">Admin Klinik</div>
        </div>
      </div>
    </aside>
  );
}
