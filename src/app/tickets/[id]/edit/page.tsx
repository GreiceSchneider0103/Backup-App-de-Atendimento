import { TicketForm } from "@/components/forms/ticket-form";

async function getTicket(id: string) {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/tickets/${id}`, { cache: "no-store" });
  return response.json();
}

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getTicket(id);

  return (
    <section>
      <h1>Editar ticket</h1>
      <TicketForm ticketId={id} initialValues={ticket} />
    </section>
  );
}
