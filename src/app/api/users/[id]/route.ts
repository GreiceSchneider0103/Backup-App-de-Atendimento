import { NextRequest } from "next/server";
import { Perfil } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentApiUser } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/permissions";
import { withApiHandler } from "@/lib/http";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const actor = await getCurrentApiUser();
    assertPermission(actor.perfil, "user.manage");
    const { id } = await params;
    const payload = (await request.json()) as { nome?: string; perfil?: Perfil; ativo?: boolean };
    const updated = await prisma.usuario.update({ where: { id }, data: payload });
    return { data: updated };
  });
}
