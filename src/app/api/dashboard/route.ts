import { NextRequest } from "next/server";
import { getCurrentApiUser } from "@/lib/auth/session";
import { ticketFiltersSchema } from "@/lib/validation/ticket";
import { withApiHandler } from "@/lib/http";
import { getDashboardData } from "@/lib/services/dashboard-service";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await getCurrentApiUser();
    const parsed = ticketFiltersSchema.partial().parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    return getDashboardData(parsed, user);
  });
}
