import { requireCurrentUser } from "@/lib/auth/require-user";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTicketById } from "@/lib/services/tickets-service";
import { formatCurrencyBR, formatDateBR, formatDateTimeBR, formatEnumLabel } from "@/lib/formatters/display";

async function getTicket(id: string, user: Awaited<ReturnType<typeof requireCurrentUser>>) {
  try {
    const ticket = await getTicketById(id, user);
    return { ticket, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar ticket";
    return { ticket: null, error: message };
  }
}

export default async function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const { ticket, error } = await getTicket(id, user);

  return (
    <section className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1>Detalhe do ticket</h1>
          <p className="muted">Informações completas e histórico de auditoria.</p>
        </div>
        <Link className="btn btn-primary" href={`/tickets/${id}/edit`} style={{ whiteSpace: "nowrap" }}>Editar ticket</Link>
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
              <p><strong>Número da venda:</strong> {ticket.numeroVenda}</p>
              <p style={{ display: "grid", gap: 4 }}>
                <strong>Link do pedido:</strong>
                {ticket.linkPedido ? (
                  <a href={ticket.linkPedido} target="_blank" rel="noreferrer" style={{ overflowWrap: "anywhere" }}>{ticket.linkPedido}</a>
                ) : "-"}
              </p>
              <p><strong>Data da compra:</strong> {formatDateBR(ticket.dataCompra)}</p>
              <p><strong>Marketplace:</strong> {formatEnumLabel(ticket.canalMarketplace)}</p>
              <p><strong>Empresa:</strong> {formatEnumLabel(ticket.empresa)}</p>
              <p><strong>Produto:</strong> {ticket.produto}</p>
              <p><strong>SKU:</strong> {ticket.sku}</p>
            </article>

            <article className="card">
              <h2>Reclamação e prazo</h2>
              <p><strong>Status do ticket:</strong> <StatusBadge value={ticket.statusTicket} /></p>
              <p><strong>Status da reclamação:</strong> <StatusBadge value={ticket.statusReclamacao} /></p>
              <p><strong>Motivo:</strong> <StatusBadge value={ticket.motivo} /></p>
              <p><strong>Resolução:</strong> {ticket.resolucao ? formatEnumLabel(ticket.resolucao) : "-"}</p>
              <p><strong>Data da reclamação:</strong> {formatDateBR(ticket.dataReclamacao)}</p>
              <p><strong>Prazo de conclusão:</strong> {formatDateBR(ticket.prazoConclusao)}</p>
              <p><strong>SLA:</strong> <StatusBadge value={ticket.slaStatus} /></p>
            </article>

            <article className="card">
              <h2>Valores e rastreabilidade</h2>
              <p><strong>Reembolso:</strong> {formatCurrencyBR(ticket.valorReembolso as unknown as number)}</p>
              <p><strong>Coleta, envio ou peças:</strong> {formatCurrencyBR(ticket.valorColeta as unknown as number)}</p>
              <p><strong>Custos totais:</strong> {formatCurrencyBR(ticket.custosTotais as unknown as number)}</p>
              <p><strong>Responsável:</strong> {ticket.responsavel?.nome ?? "Não atribuído"}</p>
              <p><strong>Criado em:</strong> {formatDateTimeBR(ticket.criadoEm)}</p>
              <p><strong>Atualizado em:</strong> {formatDateTimeBR(ticket.atualizadoEm)}</p>
              <p><strong>Atualizado por:</strong> {ticket.atualizadoPorId ?? "-"}</p>
            </article>
          </div>

          <article className="card">
            <h2>Comentário interno</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{ticket.comentarioInterno || "Sem comentário interno."}</p>
          </article>

          <article className="card">
            <h2>Histórico de auditoria</h2>
            <ul>
              {(Array.isArray(ticket.auditoria) ? ticket.auditoria : []).map((item) => (
                <li key={item.id}>{formatDateTimeBR(item.dataHora)} — {formatEnumLabel(item.acao)} — {formatEnumLabel(item.campo)}</li>
              ))}
            </ul>
          </article>
        </>
      )}
    </section>
  );
}
