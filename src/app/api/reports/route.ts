import { NextRequest } from "next/server";
import { getCurrentApiUser } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/permissions";
import { ticketFiltersSchema } from "@/lib/validation/ticket";
import { withApiHandler } from "@/lib/http";
import { getReportsData } from "@/lib/services/reports-service";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    assertPermission(user.perfil, "reports.full");

    const parsed = ticketFiltersSchema.partial().parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    return getReportsData(parsed, user);
  });
}
