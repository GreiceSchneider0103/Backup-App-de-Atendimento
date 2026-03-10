import { requireCurrentUser } from "@/lib/auth/require-user";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { CANAIS_MARKETPLACE, EMPRESAS, MOTIVOS, STATUS_RECLAMACAO, STATUS_TICKET } from "@/config/domains";
import { TicketListResponse } from "@/lib/contracts";
import { listTickets } from "@/lib/services/tickets-service";
import { ticketFiltersSchema } from "@/lib/validation/ticket";
import { formatDateBR, formatEnumLabel } from "@/lib/formatters/display";

async function getTickets(query: Record<string, string | undefined>, user: Awaited<ReturnType<typeof requireCurrentUser>>): Promise<{ data: TicketListResponse["data"]; pagination: TicketListResponse["pagination"]; error: string | null }> {
  const parsed = ticketFiltersSchema.safeParse(query);
  if (!parsed.success) {
    return { data: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 }, error: "Filtros inválidos" };
  }

  try {
    const payload = await listTickets(parsed.data, user);
    return {
      data: payload.data,
      pagination: payload.pagination,
      error: null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar tickets";
    return { data: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 }, error: message };
  }
}

export default async function TicketsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireCurrentUser();
  const query = await searchParams;
  const result = await getTickets(query, user);

  return (
    <section className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1>Lista de tickets</h1>
          <p className="muted">Visualização operacional com filtros e status de SLA.</p>
        </div>
        <Link href="/tickets/new" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>Criar ticket</Link>
      </div>

      <form className="panel form-grid cols-4">
        <input name="search" placeholder="Busca por cliente, venda, produto" defaultValue={query.search} />
        <select name="canalMarketplace" defaultValue={query.canalMarketplace ?? ""}>
          <option value="">Todos os marketplaces</option>
          {CANAIS_MARKETPLACE.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}
        </select>
        <select name="empresa" defaultValue={query.empresa ?? ""}>
          <option value="">Todas as empresas</option>
          {EMPRESAS.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}
        </select>
        <select name="statusTicket" defaultValue={query.statusTicket ?? ""}>
          <option value="">Todos os status de ticket</option>
          {STATUS_TICKET.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}</select>
        <select name="statusReclamacao" defaultValue={query.statusReclamacao ?? ""}>
          <option value="">Todos os status de reclamação</option>
          {STATUS_RECLAMACAO.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}</select>
        <select name="motivo" defaultValue={query.motivo ?? ""}>
          <option value="">Todos os motivos</option>
          {MOTIVOS.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}</select>
        <input name="responsavelId" placeholder="Responsável (id)" defaultValue={query.responsavelId} />
        <input name="criadoPorId" placeholder="Criado por (id)" defaultValue={query.criadoPorId} />
        <input name="startDate" type="date" defaultValue={query.startDate} />
        <input name="endDate" type="date" defaultValue={query.endDate} />
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
              <tr>
                <th>Nome do cliente</th>
                <th>Marketplace</th>
                <th>Empresa</th>
                <th>Motivo</th>
                <th>Status ticket</th>
                <th>Status reclamação</th>
                <th>Prazo</th>
                <th>SLA</th>
                <th>Custos totais</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((item) => (
                <tr key={item.id}>
                  <td><Link href={`/tickets/${item.id}`}>{item.nomeCliente}</Link></td>
                  <td><StatusBadge value={item.canalMarketplace} /></td>
                  <td><StatusBadge value={item.empresa} /></td>
                  <td><StatusBadge value={item.motivo} /></td>
                  <td><StatusBadge value={item.statusTicket} /></td>
                  <td><StatusBadge value={item.statusReclamacao} /></td>
                  <td>{formatDateBR(item.prazoConclusao as unknown as string)}</td>
                  <td><StatusBadge value={item.slaStatus} /></td>
                  <td>{Number(item.custosTotais).toFixed(2)}</td>
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
