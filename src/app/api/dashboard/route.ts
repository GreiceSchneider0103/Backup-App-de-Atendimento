import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const [total, abertos, atrasados, agregados] = await Promise.all([
    prisma.ticket.count({ where: { ativo: true } }),
    prisma.ticket.count({ where: { ativo: true, statusTicket: { not: "CONCLUIDO" } } }),
    prisma.ticket.count({ where: { ativo: true, statusTicket: { not: "CONCLUIDO" }, prazoConclusao: { lt: new Date() } } }),
    prisma.ticket.aggregate({ _sum: { custosTotais: true, valorReembolso: true, valorColeta: true }, where: { ativo: true } })
  ]);

  return NextResponse.json({
    cards: {
      totalTickets: total,
      ticketsAbertos: abertos,
      ticketsAtrasados: atrasados,
      custoTotal: Number(agregados._sum.custosTotais ?? 0),
      reembolsoTotal: Number(agregados._sum.valorReembolso ?? 0),
      coletaTotal: Number(agregados._sum.valorColeta ?? 0)
    }
  });
}
