import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { ticketSchema } from "@/lib/validation/ticket";
import { registerTicketAudit } from "@/lib/audit/ticket-audit";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { auditoria: { orderBy: { dataHora: "desc" }, take: 50 } }
  });
  if (!ticket) return NextResponse.json({ message: "Não encontrado" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasPermission(user.perfil, "ticket.update")) return NextResponse.json({ message: "Sem permissão" }, { status: 403 });

  const { id } = await params;
  const payload = ticketSchema.partial().parse(await request.json());
  const before = await prisma.ticket.findUniqueOrThrow({ where: { id } });

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...payload,
      atualizadoPorId: user.id,
      ...(payload.valorReembolso !== undefined || payload.valorColeta !== undefined
        ? {
            custosTotais: new Prisma.Decimal(
              Number(payload.valorReembolso ?? before.valorReembolso) + Number(payload.valorColeta ?? before.valorColeta)
            )
          }
        : {})
    }
  });

  await registerTicketAudit({
    ticketId: id,
    user,
    action: "UPDATE",
    before: before as unknown as Prisma.JsonObject,
    after: updated as unknown as Prisma.JsonObject
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasPermission(user.perfil, "ticket.soft_delete")) return NextResponse.json({ message: "Sem permissão" }, { status: 403 });
  const { id } = await params;

  const before = await prisma.ticket.findUniqueOrThrow({ where: { id } });
  const updated = await prisma.ticket.update({ where: { id }, data: { ativo: false, atualizadoPorId: user.id } });
  await registerTicketAudit({ ticketId: id, user, action: "SOFT_DELETE", before: before as unknown as Prisma.JsonObject, after: updated as unknown as Prisma.JsonObject });
  return NextResponse.json({ ok: true });
}
