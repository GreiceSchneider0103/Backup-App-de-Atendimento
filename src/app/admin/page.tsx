import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/require-user";
import { assertPermission } from "@/lib/rbac/permissions";
import { prisma } from "@/lib/db/prisma";
import { UsersAdmin } from "@/components/admin/users-admin";

export default async function AdminPage() {
  const user = await requireCurrentUser();
  assertPermission(user.perfil, "user.manage");

  const [users, totalTickets, activeTickets, failedBackups] = await Promise.all([
    prisma.usuario.findMany({ orderBy: { criadoEm: "desc" } }),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { ativo: true } }),
    prisma.ticket.count({ where: { backupSyncStatus: "FAILED" } })
  ]);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Administração</h1>
        <p className="muted">Gestão de usuários, permissões e saúde operacional do sistema.</p>
      </div>

      <div className="grid grid-4">
        <article className="card"><strong>Total de usuários</strong><p className="metric-value">{users.length}</p></article>
        <article className="card"><strong>Tickets totais</strong><p className="metric-value">{totalTickets}</p></article>
        <article className="card"><strong>Tickets ativos</strong><p className="metric-value">{activeTickets}</p></article>
        <article className="card"><strong>Backups com falha</strong><p className="metric-value">{failedBackups}</p></article>
      </div>

      <div className="panel" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link className="btn btn-secondary" href="/users">Abrir gestão de usuários</Link>
        <Link className="btn btn-secondary" href="/reports">Abrir relatórios</Link>
        <Link className="btn btn-primary" href="/dashboard">Abrir dashboard</Link>
      </div>

      <UsersAdmin initialUsers={users} />
    </section>
  );
}
