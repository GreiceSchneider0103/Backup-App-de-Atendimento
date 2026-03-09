import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenError, ServiceUnavailableError, UnauthorizedError } from "@/lib/errors";
import { createSupabaseRouteClient, createSupabaseServerClient } from "@/lib/supabase/server";

function mapDatabaseAuthError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new ServiceUnavailableError("Banco de dados indisponível. Verifique allow_list/rede do provedor.");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientUnknownRequestError) {
    const message = String(error.message);
    if (message.includes("allow_list") || message.includes("Address not in tenant allow_list")) {
      throw new ServiceUnavailableError("Banco bloqueado por allow_list. Libere o IP de saída do servidor no provedor de banco.");
    }
  }

  throw error;
}

async function getAppUserByAuthId(authUserId: string) {
  try {
    const appUser = await prisma.usuario.findUnique({ where: { authUserId } });
    if (!appUser) throw new ForbiddenError("Usuário não provisionado no sistema");
    if (!appUser.ativo) throw new ForbiddenError("Usuário inativo");
    return appUser;
  } catch (error) {
    mapDatabaseAuthError(error);
  }
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) throw new UnauthorizedError();
  return getAppUserByAuthId(user.id);
}

export async function getCurrentApiUser() {
  const supabase = await createSupabaseRouteClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) throw new UnauthorizedError();
  return getAppUserByAuthId(user.id);
}
