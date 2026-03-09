import { requireCurrentUser } from "@/lib/auth/require-user";
import { fetchInternalApi } from "@/lib/http/server-fetch";
import { KanbanBoard } from "@/components/tickets/kanban-board";

async function getTickets() {
  const response = await fetchInternalApi("/api/tickets?pageSize=200");
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return { data: [], error: payload?.message ?? "Falha ao carregar kanban" };
  }

  return { data: Array.isArray(payload?.data) ? payload.data : [], error: null };
}

export default async function KanbanTicketsPage() {
  await requireCurrentUser();
  const result = await getTickets();

  return (
    <section className="page">
      <div className="page-header">
        <h1>Kanban de tickets</h1>
        <p className="muted">Acompanhe e atualize status de forma visual.</p>
      </div>

      {result.error ? <div className="alert alert-error">{result.error}</div> : null}
      <KanbanBoard initialItems={result.data} />
    </section>
  );
}
