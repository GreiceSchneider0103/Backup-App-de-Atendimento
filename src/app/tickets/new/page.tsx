import { requireCurrentUser } from "@/lib/auth/require-user";
import { TicketForm } from "@/components/forms/ticket-form";

export default async function NewTicketPage() {
  await requireCurrentUser();
  return (
    <section className="page">
      <div className="page-header">
        <h1>Criar ticket</h1>
        <p className="muted">Preencha os dados para registrar uma nova reclamação.</p>
      </div>
      <TicketForm />
    </section>
  );
}
