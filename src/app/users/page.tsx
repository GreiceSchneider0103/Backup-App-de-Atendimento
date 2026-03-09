import { requireCurrentUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { hasPermission } from "@/lib/rbac/permissions";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function UsersPage() {
  const user = await requireCurrentUser();

  if (!hasPermission(user.perfil, "user.manage")) {
    return (
      <section className="page">
        <div className="page-header">
          <h1>Usuários</h1>
          <p className="muted">Visualização do usuário autenticado.</p>
        </div>
        <div className="grid grid-4">
          <article className="card"><strong>Nome</strong><p>{user.nome}</p></article>
          <article className="card"><strong>Email</strong><p>{user.email}</p></article>
          <article className="card"><strong>Perfil</strong><p><StatusBadge value={user.perfil} /></p></article>
          <article className="card"><strong>Ativo</strong><p>{user.ativo ? "Sim" : "Não"}</p></article>
        </div>
      </section>
    );
  }

  const users = await prisma.usuario.findMany({ orderBy: { criadoEm: "desc" } });
  const activeUsers = users.filter((item) => item.ativo).length;
  const admins = users.filter((item) => item.perfil === "ADMIN").length;

  return (
    <section className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Usuários</h1>
          <p className="muted">Gerencie usuários e permissões do sistema.</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 540 }}>
        <input placeholder="Buscar por nome ou e-mail..." />
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Status</th></tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>{item.email}</td>
                <td><StatusBadge value={item.perfil} /></td>
                <td><StatusBadge value={item.ativo ? "ATIVO" : "INATIVO"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-4">
        <article className="card"><strong>Total de Usuários</strong><p className="metric-value">{users.length}</p></article>
        <article className="card"><strong>Usuários Ativos</strong><p className="metric-value">{activeUsers}</p></article>
        <article className="card"><strong>Administradores</strong><p className="metric-value">{admins}</p></article>
      </div>
    </section>
  );
}
