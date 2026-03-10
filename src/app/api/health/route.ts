import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logError } from "@/lib/logger";

function hasRuntimeEnv() {
  return Boolean(process.env.DATABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function GET() {
  const runtimeEnvConfigured = hasRuntimeEnv();

  let databaseReachable = false;
  let databaseStatus: "up" | "down" | "not_configured" = "not_configured";

  if (runtimeEnvConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseReachable = true;
      databaseStatus = "up";
    } catch (error) {
      databaseStatus = "down";
      logError("Healthcheck database probe failed", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const ok = databaseReachable || !runtimeEnvConfigured;

  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      service: "lessul-go-atendimento",
      runtimeEnvConfigured,
      directUrlConfigured: Boolean(process.env.DIRECT_URL),
      databaseReachable,
      databaseStatus,
      timestamp: new Date().toISOString()
    },
    { status: ok ? 200 : 503 }
  );
}
