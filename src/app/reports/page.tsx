import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/require-user";
import { EMPRESAS } from "@/config/domains";
import { ReportsResponse } from "@/lib/contracts";
import { assertPermission } from "@/lib/rbac/permissions";
import { ticketFiltersSchema } from "@/lib/validation/ticket";
import { getReportsData } from "@/lib/services/reports-service";

async function getReport(query: Record<string, string | undefined>, user: Awaited<ReturnType<typeof requireCurrentUser>>): Promise<{ totals: ReportsResponse["totals"]; items: ReportsResponse["items"]; meta: ReportsResponse["meta"] | null; error: string | null }> {
  const parsed = ticketFiltersSchema.partial().safeParse(query);
  if (!parsed.success) {
    return { totals: { totalTickets: 0, totalCustos: 0, totalReembolso: 0, totalColeta: 0 }, items: [], meta: null, error: "Filtros inválidos" };
  }

  try {
    const payload = await getReportsData(parsed.data, user);
    return {
      totals: payload.totals,
      items: payload.items,
      meta: payload.meta,
      error: null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar relatório";
    return { totals: { totalTickets: 0, totalCustos: 0, totalReembolso: 0, totalColeta: 0 }, items: [], meta: null, error: message };
  }
}

function groupBy(items: ReportsResponse["items"], field: keyof ReportsResponse["items"][number]) {
  const map = new Map<string, { tickets: number; custo: number }>();
  items.forEach((item) => {
    const key = String(item[field] ?? "N/D");
    const value = map.get(key) ?? { tickets: 0, custo: 0 };
    value.tickets += 1;
    value.custo += Number(item.custosTotais ?? 0);
    map.set(key, value);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, ...value }));
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireCurrentUser();
  assertPermission(user.perfil, "reports.full");

  const query = await searchParams;
  const data = await getReport(query, user);
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => v && params.set(k, v));

  const byMarketplace = groupBy(data.items, "canalMarketplace");
  const byEmpresa = groupBy(data.items, "empresa");
  const byMotivo = groupBy(data.items, "motivo");

  return (
    <section className="page">
      <div className="page-header">
        <h1>Relatórios</h1>
        <p className="muted">Visualize estatísticas e exporte dados para análise.</p>
      </div>

      <form className="panel form-grid cols-4">
        <input name="startDate" type="date" defaultValue={query.startDate} />
        <input name="endDate" type="date" defaultValue={query.endDate} />
        <input name="canalMarketplace" placeholder="Marketplace" defaultValue={query.canalMarketplace} />
        <select name="empresa" defaultValue={query.empresa ?? ""}>
          <option value="">Todas as empresas</option>
          {EMPRESAS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button type="submit" className="btn btn-secondary">Filtrar</button>
      </form>

      {data.error ? <div className="alert alert-error">{data.error}</div> : null}
      {data.meta?.truncated ? (
        <div className="alert" style={{ background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e" }}>
          Relatório limitado a {data.meta.limit} itens. Total disponível: {data.meta.totalAvailable}.
        </div>
      ) : null}

      <div className="grid grid-4">
        {Object.entries(data.totals).map(([k, v]) => (
          <article key={k} className="card"><strong>{k}</strong><p className="metric-value">{String(v)}</p></article>
        ))}
      </div>

      <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Exportar Dados</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="btn btn-secondary" href={`/api/reports/export?${params.toString()}&format=csv`}>Exportar CSV</Link>
          <Link className="btn btn-primary" href={`/api/reports/export?${params.toString()}&format=xlsx`}>Exportar XLSX</Link>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="panel table-wrap">
          <h3>Resumo por Marketplace</h3>
          <table className="table"><thead><tr><th>Marketplace</th><th>Tickets</th><th>Custo Total</th></tr></thead><tbody>
            {byMarketplace.map((row) => <tr key={row.name}><td>{row.name}</td><td>{row.tickets}</td><td>R$ {row.custo.toFixed(2)}</td></tr>)}
          </tbody></table>
        </div>

        <div className="panel table-wrap">
          <h3>Resumo por Empresa</h3>
          <table className="table"><thead><tr><th>Empresa</th><th>Tickets</th><th>Custo Total</th></tr></thead><tbody>
            {byEmpresa.map((row) => <tr key={row.name}><td>{row.name}</td><td>{row.tickets}</td><td>R$ {row.custo.toFixed(2)}</td></tr>)}
          </tbody></table>
        </div>
      </div>

      <div className="panel table-wrap">
        <h3>Resumo por Motivo</h3>
        <table className="table"><thead><tr><th>Motivo</th><th>Tickets</th><th>Custo Total</th></tr></thead><tbody>
          {byMotivo.map((row) => <tr key={row.name}><td>{row.name}</td><td>{row.tickets}</td><td>R$ {row.custo.toFixed(2)}</td></tr>)}
        </tbody></table>
      </div>
    </section>
  );
}
