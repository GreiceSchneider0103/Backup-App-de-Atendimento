import { UsersAdmin } from "@/components/admin/users-admin";

type UsersResponse = {
  data?: unknown;
  message?: string;
};

async function getUsers() {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/users`, { cache: "no-store" });
  const payload = await response.json() as UsersResponse;

  const users = Array.isArray(payload?.data) ? payload.data : [];
  const error = response.ok ? null : (payload?.message ?? "Falha ao carregar usuários");

  return { users, error };
}

export default async function AdminPage() {
  const { users, error } = await getUsers();

  return (
    <section className="page">
      <div className="page-header">
        <h1>Administração</h1>
        <p className="muted">Gerencie acesso dos usuários internos.</p>
      </div>
      <UsersAdmin initialUsers={users} initialError={error} />
    </section>
  );
}
