import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

async function getDashboard(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => v && params.set(k, v));
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/dashboard?${params.toString()}`, {
    cache: "no-store"
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { cards: {}, charts: {}, error: payload?.message ?? "Falha ao carregar dashboard" };
  }

  return { cards: payload.cards ?? {}, charts: payload.charts ?? {}, error: null };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const data = await getDashboard(query);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Dashboard gerencial</h1>
        <p className="muted">Indicadores consolidados da operação.</p>
      </div>

      <form className="panel form-grid cols-4">
        <input name="canalMarketplace" placeholder="Marketplace" defaultValue={query.canalMarketplace} />
        <input name="empresa" placeholder="Empresa" defaultValue={query.empresa} />
        <input name="startDate" type="date" />
        <input name="endDate" type="date" />
        <button type="submit" className="btn btn-secondary">Filtrar</button>
      </form>

      {data.error ? <div className="alert alert-error">{data.error}</div> : null}

      <div className="grid grid-4">
        {Object.entries(data.cards).map(([key, value]) => (
          <article key={key} className="card">
            <strong>{key}</strong>
            <p>{String(value)}</p>
          </article>
        ))}
      </div>

      <DashboardCharts charts={data.charts} />
    </section>
  );
}
