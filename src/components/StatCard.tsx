interface Props {
  label: string;
  value: number;
  hint: string;
  icon: string;
  tone?: "default" | "danger" | "success" | "warning" | "info";
}

export function StatCard({ label, value, hint, icon, tone = "default" }: Props) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-hint">{hint}</div>
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}
