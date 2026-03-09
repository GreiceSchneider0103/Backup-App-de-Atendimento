"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return <button onClick={logout}>Sair</button>;
}
