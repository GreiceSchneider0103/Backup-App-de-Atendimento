import { AcaoAuditoria, Prisma, Usuario } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function registerTicketAudit(params: {
  ticketId: string;
  user: Usuario;
  action: AcaoAuditoria;
  before?: Prisma.JsonObject;
  after?: Prisma.JsonObject;
}) {
  const { ticketId, user, action, before, after } = params;

  if (action === "CREATE") {
    await prisma.ticketAuditoria.create({
      data: {
        ticketId,
        usuarioId: user.id,
        acao: action,
        campo: "ticket",
        valorNovo: JSON.stringify(after ?? {})
      }
    });
    return;
  }

  const keys = new Set([...(before ? Object.keys(before) : []), ...(after ? Object.keys(after) : [])]);

  await prisma.ticketAuditoria.createMany({
    data: [...keys]
      .filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]))
      .map((key) => ({
        ticketId,
        usuarioId: user.id,
        acao: action,
        campo: key,
        valorAntigo: before?.[key] ? JSON.stringify(before[key]) : null,
        valorNovo: after?.[key] ? JSON.stringify(after[key]) : null
      }))
  });
}
