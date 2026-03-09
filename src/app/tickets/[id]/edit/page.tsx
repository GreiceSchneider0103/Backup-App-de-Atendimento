import { TicketForm } from "@/components/forms/ticket-form";

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <section>
      <h1>Editar ticket</h1>
      <TicketForm ticketId={id} />
    </section>
  );
}
