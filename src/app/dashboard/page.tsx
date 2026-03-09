import { requireCurrentUser } from "@/lib/auth/require-user";
import { fetchInternalApi } from "@/lib/http/server-fetch";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

async function getDashboard(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => v && params.set(k, v));
  const response = await fetchInternalApi(`/api/dashboard?${params.toString()}`);

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { cards: {}, charts: {}, error: payload?.message ?? "Falha ao carregar dashboard" };
  }

  return { cards: payload.cards ?? {}, charts: payload.charts ?? {}, error: null };
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
  await requireCurrentUser();
  const query = await searchParams;
  const data = await getDashboard(query);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
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
