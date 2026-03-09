import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentApiUser } from "@/lib/auth/session";
import { getTicketScopeWhere } from "@/lib/rbac/permissions";
import { withApiHandler } from "@/lib/http";
import { ticketFiltersSchema } from "@/lib/validation/ticket";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    const parsed = ticketFiltersSchema.partial().parse(Object.fromEntries(request.nextUrl.searchParams.entries()));

    const where = {
      ativo: true,
      ...getTicketScopeWhere(user),
      ...(parsed.empresa ? { empresa: parsed.empresa } : {}),
      ...(parsed.canalMarketplace ? { canalMarketplace: parsed.canalMarketplace } : {}),
      ...(parsed.statusTicket ? { statusTicket: parsed.statusTicket } : {}),
      ...(parsed.statusReclamacao ? { statusReclamacao: parsed.statusReclamacao } : {}),
      ...(parsed.motivo ? { motivo: parsed.motivo } : {}),
      ...(parsed.startDate || parsed.endDate
        ? {
            dataReclamacao: {
              ...(parsed.startDate ? { gte: new Date(parsed.startDate) } : {}),
              ...(parsed.endDate ? { lte: new Date(parsed.endDate) } : {})
            }
          }
        : {})
    };

    const [
      total,
      abertos,
      atrasados,
      agregados,
      porEmpresa,
      porMotivo,
      porStatus,
      porMarketplace,
      custosPorMarketplace,
      custosPorProduto,
      reembolsosPorEmpresa,
      ticketsPorMes
    ] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, statusTicket: { not: "CONCLUIDO" } } }),
      prisma.ticket.count({ where: { ...where, statusTicket: { not: "CONCLUIDO" }, prazoConclusao: { lt: new Date() } } }),
      prisma.ticket.aggregate({ _sum: { custosTotais: true, valorReembolso: true, valorColeta: true }, where }),
      prisma.ticket.groupBy({ by: ["empresa"], where, _count: true }),
      prisma.ticket.groupBy({ by: ["motivo"], where, _count: true }),
      prisma.ticket.groupBy({ by: ["statusTicket"], where, _count: true }),
      prisma.ticket.groupBy({ by: ["canalMarketplace"], where, _count: true }),
      prisma.ticket.groupBy({ by: ["canalMarketplace"], where, _sum: { custosTotais: true } }),
      prisma.ticket.groupBy({ by: ["produto"], where, _sum: { custosTotais: true } }),
      prisma.ticket.groupBy({ by: ["empresa"], where, _sum: { valorReembolso: true } }),
      prisma.ticket.groupBy({ by: ["anoReclamacao", "mesReclamacao"], where, _count: true })
    ]);

    return {
      cards: {
        totalTickets: total,
        ticketsAbertos: abertos,
        ticketsAtrasados: atrasados,
        custoTotal: Number(agregados._sum.custosTotais ?? 0),
        reembolsoTotal: Number(agregados._sum.valorReembolso ?? 0),
        coletaTotal: Number(agregados._sum.valorColeta ?? 0)
      },
      charts: {
        porEmpresa: porEmpresa.map((item) => ({ name: item.empresa, value: item._count })),
        porMotivo: porMotivo.map((item) => ({ name: item.motivo, value: item._count })),
        porStatus: porStatus.map((item) => ({ name: item.statusTicket, value: item._count })),
        porMarketplace: porMarketplace.map((item) => ({ name: item.canalMarketplace, value: item._count })),
        custosPorMarketplace: custosPorMarketplace.map((item) => ({ name: item.canalMarketplace, value: Number(item._sum.custosTotais ?? 0) })),
        custosPorProduto: custosPorProduto.map((item) => ({ name: item.produto, value: Number(item._sum.custosTotais ?? 0) })),
        reembolsosPorEmpresa: reembolsosPorEmpresa.map((item) => ({ name: item.empresa, value: Number(item._sum.valorReembolso ?? 0) })),
        ticketsPorMes: ticketsPorMes
          .map((item) => ({ name: `${item.anoReclamacao}-${String(item.mesReclamacao).padStart(2, "0")}`, value: item._count }))
          .sort((a, b) => a.name.localeCompare(b.name))
      }
    };
  });
}
