import "./globals.css";
import { ReactNode } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { getCurrentUser } from "@/lib/auth/session";
import { ServiceUnavailableError, UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";


function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

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
  let infraUnavailable = false;
  const requestHeaders = await headers();
  const isPublicRoute = requestHeaders.get("x-route-access") === "public";

  try {
    if (hasSupabaseEnv() && !isPublicRoute) {
      currentUser = await getCurrentUser();
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      currentUser = null;
    } else if (error instanceof ServiceUnavailableError) {
      infraUnavailable = true;
    } else {
      throw error;
    }
  }

  if (infraUnavailable && !isPublicRoute) {
    return (
      <html lang="pt-BR">
        <body>
          <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
            <section className="card" style={{ maxWidth: 680 }}>
              <h1>Serviço temporariamente indisponível</h1>
              <p className="muted">Não foi possível conectar ao banco de dados agora. Tente novamente em instantes.</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Link href="/indisponivel" className="btn btn-primary">Ver status</Link>
                <Link href="/api/health" className="btn btn-secondary">Health check</Link>
              </div>
            </section>
          </main>
        </body>
      </html>
    );
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
