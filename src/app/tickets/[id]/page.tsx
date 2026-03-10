import { requireCurrentUser } from "@/lib/auth/require-user";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTicketById } from "@/lib/services/tickets-service";

async function getTicket(id: string, user: Awaited<ReturnType<typeof requireCurrentUser>>) {
  try {
    const ticket = await getTicketById(id, user);
    return { ticket, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar ticket";
    return { ticket: null, error: message };
  }
}

function dateText(value?: string | null) {
  return value ? String(value).slice(0, 10) : "-";
}

export default async function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const { ticket, error } = await getTicket(id, user);

  return (
    <section className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Detalhe do ticket</h1>
          <p className="muted">Informações completas e histórico de auditoria.</p>
        </div>
        <Link className="btn btn-primary" href={`/tickets/${id}/edit`}>Editar</Link>
      </div>

      {error || !ticket ? (
        <div className="alert alert-error">{error ?? "Ticket não encontrado"}</div>
      ) : (
        <>
          <div className="grid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
            <article className="card">
              <h2>Dados do cliente</h2>
              <p><strong>Nome:</strong> {ticket.nomeCliente}</p>
              <p><strong>CPF:</strong> {ticket.cpf}</p>
              <p><strong>UF:</strong> {ticket.uf}</p>
              <p><strong>Detalhes:</strong> {ticket.detalhesCliente || "-"}</p>
            </article>

            <article className="card">
              <h2>Dados do pedido</h2>
              <p><strong>Número venda:</strong> {ticket.numeroVenda}</p>
              <p><strong>Link pedido:</strong> {ticket.linkPedido || "-"}</p>
              <p><strong>Data compra:</strong> {dateText(ticket.dataCompra as unknown as string)}</p>
              <p><strong>Marketplace:</strong> {ticket.canalMarketplace}</p>
              <p><strong>Empresa:</strong> {ticket.empresa}</p>
              <p><strong>Produto:</strong> {ticket.produto}</p>
              <p><strong>SKU:</strong> {ticket.sku}</p>
            </article>

            <article className="card">
              <h2>Reclamação e prazo</h2>
              <p><strong>Status ticket:</strong> <StatusBadge value={ticket.statusTicket} /></p>
              <p><strong>Status reclamação:</strong> <StatusBadge value={ticket.statusReclamacao} /></p>
              <p><strong>Motivo:</strong> <StatusBadge value={ticket.motivo} /></p>
              <p><strong>Resolução:</strong> {ticket.resolucao ?? "-"}</p>
              <p><strong>Data reclamação:</strong> {dateText(ticket.dataReclamacao as unknown as string)}</p>
              <p><strong>Prazo conclusão:</strong> {dateText(ticket.prazoConclusao as unknown as string)}</p>
              <p><strong>SLA:</strong> <StatusBadge value={ticket.slaStatus} /></p>
            </article>

            <article className="card">
              <h2>Valores e rastreabilidade</h2>
              <p><strong>Reembolso:</strong> {Number(ticket.valorReembolso ?? 0).toFixed(2)}</p>
              <p><strong>Coleta:</strong> {Number(ticket.valorColeta ?? 0).toFixed(2)}</p>
              <p><strong>Custos totais:</strong> {Number(ticket.custosTotais ?? 0).toFixed(2)}</p>
              <p><strong>Responsável:</strong> {ticket.responsavel?.nome ?? "Não atribuído"}</p>
              <p><strong>Criado em:</strong> {dateText(ticket.criadoEm as unknown as string)}</p>
              <p><strong>Atualizado em:</strong> {dateText(ticket.atualizadoEm as unknown as string)}</p>
              <p><strong>Atualizado por:</strong> {ticket.atualizadoPorId ?? "-"}</p>
            </article>
          </div>

          <article className="card">
            <h2>Histórico de auditoria</h2>
            <ul>
              {(Array.isArray(ticket.auditoria) ? ticket.auditoria : []).map((item) => (
                <li key={item.id}>{String(item.dataHora)} — {item.acao} — {item.campo}</li>
              ))}
            </ul>
          </article>
        </>
      )}
    </section>
  );
}
