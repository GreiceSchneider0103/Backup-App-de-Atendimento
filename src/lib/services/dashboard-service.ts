import { Perfil, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getTicketScopeWhere } from "@/lib/rbac/permissions";
import { type TicketFiltersInput } from "@/lib/validation/ticket";

type DashboardFilters = Partial<Pick<TicketFiltersInput, "empresa" | "canalMarketplace" | "statusTicket" | "statusReclamacao" | "motivo" | "startDate" | "endDate">>;

function getDateRange(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return undefined;
  return {
    ...(startDate ? { gte: new Date(startDate) } : {}),
    ...(endDate ? { lte: new Date(endDate) } : {})
  };
}

export async function getDashboardData(filters: DashboardFilters, user: { id: string; perfil: Perfil }) {
  const where: Prisma.TicketWhereInput = {
    ativo: true,
    ...getTicketScopeWhere(user),
    ...(filters.empresa ? { empresa: filters.empresa } : {}),
    ...(filters.canalMarketplace ? { canalMarketplace: filters.canalMarketplace } : {}),
    ...(filters.statusTicket ? { statusTicket: filters.statusTicket } : {}),
    ...(filters.statusReclamacao ? { statusReclamacao: filters.statusReclamacao } : {}),
    ...(filters.motivo ? { motivo: filters.motivo } : {}),
    ...(getDateRange(filters.startDate, filters.endDate) ? { dataReclamacao: getDateRange(filters.startDate, filters.endDate) } : {})
  };

  const [total, abertos, atrasados, agregados, porEmpresa, porMotivo, porStatus, porMarketplace, custosPorMarketplace, custosPorProduto, reembolsosPorEmpresa, ticketsPorMes] = await Promise.all([
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
      custoTotal: Number((agregados as any)?._sum?.custosTotais ?? 0),
      reembolsoTotal: Number((agregados as any)?._sum?.valorReembolso ?? 0),
      coletaTotal: Number((agregados as any)?._sum?.valorColeta ?? 0)
    },
    charts: {
      porEmpresa: porEmpresa.map((item: any) => ({ name: item.empresa, value: Number(item?._count?._all ?? item?._count ?? 0) })),
      porMotivo: porMotivo.map((item: any) => ({ name: item.motivo, value: Number(item?._count?._all ?? item?._count ?? 0) })),
      porStatus: porStatus.map((item: any) => ({ name: item.statusTicket, value: Number(item?._count?._all ?? item?._count ?? 0) })),
      porMarketplace: porMarketplace.map((item: any) => ({ name: item.canalMarketplace, value: Number(item?._count?._all ?? item?._count ?? 0) })),
      custosPorMarketplace: custosPorMarketplace.map((item: any) => ({ name: item.canalMarketplace, value: Number(item?._sum?.custosTotais ?? 0) })),
      custosPorProduto: custosPorProduto.map((item: any) => ({ name: item.produto, value: Number(item?._sum?.custosTotais ?? 0) })),
      reembolsosPorEmpresa: reembolsosPorEmpresa.map((item: any) => ({ name: item.empresa, value: Number(item?._sum?.valorReembolso ?? 0) })),
      ticketsPorMes: ticketsPorMes
        .map((item: any) => ({ name: `${item.anoReclamacao}-${String(item.mesReclamacao).padStart(2, "0")}`, value: Number(item?._count?._all ?? item?._count ?? 0) }))
        .sort((a, b) => a.name.localeCompare(b.name))
    }
  };
}
