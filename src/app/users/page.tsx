async function getUsers() {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/users`, { cache: "no-store" });
  return response.json();
}

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <section className="grid">
      <h1>Usuários</h1>
      <div className="card"><pre>{JSON.stringify(users, null, 2)}</pre></div>
    </section>
  );
}
