import { requireCurrentUser } from "@/lib/auth/require-user";
import { fetchInternalApi } from "@/lib/http/server-fetch";
import { KanbanBoard } from "@/components/tickets/kanban-board";

async function getTickets() {
  const pageSize = 200;
  const response = await fetchInternalApi(`/api/tickets?pageSize=${pageSize}`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return { data: [], error: payload?.message ?? "Falha ao carregar kanban", truncated: false, total: 0, pageSize };
  }

  const data = Array.isArray(payload?.data) ? payload.data : [];
  const total = Number(payload?.pagination?.total ?? data.length);
  return { data, error: null, truncated: total > data.length, total, pageSize };
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
      {result.truncated ? (
        <div className="alert" style={{ background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e" }}>
          Kanban limitado aos primeiros {result.pageSize} tickets de {result.total} ativos.
        </div>
      ) : null}
      <KanbanBoard initialItems={result.data} />
    </section>
  );
}
