import { KanbanBoard } from "@/components/tickets/kanban-board";

async function getTickets() {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/tickets?pageSize=200`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return { data: [], error: payload?.message ?? "Falha ao carregar kanban" };
  }

  return { data: Array.isArray(payload?.data) ? payload.data : [], error: null };
}

export default async function KanbanTicketsPage() {
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
