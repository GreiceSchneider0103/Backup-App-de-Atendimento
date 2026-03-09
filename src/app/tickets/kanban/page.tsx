import { KanbanBoard } from "@/components/tickets/kanban-board";

async function getTickets() {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/tickets?pageSize=200`, { cache: "no-store" });
  return response.json();
}

export default async function KanbanTicketsPage() {
  const data = await getTickets();

  return (
    <section className="grid">
      <h1>Kanban de tickets</h1>
      <KanbanBoard initialItems={data.items ?? []} />
    </section>
  );
}
