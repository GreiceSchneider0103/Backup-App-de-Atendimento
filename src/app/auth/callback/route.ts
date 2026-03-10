import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

const AUTH_CALLBACK_TIMEOUT_MS = Number(process.env.AUTH_TIMEOUT_MS ?? 8000);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error("AUTH_CALLBACK_TIMEOUT")), ms);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const supabase = await createSupabaseRouteClient();
    await withTimeout(supabase.auth.exchangeCodeForSession(code), AUTH_CALLBACK_TIMEOUT_MS);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
