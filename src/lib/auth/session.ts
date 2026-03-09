import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export async function getCurrentUser() {
  const headerStore = await headers();
  const email = headerStore.get("x-user-email") ?? "admin@lessul.local";
  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user || !user.ativo) {
    throw new Error("Usuário sem acesso ou inativo.");
  }

  return user;
}
