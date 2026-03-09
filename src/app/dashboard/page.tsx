async function getDashboard() {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/dashboard`, { cache: "no-store" });
  return response.json();
}

export default async function DashboardPage() {
  const data = await getDashboard();
  const cards = data.cards;

  return (
    <section className="grid" style={{ gap: 24 }}>
      <h1>Dashboard gerencial</h1>
      <div className="grid grid-4">
        {Object.entries(cards).map(([key, value]) => (
          <article key={key} className="card">
            <strong>{key}</strong>
            <p>{String(value)}</p>
          </article>
        ))}
      </div>
      <div className="card">Gráficos analíticos por marketplace/empresa/motivo serão renderizados com Recharts na próxima fase incremental.</div>
    </section>
  );
}
