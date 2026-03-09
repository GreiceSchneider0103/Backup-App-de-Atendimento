import { TicketForm } from "@/components/forms/ticket-form";

async function getTicket(id: string) {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/tickets/${id}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, payload };
}

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { ok, payload } = await getTicket(id);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Editar ticket</h1>
        <p className="muted">Atualize informações operacionais e status da reclamação.</p>
      </div>
      {!ok ? <div className="alert alert-error">{payload?.message ?? "Falha ao carregar ticket"}</div> : <TicketForm ticketId={id} initialValues={payload} />}
    </section>
  );
}
