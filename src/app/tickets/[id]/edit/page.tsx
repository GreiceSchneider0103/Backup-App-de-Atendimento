import { requireCurrentUser } from "@/lib/auth/require-user";
import { fetchInternalApi } from "@/lib/http/server-fetch";
import { TicketForm } from "@/components/forms/ticket-form";
import { hasPermission } from "@/lib/rbac/permissions";

async function getTicket(id: string) {
  const response = await fetchInternalApi(`/api/tickets/${id}`);
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, payload };
}

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const { ok, payload } = await getTicket(id);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Editar ticket</h1>
        <p className="muted">Atualize informações operacionais e status da reclamação.</p>
      </div>
      {!ok ? (
        <div className="alert alert-error">{payload?.message ?? "Falha ao carregar ticket"}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <TicketForm
            ticketId={id}
            initialValues={payload}
            canEditSensitive={hasPermission(user.perfil, "ticket.update_sensitive")}
          />

          <aside className="panel" style={{ alignSelf: "start" }}>
            <h3>Histórico lateral</h3>
            <p><strong>Atualizado por:</strong> {payload?.atualizadoPorId ?? "-"}</p>
            <p><strong>Atualizado em:</strong> {payload?.atualizadoEm ? String(payload.atualizadoEm).slice(0, 19).replace("T", " ") : "-"}</p>
            <ul style={{ maxHeight: 420, overflow: "auto", paddingLeft: 16 }}>
              {(Array.isArray(payload?.auditoria) ? payload.auditoria : []).slice(0, 20).map((item: any) => (
                <li key={item.id}>{item.dataHora} — {item.acao} — {item.campo}</li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </section>
  );
}
