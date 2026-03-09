import { prisma } from "@/lib/db/prisma";
import { getCurrentApiUser } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/permissions";
import { withApiHandler } from "@/lib/http";
import { createUserSchema } from "@/lib/validation/user";
import { registerUserAudit } from "@/lib/audit/user-audit";
import { Prisma } from "@prisma/client";

export async function GET() {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    assertPermission(user.perfil, "user.manage");
    const data = await prisma.usuario.findMany({ orderBy: { criadoEm: "desc" } });
    return {
      data,
      pagination: { total: data.length, page: 1, pageSize: data.length, totalPages: 1 },
      meta: { resource: "users" }
    };
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const actor = await getCurrentApiUser();
    assertPermission(actor.perfil, "user.manage");

    const payload = createUserSchema.parse(await request.json());

    const created = await prisma.usuario.create({
      data: {
        authUserId: payload.authUserId,
        nome: payload.nome,
        email: payload.email,
        perfil: payload.perfil,
        ativo: payload.ativo ?? true
      }
    });

    await registerUserAudit({
      targetUserId: created.id,
      actor,
      action: "CREATE",
      after: created as unknown as Prisma.JsonObject
    });

    return { data: created };
  });
}
