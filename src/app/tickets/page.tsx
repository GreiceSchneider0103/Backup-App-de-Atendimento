import { requireCurrentUser } from "@/lib/auth/require-user";
import { fetchInternalApi } from "@/lib/http/server-fetch";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

async function getTickets(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => value && params.set(key, value));
  const response = await fetchInternalApi(`/api/tickets?${params.toString()}`);

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { data: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 }, error: payload?.message ?? "Falha ao carregar tickets" };
  }

  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    pagination: payload?.pagination ?? { total: 0, page: 1, pageSize: 20, totalPages: 0 },
    error: null
  };
}

export default async function TicketsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCurrentUser();
  const query = await searchParams;
  const result = await getTickets(query);

  return (
    <section className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Lista de tickets</h1>
          <p className="muted">Visualização operacional com filtros e status de SLA.</p>
        </div>
        <Link href="/tickets/new" className="btn btn-primary">Criar ticket</Link>
      </div>

      <form className="panel form-grid cols-4">
        <input name="search" placeholder="Busca por cliente, venda, produto" defaultValue={query.search} />
        <input name="canalMarketplace" placeholder="Marketplace" defaultValue={query.canalMarketplace} />
        <input name="responsavelId" placeholder="Responsável (id)" defaultValue={query.responsavelId} />
        <select name="orderBy" defaultValue={query.orderBy ?? "criadoEm"}>
          <option value="criadoEm">Criado em</option>
          <option value="dataReclamacao">Data reclamação</option>
          <option value="custosTotais">Custos</option>
          <option value="prazoConclusao">Prazo</option>
        </select>
        <button type="submit" className="btn btn-secondary">Aplicar filtros</button>
      </form>

      {result.error ? <div className="alert alert-error">{result.error}</div> : null}

      <div className="panel table-wrap">
        {!result.data.length ? (
          <div className="empty-state">Nenhum ticket encontrado para os filtros atuais.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Cliente</th><th>Marketplace</th><th>Empresa</th><th>Status</th><th>SLA</th><th>Custo</th><th>Backup</th></tr>
            </thead>
            <tbody>
              {result.data.map((item: any) => (
                <tr key={item.id}>
                  <td><Link href={`/tickets/${item.id}`}>{item.nomeCliente}</Link></td>
                  <td><StatusBadge value={item.canalMarketplace} /></td>
                  <td><StatusBadge value={item.empresa} /></td>
                  <td><StatusBadge value={item.statusTicket} /></td>
                  <td><StatusBadge value={item.slaStatus} /></td>
                  <td>{Number(item.custosTotais).toFixed(2)}</td>
                  <td><StatusBadge value={item.backupSyncStatus ?? "PENDING"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <strong>Paginação:</strong> página {result.pagination.page} de {Math.max(result.pagination.totalPages, 1)} • total {result.pagination.total}
      </div>
    </section>
  );
}
