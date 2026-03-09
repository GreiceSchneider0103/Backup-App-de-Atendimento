import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentApiUser } from "@/lib/auth/session";
import { assertPermission, getTicketScopeWhere, hasPermission } from "@/lib/rbac/permissions";
import { ticketSchema } from "@/lib/validation/ticket";
import { registerTicketAudit } from "@/lib/audit/ticket-audit";
import { ForbiddenError } from "@/lib/errors";
import { calculateSla } from "@/lib/utils/sla";
import { withApiHandler } from "@/lib/http";

const sensitiveFields = ["valorReembolso", "valorColeta", "prazoConclusao", "custosTotais", "resolucao"] as const;

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    const { id } = await params;
    const ticket = await prisma.ticket.findFirst({
      where: { id, ...getTicketScopeWhere(user) },
      include: { auditoria: { orderBy: { dataHora: "desc" }, take: 100 } }
    });
    if (!ticket) throw new ForbiddenError("Ticket não encontrado ou sem acesso");
    return ticket;
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    assertPermission(user.perfil, "ticket.update");

    const { id } = await params;
    const payload = ticketSchema.partial().parse(await request.json());
    const before = await prisma.ticket.findFirstOrThrow({ where: { id, ...getTicketScopeWhere(user) } });

    const touchingSensitive = sensitiveFields.some((field) => payload[field] !== undefined);
    if (touchingSensitive && !hasPermission(user.perfil, "ticket.update_sensitive")) {
      throw new ForbiddenError("Seu perfil não pode editar campos sensíveis");
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        ...payload,
        atualizadoPorId: user.id,
        ...(payload.dataReclamacao ? {
          mesReclamacao: new Date(payload.dataReclamacao).getUTCMonth() + 1,
          anoReclamacao: new Date(payload.dataReclamacao).getUTCFullYear()
        } : {}),
        slaStatus: calculateSla(
          (payload.statusTicket as any) ?? before.statusTicket,
          payload.prazoConclusao ? new Date(payload.prazoConclusao) : before.prazoConclusao
        ),
        ...(payload.valorReembolso !== undefined || payload.valorColeta !== undefined
          ? {
              custosTotais: new Prisma.Decimal(
                Number(payload.valorReembolso ?? before.valorReembolso) + Number(payload.valorColeta ?? before.valorColeta)
              )
            }
          : {})
      }
    });

    await registerTicketAudit({
      ticketId: id,
      user,
      action: payload.statusTicket && payload.statusTicket !== before.statusTicket ? "STATUS_CHANGE" : "UPDATE",
      before: before as unknown as Prisma.JsonObject,
      after: updated as unknown as Prisma.JsonObject
    });

    return updated;
  });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    assertPermission(user.perfil, "ticket.soft_delete");
    const { id } = await params;

    const before = await prisma.ticket.findFirstOrThrow({ where: { id, ...getTicketScopeWhere(user) } });
    const updated = await prisma.ticket.update({ where: { id }, data: { ativo: false, atualizadoPorId: user.id } });
    await registerTicketAudit({
      ticketId: id,
      user,
      action: "SOFT_DELETE",
      before: before as unknown as Prisma.JsonObject,
      after: updated as unknown as Prisma.JsonObject
    });
    return { ok: true };
  });
}
