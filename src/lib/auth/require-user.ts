import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export async function requireCurrentUser() {
  try {
    return await getCurrentUser();
  } catch {
    redirect("/login");
  }
}
