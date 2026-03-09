import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { UnauthorizedError } from "@/lib/errors";

export default async function Home() {
  try {
    await getCurrentUser();
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }

    throw error;
  }
}
