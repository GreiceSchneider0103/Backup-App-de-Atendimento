import { NextRequest } from "next/server";
import { getCurrentApiUser } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/permissions";
import { ticketSchema } from "@/lib/validation/ticket";
import { withApiHandler } from "@/lib/http";
import { getTicketById, softDeleteTicket, updateTicket } from "@/lib/services/tickets-service";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    const { id } = await params;
    return getTicketById(id, user);
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    assertPermission(user.perfil, "ticket.update");

    const { id } = await params;
    const payload = ticketSchema.partial().parse(await request.json());
    return updateTicket(id, payload, user);
  });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    assertPermission(user.perfil, "ticket.soft_delete");
    const { id } = await params;
    return softDeleteTicket(id, user);
  });
}
