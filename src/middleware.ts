import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login"];

export function middleware(request: NextRequest) {
  if (publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const email = request.headers.get("x-user-email");
  if (!email && request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
