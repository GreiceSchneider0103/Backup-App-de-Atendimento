"use client";

import { FormEvent, useState } from "react";

export function UsersAdmin({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState<string | null>(null);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      authUserId: String(formData.get("authUserId")),
      nome: String(formData.get("nome")),
      email: String(formData.get("email")),
      perfil: String(formData.get("perfil"))
    };

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.message ?? "Erro ao criar usuário");
      return;
    }

    const created = await response.json();
    setUsers((prev) => [created, ...prev]);
  }

  async function toggleAtivo(userId: string, ativo: boolean) {
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo })
    });
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ativo: !ativo } : user)));
  }

  return (
    <section className="grid">
      <form onSubmit={createUser} className="card" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
        <input name="authUserId" placeholder="Supabase Auth User ID" required />
        <input name="nome" placeholder="Nome" required />
        <input name="email" placeholder="Email" required type="email" />
        <select name="perfil"><option value="ATENDENTE">ATENDENTE</option><option value="SUPERVISOR">SUPERVISOR</option><option value="ADMIN">ADMIN</option></select>
        <button type="submit">Cadastrar usuário</button>
      </form>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      <div className="card">
        <table>
          <thead><tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Ativo</th><th>Ação</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.nome}</td><td>{user.email}</td><td>{user.perfil}</td><td>{String(user.ativo)}</td>
                <td><button onClick={() => toggleAtivo(user.id, user.ativo)}>{user.ativo ? "Inativar" : "Ativar"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
