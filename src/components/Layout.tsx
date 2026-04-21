import type { ReactNode } from "react";
import type { ViewName } from "../types";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface Props {
  current: ViewName;
  title: string;
  subtitle: string;
  pendingFollowUpCount: number;
  userEmail?: string;
  clinicName?: string;
  theme?: string;
  onLogout?: () => void;
  onNavigate: (view: ViewName) => void;
  children: ReactNode;
}

export function Layout({
  current,
  title,
  subtitle,
  pendingFollowUpCount,
  userEmail,
  clinicName,
  theme = "Dark",
  onLogout,
  onNavigate,
  children
}: Props) {
  return (
    <div className={`app-shell ${theme === "Dark" ? "theme-dark" : "theme-light"}`}>
      <Sidebar
        current={current}
        onChange={onNavigate}
        pendingFollowUpCount={pendingFollowUpCount}
        clinicName={clinicName}
      />
      <main className="app-main">
        <Topbar title={title} subtitle={subtitle} userEmail={userEmail} onLogout={onLogout} />
        <section className="app-content">{children}</section>
      </main>
    </div>
  );
}
