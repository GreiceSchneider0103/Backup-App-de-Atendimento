import { NextRequest } from "next/server";
import { getCurrentApiUser } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/permissions";
import { createTicket, listTickets } from "@/lib/services/tickets-service";
import { ticketFiltersSchema, ticketSchema } from "@/lib/validation/ticket";
import { withApiHandler } from "@/lib/http";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    const filters = ticketFiltersSchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    return listTickets(filters, user);
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    assertPermission(user.perfil, "ticket.create");
    const payload = ticketSchema.parse(await request.json());
    return createTicket(payload, user.id);
  });
}
