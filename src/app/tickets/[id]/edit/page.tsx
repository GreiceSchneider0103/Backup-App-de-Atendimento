import { requireCurrentUser } from "@/lib/auth/require-user";
import { fetchInternalApi } from "@/lib/http/server-fetch";
import { TicketForm } from "@/components/forms/ticket-form";

async function getTicket(id: string) {
  const response = await fetchInternalApi(`/api/tickets/${id}`);
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, payload };
}

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCurrentUser();
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
