import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  const tickets = await prisma.ticket.findMany({ where: { ativo: true }, orderBy: { criadoEm: "desc" } });
  const data = tickets.map((ticket) => ({
    id: ticket.id,
    nome_cliente: ticket.nomeCliente,
    numero_venda: ticket.numeroVenda,
    empresa: ticket.empresa,
    motivo: ticket.motivo,
    status_ticket: ticket.statusTicket,
    custo_total: Number(ticket.custosTotais)
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "tickets");

  if (format === "xlsx") {
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" } });
  }

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
}
