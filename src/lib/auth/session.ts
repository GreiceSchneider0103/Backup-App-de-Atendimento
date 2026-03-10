import { Prisma, Usuario } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenError, ServiceUnavailableError, UnauthorizedError } from "@/lib/errors";
import { createSupabaseRouteClient, createSupabaseServerClient } from "@/lib/supabase/server";

const AUTH_TIMEOUT_MS = Number(process.env.AUTH_TIMEOUT_MS ?? 8000);

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new ServiceUnavailableError(`Timeout ao consultar ${label}`));
    }, ms);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function mapDatabaseAuthError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new ServiceUnavailableError("Banco de dados indisponível. Verifique DATABASE_URL/DIRECT_URL (Supabase pooler) e SSL.");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientUnknownRequestError) {
    const message = String(error.message);
    if (message.includes("allow_list") || message.includes("Address not in tenant allow_list")) {
      throw new ServiceUnavailableError("Banco bloqueado por allow_list. Libere o IP de saída do servidor no provedor de banco.");
    }
  }

  throw error;
}

async function getAppUserByAuthId(authUserId: string): Promise<Usuario> {
  try {
    const appUser = await withTimeout(
      prisma.usuario.findUnique({ where: { authUserId } }),
      AUTH_TIMEOUT_MS,
      "usuário no banco"
    );

    if (!appUser) throw new ForbiddenError("Usuário não provisionado no sistema");
    if (!appUser.ativo) throw new ForbiddenError("Usuário inativo");
    return appUser;
  } catch (error) {
    mapDatabaseAuthError(error);
  }
}

async function resolveAuthenticatedUser(isApiContext: boolean) {
  const supabase = isApiContext ? await createSupabaseRouteClient() : await createSupabaseServerClient();

  try {
    const {
      data: { user },
      error
    } = await withTimeout(
      supabase.auth.getUser(),
      AUTH_TIMEOUT_MS,
      "sessão do Supabase"
    );

    if (error || !user) throw new UnauthorizedError();
    return getAppUserByAuthId(user.id);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError || error instanceof ServiceUnavailableError) {
      throw error;
    }

    throw new ServiceUnavailableError("Falha ao consultar autenticação do Supabase");
  }
}

export async function getCurrentUser() {
  return resolveAuthenticatedUser(false);
}

export async function getCurrentApiUser() {
  return resolveAuthenticatedUser(true);
}
