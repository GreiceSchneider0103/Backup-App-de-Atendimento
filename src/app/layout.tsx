import "./globals.css";
import { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { getCurrentUser } from "@/lib/auth/session";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tickets", label: "Tickets" },
  { href: "/tickets/kanban", label: "Kanban" },
  { href: "/reports", label: "Relatórios" },
  { href: "/users", label: "Usuários" },
  { href: "/admin", label: "Administração" }
];

function getInitials(name?: string) {
  if (!name) return "VS";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  let currentUser: Awaited<ReturnType<typeof getCurrentUser>> | null = null;

  try {
    currentUser = await getCurrentUser();
  } catch {
    currentUser = null;
  }

  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">
          <aside className="app-sidebar">
            <div className="brand-row">
              <div className="brand-icon">⌘</div>
              <span className="brand">TicketSystem</span>
            </div>
            <SidebarNav items={navItems} />
            <div className="sidebar-footer">Sistema de Tickets v1.0</div>
          </aside>

          <div className="app-content">
            <header className="app-header">
              <div className="header-left"><h2>Painel interno</h2></div>
              <div className="header-right">
                <div className="search-box">
                  <span>⌕</span>
                  <input placeholder="Buscar..." />
                </div>
                <button className="icon-btn" aria-label="Notificações">◔</button>
                <div className="user-chip">
                  <div>
                    <div className="user-name">{currentUser?.nome ?? "Visitante"}</div>
                    <div className="user-role">{currentUser?.perfil?.toLowerCase() ?? "sessão"}</div>
                  </div>
                  <span className="avatar">{getInitials(currentUser?.nome)}</span>
                </div>
                {currentUser ? <LogoutButton /> : null}
              </div>
            </header>

            <main className="app-main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
