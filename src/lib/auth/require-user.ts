import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { UnauthorizedError } from "@/lib/errors";

export async function requireCurrentUser() {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }

    throw error;
  }
}
