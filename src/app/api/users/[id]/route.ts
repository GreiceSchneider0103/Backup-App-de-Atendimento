import { prisma } from "@/lib/db/prisma";
import { getCurrentApiUser } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/permissions";
import { withApiHandler } from "@/lib/http";
import { updateUserSchema } from "@/lib/validation/user";
import { registerUserAudit } from "@/lib/audit/user-audit";
import { AcaoUsuarioAuditoria, Prisma } from "@prisma/client";

function resolveAuditAction(before: { perfil: string; ativo: boolean }, payload: { perfil?: string; ativo?: boolean }): AcaoUsuarioAuditoria {
  if (payload.perfil && payload.perfil !== before.perfil) return "PROFILE_CHANGE";
  if (payload.ativo !== undefined && payload.ativo !== before.ativo) return "STATUS_CHANGE";
  return "UPDATE";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const actor = await getCurrentApiUser();
    assertPermission(actor.perfil, "user.manage");

    const { id } = await params;
    const payload = updateUserSchema.parse(await request.json());

    const before = await prisma.usuario.findUniqueOrThrow({ where: { id } });
    const updated = await prisma.usuario.update({ where: { id }, data: payload });

    await registerUserAudit({
      targetUserId: id,
      actor,
      action: resolveAuditAction(before, payload),
      before: before as unknown as Prisma.JsonObject,
      after: updated as unknown as Prisma.JsonObject
    });

    return { data: updated };
  });
}
