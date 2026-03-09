import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentApiUser } from "@/lib/auth/session";
import { assertPermission, getTicketScopeWhere } from "@/lib/rbac/permissions";
import { ticketFiltersSchema } from "@/lib/validation/ticket";
import { withApiHandler } from "@/lib/http";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    assertPermission(user.perfil, "reports.full");

    const parsed = ticketFiltersSchema.partial().parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    const where = {
      ativo: true,
      ...getTicketScopeWhere(user),
      ...(parsed.empresa ? { empresa: parsed.empresa } : {}),
      ...(parsed.canalMarketplace ? { canalMarketplace: parsed.canalMarketplace } : {}),
      ...(parsed.statusTicket ? { statusTicket: parsed.statusTicket } : {}),
      ...(parsed.statusReclamacao ? { statusReclamacao: parsed.statusReclamacao } : {}),
      ...(parsed.motivo ? { motivo: parsed.motivo } : {}),
      ...(parsed.responsavelId ? { responsavelId: parsed.responsavelId } : {}),
      ...(parsed.startDate || parsed.endDate
        ? {
            dataReclamacao: {
              ...(parsed.startDate ? { gte: new Date(parsed.startDate) } : {}),
              ...(parsed.endDate ? { lte: new Date(parsed.endDate) } : {})
            }
          }
        : {})
    };

    const limit = 500;
    const [items, totals] = await Promise.all([
      prisma.ticket.findMany({ where, orderBy: { criadoEm: "desc" }, take: limit }),
      prisma.ticket.aggregate({ where, _sum: { custosTotais: true, valorColeta: true, valorReembolso: true }, _count: true })
    ]);

    return {
      items,
      totals: {
        totalTickets: totals._count,
        totalCustos: Number(totals._sum.custosTotais ?? 0),
        totalReembolso: Number(totals._sum.valorReembolso ?? 0),
        totalColeta: Number(totals._sum.valorColeta ?? 0)
      },
      meta: {
        limit,
        returned: items.length,
        totalAvailable: totals._count,
        truncated: totals._count > items.length
      }
    };
  });
}
