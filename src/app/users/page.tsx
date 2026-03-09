import { getCurrentUser } from "@/lib/auth/session";

export default async function UsersPage() {
  const user = await getCurrentUser();
  return (
    <section className="grid">
      <h1>Meu usuário</h1>
      <div className="card">
        <p><strong>Nome:</strong> {user.nome}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Perfil:</strong> {user.perfil}</p>
        <p><strong>Ativo:</strong> {String(user.ativo)}</p>
      </div>
    </section>
  );
}
