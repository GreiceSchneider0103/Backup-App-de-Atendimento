import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function ensureUrlParam(url: string, key: string, value: string) {
  const parsed = new URL(url);
  if (!parsed.searchParams.has(key)) {
    parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}

export function normalizeDatabaseUrl(rawUrl?: string) {
  if (!rawUrl) return undefined;

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    const isSupabasePooler = host.includes("pooler.supabase.com");

    let normalized = rawUrl;

    if (isSupabasePooler) {
      normalized = ensureUrlParam(normalized, "pgbouncer", "true");
      normalized = ensureUrlParam(normalized, "connection_limit", "1");
      normalized = ensureUrlParam(normalized, "sslmode", "require");
    }

    return normalized;
  } catch {
    return rawUrl;
  }
}

const normalizedDatabaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    ...(normalizedDatabaseUrl
      ? {
          datasources: {
            db: {
              url: normalizedDatabaseUrl
            }
          }
        }
      : {})
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
