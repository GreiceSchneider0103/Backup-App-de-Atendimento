import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <nav style={{ display: "flex", gap: 12, padding: 16, background: "#111", color: "#fff" }}>
          <Link href="/dashboard" style={{ color: "#fff" }}>Dashboard</Link>
          <Link href="/tickets" style={{ color: "#fff" }}>Tickets</Link>
          <Link href="/tickets/kanban" style={{ color: "#fff" }}>Kanban</Link>
          <Link href="/reports" style={{ color: "#fff" }}>Relatórios</Link>
          <Link href="/users" style={{ color: "#fff" }}>Usuários</Link>
          <Link href="/admin" style={{ color: "#fff" }}>Administração</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
