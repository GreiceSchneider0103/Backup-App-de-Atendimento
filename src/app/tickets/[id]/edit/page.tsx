import { requireCurrentUser } from "@/lib/auth/require-user";
import { TicketForm } from "@/components/forms/ticket-form";
import { hasPermission } from "@/lib/rbac/permissions";
import { getTicketById } from "@/lib/services/tickets-service";
import { TicketFormInput } from "@/lib/validation/ticket";
import { prisma } from "@/lib/db/prisma";
import { normalizeCanalMarketplace } from "@/config/domains";
import { formatDateTimeBR, formatEnumLabel } from "@/lib/formatters/display";

async function getTicket(id: string, user: Awaited<ReturnType<typeof requireCurrentUser>>): Promise<{ ok: true; payload: Awaited<ReturnType<typeof getTicketById>> } | { ok: false; message: string }> {
  try {
    const payload = await getTicketById(id, user);
    return { ok: true, payload };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar ticket";
    return { ok: false, message };
  }
}

function toFormValues(payload: Awaited<ReturnType<typeof getTicketById>>): Partial<TicketFormInput> {
  return {
    nomeCliente: payload.nomeCliente,
    dataCompra: payload.dataCompra ? payload.dataCompra.toISOString() : "",
    numeroVenda: payload.numeroVenda,
    linkPedido: payload.linkPedido ?? "",
    uf: payload.uf,
    cpf: payload.cpf,
    canalMarketplace: normalizeCanalMarketplace(payload.canalMarketplace) ?? "OUTRO",
    empresa: payload.empresa,
    produto: payload.produto,
    sku: payload.sku,
    fabricante: payload.fabricante ?? "",
    transportadora: payload.transportadora ?? "",
    statusReclamacao: payload.statusReclamacao,
    dataReclamacao: payload.dataReclamacao ? payload.dataReclamacao.toISOString() : "",
    motivo: payload.motivo,
    detalhesCliente: payload.detalhesCliente ?? "",
    comentarioInterno: payload.comentarioInterno ?? "",
    resolucao: payload.resolucao,
    valorReembolso: Number(payload.valorReembolso ?? 0),
    valorColeta: Number(payload.valorColeta ?? 0),
    statusTicket: payload.statusTicket,
    prazoConclusao: payload.prazoConclusao ? payload.prazoConclusao.toISOString() : null,
    responsavelId: payload.responsavelId ?? null
  };
}

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const result = await getTicket(id, user);
  const assignableUsers = await prisma.usuario.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true }
  });

  return (
    <section className="page">
      <div className="page-header">
        <h1>Editar ticket</h1>
        <p className="muted">Atualize informações operacionais e status da reclamação.</p>
      </div>
      {!result.ok ? (
        <div className="alert alert-error">{result.message ?? "Falha ao carregar ticket"}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <TicketForm
            ticketId={id}
            initialValues={toFormValues(result.payload)}
            canEditSensitive={hasPermission(user.perfil, "ticket.update_sensitive")}
            assignableUsers={assignableUsers}
            cancelHref={`/tickets/${id}`}
          />

          <aside className="panel" style={{ alignSelf: "start" }}>
            <h3>Histórico lateral</h3>
            <p><strong>Atualizado por:</strong> {result.payload?.atualizadoPorId ?? "-"}</p>
            <p><strong>Atualizado em:</strong> {formatDateTimeBR(result.payload?.atualizadoEm)}</p>
            <ul style={{ maxHeight: 420, overflow: "auto", paddingLeft: 16 }}>
              {(Array.isArray(result.payload?.auditoria) ? result.payload.auditoria : []).slice(0, 20).map((item) => (
                <li key={item.id}>{formatDateTimeBR(item.dataHora)} — {formatEnumLabel(item.acao)} — {formatEnumLabel(item.campo)}</li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </section>
  );
}
