import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { createTicket, listTickets } from "@/lib/services/tickets-service";
import { ticketSchema } from "@/lib/validation/ticket";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
  const data = await listTickets({ search, page });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!hasPermission(user.perfil, "ticket.create")) {
    return NextResponse.json({ message: "Sem permissão" }, { status: 403 });
  }

  const payload = ticketSchema.parse(await request.json());
  const ticket = await createTicket(payload, user.id);
  return NextResponse.json(ticket, { status: 201 });
}
