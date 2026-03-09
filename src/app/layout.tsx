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
            <div className="brand">Lessul Atendimento</div>
            <SidebarNav items={navItems} />
          </aside>

          <div className="app-content">
            <header className="app-header">
              <div>
                <h2>Painel interno</h2>
                <p className="muted">Operação de tickets para marketplace</p>
              </div>
              <div className="header-actions">
                <span className="badge badge-info">{currentUser?.nome ?? "Visitante"}</span>
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
