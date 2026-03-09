import Link from "next/link";

async function getTicket(id: string) {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/tickets/${id}`, { cache: "no-store" });
  return response.json();
}

export default async function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getTicket(id);

  return (
    <section className="grid">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Detalhe do ticket</h1>
        <Link href={`/tickets/${id}/edit`}>Editar</Link>
      </div>

      <article className="card">
        <h2>Cliente e pedido</h2>
        <p><strong>Cliente:</strong> {ticket.nomeCliente}</p>
        <p><strong>Venda:</strong> {ticket.numeroVenda}</p>
        <p><strong>Marketplace:</strong> {ticket.canalMarketplace}</p>
        <p><strong>Empresa:</strong> {ticket.empresa}</p>
        <p><strong>Status:</strong> {ticket.statusTicket}</p>
        <p><strong>Custos totais:</strong> {Number(ticket.custosTotais).toFixed(2)}</p>
      </article>

      <article className="card">
        <h2>Histórico de auditoria</h2>
        <ul>
          {ticket.auditoria?.map((item: any) => (
            <li key={item.id}>{item.dataHora} — {item.acao} — {item.campo}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
