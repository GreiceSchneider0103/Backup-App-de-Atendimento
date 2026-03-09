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
      <article className="card"><pre>{JSON.stringify(ticket, null, 2)}</pre></article>
    </section>
  );
}
