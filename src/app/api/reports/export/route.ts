import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db/prisma";
import { getCurrentApiUser } from "@/lib/auth/session";
import { assertPermission, getTicketScopeWhere } from "@/lib/rbac/permissions";
import { ticketFiltersSchema } from "@/lib/validation/ticket";
import { withApiHandler } from "@/lib/http";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    assertPermission(user.perfil, "reports.export");

    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const format = params.format ?? "csv";
    const parsed = ticketFiltersSchema.partial().parse(params);

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

    const tickets = await prisma.ticket.findMany({ where, orderBy: { criadoEm: "desc" } });
    const data = tickets.map((ticket) => ({
      id: ticket.id,
      nome_cliente: ticket.nomeCliente,
      numero_venda: ticket.numeroVenda,
      empresa: ticket.empresa,
      marketplace: ticket.canalMarketplace,
      motivo: ticket.motivo,
      status_ticket: ticket.statusTicket,
      custo_total: Number(ticket.custosTotais),
      valor_reembolso: Number(ticket.valorReembolso),
      valor_coleta: Number(ticket.valorColeta)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "tickets");

    if (format === "xlsx") {
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="tickets.xlsx"'
        }
      });
    }

    const csv = XLSX.utils.sheet_to_csv(worksheet);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tickets.csv"'
      }
    });
  });
}
