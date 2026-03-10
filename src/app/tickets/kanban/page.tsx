import { requireCurrentUser } from "@/lib/auth/require-user";
import { KanbanBoard } from "@/components/tickets/kanban-board";
import { listTickets } from "@/lib/services/tickets-service";

async function getTickets(user: Awaited<ReturnType<typeof requireCurrentUser>>) {
  const pageSize = 200;

  try {
    const payload = await listTickets({ page: 1, pageSize, orderBy: "criadoEm", orderDir: "desc" }, user);
    return {
      data: payload.data,
      error: null,
      truncated: payload.pagination.total > payload.data.length,
      total: payload.pagination.total,
      pageSize
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar kanban";
    return { data: [], error: message, truncated: false, total: 0, pageSize };
  }
}

export default async function KanbanTicketsPage() {
  const user = await requireCurrentUser();
  const result = await getTickets(user);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Kanban de tickets</h1>
        <p className="muted">Acompanhe e atualize status de forma visual.</p>
      </div>

      {result.error ? <div className="alert alert-error">{result.error}</div> : null}
      {result.truncated ? (
        <div className="alert" style={{ background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e" }}>
          Kanban limitado aos primeiros {result.pageSize} tickets de {result.total} ativos.
        </div>
      ) : null}
      <KanbanBoard initialItems={result.data} />
    </section>
  );
}
