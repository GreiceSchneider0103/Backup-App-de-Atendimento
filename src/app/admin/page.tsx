import { UsersAdmin } from "@/components/admin/users-admin";

async function getUsers() {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/users`, { cache: "no-store" });
  return response.json();
}

export default async function AdminPage() {
  const users = await getUsers();
  return (
    <section className="grid">
      <h1>Administração</h1>
      <UsersAdmin initialUsers={users} />
    </section>
  );
}
