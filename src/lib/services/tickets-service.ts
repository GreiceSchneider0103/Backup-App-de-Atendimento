import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { registerTicketAudit } from "@/lib/audit/ticket-audit";
import { TicketInput } from "@/lib/validation/ticket";

export async function listTickets(query: { page?: number; pageSize?: number; search?: string }) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  const where: Prisma.TicketWhereInput = {
    ativo: true,
    ...(query.search
      ? {
          OR: [
            { nomeCliente: { contains: query.search, mode: "insensitive" } },
            { numeroVenda: { contains: query.search, mode: "insensitive" } },
            { canalMarketplace: { contains: query.search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { criadoPor: true, atualizadoPor: true }
    }),
    prisma.ticket.count({ where })
  ]);

  return { items, total, page, pageSize };
}

export async function createTicket(input: TicketInput, userId: string) {
  const ticket = await prisma.ticket.create({
    data: {
      ...input,
      dataCompra: new Date(input.dataCompra),
      dataReclamacao: new Date(input.dataReclamacao),
      prazoConclusao: input.prazoConclusao ? new Date(input.prazoConclusao) : null,
      valorReembolso: new Prisma.Decimal(input.valorReembolso),
      valorColeta: new Prisma.Decimal(input.valorColeta),
      custosTotais: new Prisma.Decimal(input.valorReembolso + input.valorColeta),
      criadoPorId: userId,
      atualizadoPorId: userId
    }
  });

  const user = await prisma.usuario.findUniqueOrThrow({ where: { id: userId } });
  await registerTicketAudit({ ticketId: ticket.id, user, action: "CREATE", after: ticket as unknown as Prisma.JsonObject });
  return ticket;
}
