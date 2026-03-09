import { AcaoAuditoria, Prisma, Usuario } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { registerTicketAudit } from "@/lib/audit/ticket-audit";
import { TicketFiltersInput, TicketInput } from "@/lib/validation/ticket";
import { getTicketScopeWhere, hasPermission } from "@/lib/rbac/permissions";
import { calculateSla } from "@/lib/utils/sla";
import { ForbiddenError } from "@/lib/errors";

const sensitiveFields = ["valorReembolso", "valorColeta", "prazoConclusao", "resolucao"] as const;

function assertCanEditFields(user: Usuario, payload: Partial<TicketInput>) {
  const touchingSensitive = sensitiveFields.some((field) => payload[field] !== undefined);
  if (touchingSensitive && !hasPermission(user.perfil, "ticket.update_sensitive")) {
    throw new ForbiddenError("Seu perfil não pode editar campos sensíveis");
  }
}

function getDateRange(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return undefined;
  return {
    ...(startDate ? { gte: new Date(startDate) } : {}),
    ...(endDate ? { lte: new Date(endDate) } : {})
  };
}

export async function listTickets(
  query: TicketFiltersInput,
  user: { id: string; perfil: "ATENDENTE" | "SUPERVISOR" | "ADMIN" }
) {
  const where: Prisma.TicketWhereInput = {
    ativo: true,
    ...getTicketScopeWhere(user),
    ...(query.search
      ? {
          OR: [
            { nomeCliente: { contains: query.search, mode: "insensitive" } },
            { numeroVenda: { contains: query.search, mode: "insensitive" } },
            { canalMarketplace: { contains: query.search, mode: "insensitive" } },
            { produto: { contains: query.search, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(query.empresa ? { empresa: query.empresa } : {}),
    ...(query.canalMarketplace ? { canalMarketplace: query.canalMarketplace } : {}),
    ...(query.statusTicket ? { statusTicket: query.statusTicket } : {}),
    ...(query.statusReclamacao ? { statusReclamacao: query.statusReclamacao } : {}),
    ...(query.motivo ? { motivo: query.motivo } : {}),
    ...(query.responsavelId ? { responsavelId: query.responsavelId } : {}),
    ...(getDateRange(query.startDate, query.endDate) ? { dataReclamacao: getDateRange(query.startDate, query.endDate) } : {})
  };

  const [items, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: { [query.orderBy]: query.orderDir },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { criadoPor: true, atualizadoPor: true }
    }),
    prisma.ticket.count({ where })
  ]);

  return {
    items: items.map((item) => ({ ...item, slaStatus: calculateSla(item.statusTicket, item.prazoConclusao) })),
    total,
    page: query.page,
    pageSize: query.pageSize
  };
}

export async function createTicket(input: TicketInput, userId: string) {
  const ticket = await prisma.ticket.create({
    data: {
      ...input,
      dataCompra: new Date(input.dataCompra),
      dataReclamacao: new Date(input.dataReclamacao),
      mesReclamacao: new Date(input.dataReclamacao).getUTCMonth() + 1,
      anoReclamacao: new Date(input.dataReclamacao).getUTCFullYear(),
      prazoConclusao: input.prazoConclusao ? new Date(input.prazoConclusao) : null,
      valorReembolso: new Prisma.Decimal(input.valorReembolso),
      valorColeta: new Prisma.Decimal(input.valorColeta),
      custosTotais: new Prisma.Decimal(input.valorReembolso + input.valorColeta),
      criadoPorId: userId,
      atualizadoPorId: userId,
      slaStatus: calculateSla(input.statusTicket, input.prazoConclusao ? new Date(input.prazoConclusao) : null)
    }
  });

  const user = await prisma.usuario.findUniqueOrThrow({ where: { id: userId } });
  await registerTicketAudit({ ticketId: ticket.id, user, action: "CREATE", after: ticket as unknown as Prisma.JsonObject });
  return ticket;
}

export async function getTicketById(id: string, user: Usuario) {
  const ticket = await prisma.ticket.findFirst({
    where: { id, ...getTicketScopeWhere(user) },
    include: { auditoria: { orderBy: { dataHora: "desc" }, take: 100 } }
  });

  if (!ticket) throw new ForbiddenError("Ticket não encontrado ou sem acesso");
  return ticket;
}

export async function updateTicket(id: string, payload: Partial<TicketInput>, user: Usuario) {
  const before = await prisma.ticket.findFirstOrThrow({ where: { id, ...getTicketScopeWhere(user) } });
  assertCanEditFields(user, payload);

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...payload,
      atualizadoPorId: user.id,
      ...(payload.dataReclamacao
        ? {
            mesReclamacao: new Date(payload.dataReclamacao).getUTCMonth() + 1,
            anoReclamacao: new Date(payload.dataReclamacao).getUTCFullYear()
          }
        : {}),
      slaStatus: calculateSla(
        payload.statusTicket ?? before.statusTicket,
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

  const action: AcaoAuditoria = payload.statusTicket && payload.statusTicket !== before.statusTicket ? "STATUS_CHANGE" : "UPDATE";
  await registerTicketAudit({
    ticketId: id,
    user,
    action,
    before: before as unknown as Prisma.JsonObject,
    after: updated as unknown as Prisma.JsonObject
  });

  return updated;
}

export async function softDeleteTicket(id: string, user: Usuario) {
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
}
