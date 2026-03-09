import { NextRequest } from "next/server";
import { Perfil } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentApiUser } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/permissions";
import { withApiHandler } from "@/lib/http";

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

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    assertPermission(user.perfil, "user.manage");
    const payload = (await request.json()) as {
      authUserId: string;
      nome: string;
      email: string;
      perfil: Perfil;
      ativo?: boolean;
    };

    const created = await prisma.usuario.create({
      data: {
        authUserId: payload.authUserId,
        nome: payload.nome,
        email: payload.email,
        perfil: payload.perfil,
        ativo: payload.ativo ?? true
      }
    });

    return { data: created };
  });
}
