"use client";

import { FormEvent, useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

type AdminUser = {
  id: string;
  authUserId: string;
  nome: string;
  email: string;
  perfil: "ATENDENTE" | "SUPERVISOR" | "ADMIN";
  ativo: boolean;
};

function getSafeUsers(input: unknown): AdminUser[] {
  return Array.isArray(input) ? input as AdminUser[] : [];
}

export function UsersAdmin({ initialUsers, initialError }: { initialUsers: unknown; initialError?: string | null }) {
  const [users, setUsers] = useState<AdminUser[]>(() => getSafeUsers(initialUsers));
  const [error, setError] = useState<string | null>(initialError ?? null);
  const hasUsers = useMemo(() => Array.isArray(users) && users.length > 0, [users]);

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

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.message ?? "Erro ao criar usuário");
      return;
    }

    if (body?.data) {
      setUsers((prev) => [body.data, ...prev]);
      (event.currentTarget as HTMLFormElement).reset();
    }
  }

  async function toggleAtivo(userId: string, ativo: boolean) {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo })
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.message ?? "Erro ao atualizar usuário");
      return;
    }

    const updated = body?.data as AdminUser | undefined;
    if (updated) {
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
      return;
    }

    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ativo: !ativo } : user)));
  }

  return (
    <section className="grid">
      <form onSubmit={createUser} className="panel form-grid cols-4">
        <input name="authUserId" placeholder="Supabase Auth User ID" required />
        <input name="nome" placeholder="Nome" required />
        <input name="email" placeholder="Email" required type="email" />
        <select name="perfil" defaultValue="ATENDENTE">
          <option value="ATENDENTE">ATENDENTE</option>
          <option value="SUPERVISOR">SUPERVISOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button type="submit" className="btn btn-primary">Cadastrar usuário</button>
      </form>

      {error ? <p className="alert alert-error">{error}</p> : null}

      <div className="panel table-wrap">
        {!hasUsers ? (
          <div className="empty-state">Nenhum usuário encontrado para exibir.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Ativo</th><th>Ação</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td><StatusBadge value={user.perfil} /></td>
                  <td>{user.ativo ? "Sim" : "Não"}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => toggleAtivo(user.id, user.ativo)}>
                      {user.ativo ? "Inativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
