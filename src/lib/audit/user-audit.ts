import { AcaoUsuarioAuditoria, Prisma, Usuario } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function registerUserAudit(params: {
  targetUserId: string;
  actor: Usuario;
  action: AcaoUsuarioAuditoria;
  before?: Prisma.JsonObject;
  after?: Prisma.JsonObject;
}) {
  const { targetUserId, actor, action, before, after } = params;

  if (action === "CREATE") {
    await prisma.usuarioAuditoria.create({
      data: {
        usuarioId: targetUserId,
        atorId: actor.id,
        acao: action,
        campo: "usuario",
        valorNovo: JSON.stringify(after ?? {})
      }
    });
    return;
  }

  const keys = new Set([...(before ? Object.keys(before) : []), ...(after ? Object.keys(after) : [])]);

  const rows = [...keys]
    .filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]))
    .map((key) => ({
      usuarioId: targetUserId,
      atorId: actor.id,
      acao: action,
      campo: key,
      valorAntigo: before?.[key] === undefined ? null : JSON.stringify(before[key]),
      valorNovo: after?.[key] === undefined ? null : JSON.stringify(after[key])
    }));

  if (!rows.length) return;
  await prisma.usuarioAuditoria.createMany({ data: rows });
}
