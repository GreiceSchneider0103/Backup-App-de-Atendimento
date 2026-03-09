import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

async function getDashboard(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => v && params.set(k, v));
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/dashboard?${params.toString()}`, {
    cache: "no-store"
  });
  return response.json();
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const data = await getDashboard(query);
  const cards = data.cards;

  return (
    <section className="grid" style={{ gap: 24 }}>
      <h1>Dashboard gerencial</h1>
      <form className="card" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
        <input name="canalMarketplace" placeholder="Marketplace" defaultValue={query.canalMarketplace} />
        <input name="empresa" placeholder="Empresa" defaultValue={query.empresa} />
        <input name="startDate" type="date" />
        <input name="endDate" type="date" />
        <button type="submit">Filtrar</button>
      </form>
      <div className="grid grid-4">
        {Object.entries(cards ?? {}).map(([key, value]) => (
          <article key={key} className="card">
            <strong>{key}</strong>
            <p>{String(value)}</p>
          </article>
        ))}
      </div>
      <DashboardCharts charts={data.charts ?? {}} />
    </section>
  );
}
