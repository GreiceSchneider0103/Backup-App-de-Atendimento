import Link from "next/link";

async function getReport(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => v && params.set(k, v));
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/reports?${params.toString()}`, {
    cache: "no-store"
  });
  return response.json();
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const data = await getReport(query);
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => v && params.set(k, v));

  return (
    <section className="grid">
      <h1>Relatórios</h1>
      <form className="card" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
        <input name="canalMarketplace" placeholder="Marketplace" defaultValue={query.canalMarketplace} />
        <input name="empresa" placeholder="Empresa" defaultValue={query.empresa} />
        <input name="startDate" type="date" />
        <input name="endDate" type="date" />
        <button type="submit">Filtrar</button>
      </form>
      <div className="grid grid-4">
        {Object.entries(data.totals ?? {}).map(([k, v]) => (
          <article key={k} className="card"><strong>{k}</strong><p>{String(v)}</p></article>
        ))}
      </div>
      <div className="card" style={{ display: "flex", gap: 8 }}>
        <Link href={`/api/reports/export?${params.toString()}&format=csv`}>Exportar CSV</Link>
        <Link href={`/api/reports/export?${params.toString()}&format=xlsx`}>Exportar XLSX</Link>
      </div>
    </section>
  );
}
