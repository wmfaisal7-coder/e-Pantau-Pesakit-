interface Props {
  title: string;
  subtitle: string;
  userEmail?: string;
  onLogout?: () => void;
}

export function Topbar({ title, subtitle, userEmail, onLogout }: Props) {
  return (
    <header className="topbar">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <span>🔍</span>
          <input placeholder="Cari pesakit atau temujanji..." />
        </div>
        <div className="user-chip">{userEmail ?? "admin@klinik.com"}</div>
        <button className="secondary-btn topbar-btn" onClick={onLogout}>Log Keluar</button>
      </div>
    </header>
  );
}
