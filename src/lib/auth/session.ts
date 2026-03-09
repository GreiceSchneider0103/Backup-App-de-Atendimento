import { cookies } from "next/headers";
import { createRouteHandlerClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

async function getAppUserByAuthId(authUserId: string) {
  const appUser = await prisma.usuario.findUnique({ where: { authUserId } });
  if (!appUser) throw new ForbiddenError("Usuário não provisionado no sistema");
  if (!appUser.ativo) throw new ForbiddenError("Usuário inativo");
  return appUser;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) throw new UnauthorizedError();
  return getAppUserByAuthId(user.id);
}

export async function getCurrentApiUser() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) throw new UnauthorizedError();
  return getAppUserByAuthId(user.id);
}
