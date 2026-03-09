"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

const iconByLabel: Record<string, string> = {
  Dashboard: "▦",
  Tickets: "⌘",
  Kanban: "║",
  Relatórios: "▤",
  Usuários: "◔",
  Administração: "⚙"
};

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="nav-list">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href as any} className={`nav-item ${active ? "active" : ""}`}>
            <span className="nav-icon">{iconByLabel[item.label] ?? "•"}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
