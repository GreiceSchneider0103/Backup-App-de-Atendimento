import { requireCurrentUser } from "@/lib/auth/require-user";
import { TicketForm } from "@/components/forms/ticket-form";
import { hasPermission } from "@/lib/rbac/permissions";
import { prisma } from "@/lib/db/prisma";

export default async function NewTicketPage() {
  const user = await requireCurrentUser();
  const assignableUsers = await prisma.usuario.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true }
  });

  return (
    <section className="page">
      <div className="page-header">
        <h1>Criar ticket</h1>
        <p className="muted">Preencha os dados para registrar uma nova reclamação.</p>
      </div>
      <TicketForm
        canEditSensitive={hasPermission(user.perfil, "ticket.update_sensitive")}
        assignableUsers={assignableUsers}
      />
    </section>
  );
}
