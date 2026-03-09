import { cookies } from "next/headers";
import { createRouteHandlerClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export async function createSupabaseServerClient() {
  return createServerComponentClient({ cookies });
}

export async function createSupabaseRouteClient() {
  return createRouteHandlerClient({ cookies });
}
