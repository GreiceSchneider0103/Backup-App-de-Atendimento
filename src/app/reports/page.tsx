import Link from "next/link";

async function getReport(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => v && params.set(k, v));
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/reports?${params.toString()}`, {
    cache: "no-store"
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { totals: {}, items: [], error: payload?.message ?? "Falha ao carregar relatório" };
  }

  return { totals: payload.totals ?? {}, items: Array.isArray(payload.items) ? payload.items : [], error: null };
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const data = await getReport(query);
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => v && params.set(k, v));

  return (
    <section className="page">
      <div className="page-header">
        <h1>Relatórios</h1>
        <p className="muted">Consulta consolidada com exportação CSV e XLSX.</p>
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
        {Object.entries(data.totals).map(([k, v]) => (
          <article key={k} className="card"><strong>{k}</strong><p>{String(v)}</p></article>
        ))}
      </div>

      <div className="panel" style={{ display: "flex", gap: 8 }}>
        <Link className="btn btn-secondary" href={`/api/reports/export?${params.toString()}&format=csv`}>Exportar CSV</Link>
        <Link className="btn btn-primary" href={`/api/reports/export?${params.toString()}&format=xlsx`}>Exportar XLSX</Link>
      </div>
    </section>
  );
}
