import { Perfil, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getTicketScopeWhere } from "@/lib/rbac/permissions";
import { type TicketFiltersInput } from "@/lib/validation/ticket";

type ReportFilters = Partial<Pick<TicketFiltersInput, "empresa" | "canalMarketplace" | "statusTicket" | "statusReclamacao" | "motivo" | "responsavelId" | "startDate" | "endDate">>;

function getDateRange(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return undefined;
  return {
    ...(startDate ? { gte: new Date(startDate) } : {}),
    ...(endDate ? { lte: new Date(endDate) } : {})
  };
}

export async function getReportsData(filters: ReportFilters, user: { id: string; perfil: Perfil }) {
  const where: Prisma.TicketWhereInput = {
    ativo: true,
    ...getTicketScopeWhere(user),
    ...(filters.empresa ? { empresa: filters.empresa } : {}),
    ...(filters.canalMarketplace ? { canalMarketplace: filters.canalMarketplace } : {}),
    ...(filters.statusTicket ? { statusTicket: filters.statusTicket } : {}),
    ...(filters.statusReclamacao ? { statusReclamacao: filters.statusReclamacao } : {}),
    ...(filters.motivo ? { motivo: filters.motivo } : {}),
    ...(filters.responsavelId ? { responsavelId: filters.responsavelId } : {}),
    ...(getDateRange(filters.startDate, filters.endDate) ? { dataReclamacao: getDateRange(filters.startDate, filters.endDate) } : {})
  };

  const limit = 500;
  const [items, totals] = await Promise.all([
    prisma.ticket.findMany({ where, orderBy: { criadoEm: "desc" }, take: limit }),
    prisma.ticket.aggregate({ where, _sum: { custosTotais: true, valorColeta: true, valorReembolso: true }, _count: { _all: true } })
  ]);

  const totalCount = Number((totals as any)?._count?._all ?? 0);
  return {
    items,
    totals: {
      totalTickets: totalCount,
      totalCustos: Number((totals as any)?._sum?.custosTotais ?? 0),
      totalReembolso: Number((totals as any)?._sum?.valorReembolso ?? 0),
      totalColeta: Number((totals as any)?._sum?.valorColeta ?? 0)
    },
    meta: {
      limit,
      returned: items.length,
      totalAvailable: totalCount,
      truncated: totalCount > items.length
    }
  };
}
