import { getCurrentUser } from "@/lib/auth/session";

export default async function UsersPage() {
  const user = await getCurrentUser();

  return (
    <section className="page">
      <div className="page-header">
        <h1>Meu usuário</h1>
        <p className="muted">Dados do usuário autenticado e perfil de acesso.</p>
      </div>

      <div className="grid grid-4">
        <article className="card"><strong>Nome</strong><p>{user.nome}</p></article>
        <article className="card"><strong>Email</strong><p>{user.email}</p></article>
        <article className="card"><strong>Perfil</strong><p><span className="badge badge-info">{user.perfil}</span></p></article>
        <article className="card"><strong>Ativo</strong><p>{user.ativo ? "Sim" : "Não"}</p></article>
      </div>
    </section>
  );
}
