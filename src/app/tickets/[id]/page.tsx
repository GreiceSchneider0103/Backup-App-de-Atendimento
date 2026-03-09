import Link from "next/link";

async function getTicket(id: string) {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/tickets/${id}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return { ticket: null, error: payload?.message ?? "Falha ao carregar ticket" };
  }

  return { ticket: payload, error: null };
}

export default async function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { ticket, error } = await getTicket(id);

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
          <article className="card">
            <h2>Resumo</h2>
            <p><strong>Cliente:</strong> {ticket.nomeCliente}</p>
            <p><strong>Venda:</strong> {ticket.numeroVenda}</p>
            <p><strong>Marketplace:</strong> {ticket.canalMarketplace}</p>
            <p><strong>Empresa:</strong> {ticket.empresa}</p>
            <p><strong>Status:</strong> {ticket.statusTicket}</p>
            <p><strong>SLA:</strong> {ticket.slaStatus}</p>
            <p><strong>Custos totais:</strong> {Number(ticket.custosTotais).toFixed(2)}</p>
          </article>

          <article className="card">
            <h2>Backup Google Sheets</h2>
            <p><strong>Status:</strong> {ticket.backupSyncStatus ?? "PENDING"}</p>
            <p><strong>Linha:</strong> {ticket.backupSheetRowNumber ?? "-"}</p>
            <p><strong>Última sincronização:</strong> {ticket.backupLastSyncedAt ?? "-"}</p>
            {ticket.backupSyncError ? <p><strong>Erro:</strong> {ticket.backupSyncError}</p> : null}
          </article>

          <article className="card">
            <h2>Histórico de auditoria</h2>
            <ul>
              {(Array.isArray(ticket.auditoria) ? ticket.auditoria : []).map((item: any) => (
                <li key={item.id}>{item.dataHora} — {item.acao} — {item.campo}</li>
              ))}
            </ul>
          </article>
        </>
      )}
    </section>
  );
}
