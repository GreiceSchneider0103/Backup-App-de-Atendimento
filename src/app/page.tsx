import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function hasSupabaseSessionCookie(cookieNames: string[]) {
  return cookieNames.some((name) => name.includes("-auth-token"));
}

export default async function Home() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const cookieNames = cookieStore.getAll().map((cookie) => cookie.name);

  if (hasSupabaseSessionCookie(cookieNames)) {
    redirect("/dashboard");
  }

  redirect("/login");
}
