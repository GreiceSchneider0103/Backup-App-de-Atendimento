import { prisma } from "@/lib/db/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { createSupabaseRouteClient, createSupabaseServerClient } from "@/lib/supabase/server";

async function getAppUserByAuthId(authUserId: string) {
  const appUser = await prisma.usuario.findUnique({ where: { authUserId } });
  if (!appUser) throw new ForbiddenError("Usuário não provisionado no sistema");
  if (!appUser.ativo) throw new ForbiddenError("Usuário inativo");
  return appUser;
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
