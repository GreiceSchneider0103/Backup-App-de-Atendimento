import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const publicRoutes = ["/login", "/auth/callback", "/api/health"];

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function middleware(request: NextRequest) {
  if (publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!hasSupabaseEnv()) {
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ message: "Autenticação não configurada no ambiente" }, { status: 503 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
