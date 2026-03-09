import { PrismaClient, Perfil } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.usuario.upsert({
    where: { email: "admin@lessul.local" },
    update: {},
    create: {
      authUserId: "seed-admin-auth-id",
      nome: "Administrador Geral",
      email: "admin@lessul.local",
      perfil: Perfil.ADMIN,
      ativo: true
    }
  });
}

main().finally(async () => prisma.$disconnect());
