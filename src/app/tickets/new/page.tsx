import { requireCurrentUser } from "@/lib/auth/require-user";
import { TicketForm } from "@/components/forms/ticket-form";
import { hasPermission } from "@/lib/rbac/permissions";

export default async function NewTicketPage() {
  const user = await requireCurrentUser();
  return (
    <section className="page">
      <div className="page-header">
        <h1>Criar ticket</h1>
        <p className="muted">Preencha os dados para registrar uma nova reclamação.</p>
      </div>
      <TicketForm canEditSensitive={hasPermission(user.perfil, "ticket.update_sensitive")} />
    </section>
  );
}
