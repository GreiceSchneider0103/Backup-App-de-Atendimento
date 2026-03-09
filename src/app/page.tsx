import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ServiceUnavailableError, UnauthorizedError } from "@/lib/errors";

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export default async function Home() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  try {
    await getCurrentUser();
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }

    if (error instanceof ServiceUnavailableError) {
      redirect("/indisponivel");
    }

    throw error;
  }
}
