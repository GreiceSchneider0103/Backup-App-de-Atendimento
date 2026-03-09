import "./globals.css";
import { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { getCurrentUser } from "@/lib/auth/session";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

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
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      currentUser = null;
    } else {
      throw error;
    }
  }

  if (!currentUser) {
    return (
      <html lang="pt-BR">
        <body>
          <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>{children}</main>
        </body>
      </html>
    );
  }

  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">
          <aside className="app-sidebar">
            <div className="brand-row">
              <div className="brand-icon">⌘</div>
              <span className="brand">GO Atendimento</span>
            </div>
            <SidebarNav />
            <div className="sidebar-footer">GO Atendimento v1.0</div>
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
                    <div className="user-name">{currentUser.nome}</div>
                    <div className="user-role">{currentUser.perfil.toLowerCase()}</div>
                  </div>
                  <span className="avatar">{getInitials(currentUser.nome)}</span>
                </div>
                <LogoutButton />
              </div>
            </header>

            <main className="app-main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
