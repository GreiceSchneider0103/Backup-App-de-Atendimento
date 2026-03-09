import { headers } from "next/headers";

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export async function fetchInternalApi(path: string, init?: RequestInit) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Host indisponível para chamada interna da API");
  }

  const url = `${protocol}://${host}${normalizePath(path)}`;
  const cookie = requestHeaders.get("cookie") ?? "";

  const mergedHeaders = new Headers(init?.headers);
  if (cookie) mergedHeaders.set("cookie", cookie);

  return fetch(url, {
    ...init,
    headers: mergedHeaders,
    cache: init?.cache ?? "no-store"
  });
}
