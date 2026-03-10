import { requireCurrentUser } from "@/lib/auth/require-user";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { CANAIS_MARKETPLACE, EMPRESAS } from "@/config/domains";
import { ticketFiltersSchema } from "@/lib/validation/ticket";
import { getDashboardData } from "@/lib/services/dashboard-service";

async function getDashboard(query: Record<string, string | undefined>, user: Awaited<ReturnType<typeof requireCurrentUser>>) {
  const parsed = ticketFiltersSchema.partial().safeParse(query);
  if (!parsed.success) {
    return { cards: {}, charts: {} as Record<string, Array<{ name: string; value: number }>>, error: "Filtros inválidos para dashboard" };
  }

  const payload = await getDashboardData(parsed.data, user);
  return { cards: payload.cards, charts: payload.charts, error: null };
}

const cardConfig: Record<string, { label: string; tone: string; icon: string }> = {
  totalTickets: { label: "Total de Tickets", tone: "#2563eb", icon: "◫" },
  ticketsAbertos: { label: "Tickets Abertos", tone: "#eab308", icon: "!" },
  ticketsAtrasados: { label: "Tickets Atrasados", tone: "#ef4444", icon: "⚠" },
  custoTotal: { label: "Custo Total", tone: "#9333ea", icon: "$" },
  reembolsoTotal: { label: "Valor de Reembolso", tone: "#16a34a", icon: "$" },
  coletaTotal: { label: "Total de Coleta", tone: "#06b6d4", icon: "✓" }
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireCurrentUser();
  const query = await searchParams;
  const data = await getDashboard(query, user);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="muted">Indicadores consolidados da operação.</p>
      </div>

      <form className="panel form-grid cols-4">
        <select name="canalMarketplace" defaultValue={query.canalMarketplace ?? ""}>
          <option value="">Todos os marketplaces</option>
          {CANAIS_MARKETPLACE.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
        </select>
        <select name="empresa" defaultValue={query.empresa ?? ""}>
          <option value="">Todas as empresas</option>
          {EMPRESAS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <input name="startDate" type="date" defaultValue={query.startDate} />
        <input name="endDate" type="date" defaultValue={query.endDate} />
        <button type="submit" className="btn btn-secondary">Filtrar</button>
      </form>

      {data.error ? <div className="alert alert-error">{data.error}</div> : null}

      <div className="grid grid-4">
        {Object.entries(data.cards).map(([key, value]) => {
          const config = cardConfig[key] ?? { label: key, tone: "#2563eb", icon: "●" };
          return (
            <article key={key} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p className="muted">{config.label}</p>
                <p className="metric-value">{String(value)}</p>
              </div>
              <span style={{ width: 42, height: 42, borderRadius: 10, background: config.tone, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{config.icon}</span>
            </article>
          );
        })}
      </div>

      <DashboardCharts charts={data.charts} />
    </section>
  );
}
